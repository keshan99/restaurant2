const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config();
const db = require('./db');
const storage = require('./storage');
const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Middleware
app.use(cors());
app.use(express.json());
app.use('/photos', express.static('photos'));

// Serve GCS images when signed URLs are not available (e.g. local dev with user ADC). Path is URL-encoded, e.g. dishes%2Ffoo.jpg
app.get(/^\/api\/image\/(.*)$/, (req, res, next) => {
    const raw = req.path.slice('/api/image/'.length);
    const objectPath = decodeURIComponent(raw);
    if (!objectPath || objectPath.includes('..')) return res.status(400).send('Invalid path');
    storage.streamFile(objectPath, res, next);
});

// Upload image to GCS (private bucket). Returns { path, url } for storing in DB.
app.post('/api/upload', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
    }
    try {
        const ext = (req.file.originalname && req.file.originalname.includes('.'))
            ? req.file.originalname.slice(req.file.originalname.lastIndexOf('.'))
            : (req.file.mimetype === 'image/jpeg' ? '.jpg' : req.file.mimetype === 'image/png' ? '.png' : '.jpg');
        const path = `dishes/${crypto.randomUUID()}${ext}`;
        await storage.uploadBuffer(path, req.file.buffer, req.file.mimetype);
        const url = await storage.getImageUrl(path);
        res.json({ path, url: url || path });
    } catch (err) {
        if (!storage.BUCKET_NAME) {
            return res.status(503).json({ error: 'Upload not configured; set GCS_BUCKET_NAME' });
        }
        next(err);
    }
});

// Routes
// 1. Get Menu Items
app.get('/api/menu', async (req, res, next) => {
    try {
        const todayResult = await db.query("SELECT * FROM menu_items WHERE available_day = 'today'");
        const tomorrowResult = await db.query("SELECT * FROM menu_items WHERE available_day = 'tomorrow'");

        // Helper to group by category
        const groupByCategory = (items) => {
            const grouped = { mains: [], sides: [], desserts: [] };
            items.forEach(item => {
                if (grouped[item.category]) {
                    grouped[item.category].push({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        price: parseFloat(item.price),
                        isVeg: item.is_veg,
                        categoryId: item.category,
                        description: item.description
                    });
                }
            });
            return grouped;
        };

        const response = {
            today: groupByCategory(todayResult.rows),
            tomorrow: groupByCategory(tomorrowResult.rows),
            nextDay: { mains: [], sides: [], desserts: [] } // Placeholder
        };

        res.json(response);
    } catch (err) {
        next(err);
    }
});

// 2. Add Menu Item (Admin)
app.post('/api/menu', async (req, res, next) => {
    const { name, category, price, description, is_veg, image, available_day } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO menu_items (name, category, price, description, is_veg, image, available_day) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                name,
                category || 'mains',
                price,
                description || '',
                is_veg || false,
                image || 'https://placehold.co/400x300?text=Yummy',
                available_day || 'today'
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// 3. Create Booking
app.post('/api/bookings', async (req, res, next) => {
    const { name, email, phone, date, time, guests } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO bookings (name, email, phone, date, time, guests) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, phone, date, time, guests]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// ========== NEW MENU MANAGEMENT SYSTEM ==========

// FOOD ITEMS (Library) - CRUD Operations

// Get all food items (with optional filters)
app.get('/api/food-items', async (req, res, next) => {
    try {
        const { category, active } = req.query;
        let query = 'SELECT * FROM food_items WHERE 1=1';
        const params = [];

        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }
        if (active !== undefined) {
            params.push(active === 'true');
            query += ` AND is_active = $${params.length}`;
        }

        query += ' ORDER BY category, name';
        const result = await db.query(query, params);
        const rows = await storage.resolveImages(result.rows);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// Get single food item by ID
app.get('/api/food-items/:id', async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM food_items WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        const row = result.rows[0];
        row.imageUrl = await storage.resolveImage(row.image);
        res.json(row);
    } catch (err) {
        next(err);
    }
});

// Create new food item
app.post('/api/food-items', async (req, res, next) => {
    const { name, category, price, description, image, is_veg, spice_level, tags, allergens } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO food_items (name, category, price, description, image, is_veg, spice_level, tags, allergens, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING *`,
            [name, category, price, description || '', image || '', is_veg || false, spice_level || 'none', tags || [], allergens || []]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Update food item
app.put('/api/food-items/:id', async (req, res, next) => {
    const { name, category, price, description, image, is_veg, spice_level, tags, allergens, is_active } = req.body;
    try {
        const result = await db.query(
            `UPDATE food_items 
             SET name = $1, category = $2, price = $3, description = $4, image = $5, 
                 is_veg = $6, spice_level = $7, tags = $8, allergens = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP
             WHERE id = $11 RETURNING *`,
            [name, category, price, description, image, is_veg, spice_level || 'none', tags || [], allergens || [], is_active !== undefined ? is_active : true, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Delete food item
app.delete('/api/food-items/:id', async (req, res, next) => {
    try {
        const result = await db.query('DELETE FROM food_items WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// MENUS - Date-based Menu Management

// Get menu for a specific date (or default if not found)
app.get('/api/menus', async (req, res, next) => {
    try {
        const { date } = req.query;
        let menuId;
        let usedDateMenu = false;

        if (date) {
            const menuResult = await db.query('SELECT id FROM menus WHERE menu_date = $1', [date]);
            if (menuResult.rows.length > 0) {
                menuId = menuResult.rows[0].id;
                usedDateMenu = true;
            }
        }

        if (!menuId) {
            const defaultResult = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
            if (defaultResult.rows.length === 0) {
                return res.json({ items: [], isDefault: true });
            }
            menuId = defaultResult.rows[0].id;
        }

        const itemsResult = await db.query(`
            SELECT f.*, mfi.display_order, mfi.discount_type, mfi.discount_value
            FROM food_items f
            JOIN menu_food_items mfi ON f.id = mfi.food_item_id
            WHERE mfi.menu_id = $1 AND f.is_active = true
            ORDER BY mfi.display_order, f.category, f.name
        `, [menuId]);

        const items = await storage.resolveImages(itemsResult.rows);
        res.json({ items, isDefault: !usedDateMenu });
    } catch (err) {
        next(err);
    }
});

// List all dates that have a special (custom) menu
app.get('/api/menus/special-dates', async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT m.id, m.menu_date, m.name,
                   (SELECT COUNT(*) FROM menu_food_items WHERE menu_id = m.id) AS item_count
            FROM menus m
            WHERE m.menu_date IS NOT NULL AND (m.is_default = false OR m.is_default IS NULL)
            ORDER BY m.menu_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// Get default menu (id + items)
app.get('/api/menus/default', async (req, res, next) => {
    try {
        const menuResult = await db.query('SELECT * FROM menus WHERE is_default = true LIMIT 1');
        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'No default menu found' });
        }

        const menuId = menuResult.rows[0].id;
        const itemsResult = await db.query(`
            SELECT f.*, mfi.display_order, mfi.discount_type, mfi.discount_value
            FROM food_items f
            JOIN menu_food_items mfi ON f.id = mfi.food_item_id
            WHERE mfi.menu_id = $1 AND f.is_active = true
            ORDER BY mfi.display_order, f.category, f.name
        `, [menuId]);

        const items = await storage.resolveImages(itemsResult.rows);
        res.json({ menu: menuResult.rows[0], items });
    } catch (err) {
        next(err);
    }
});

// Add one food item to default menu (optional discount_type: 'percent'|'fixed', discount_value)
app.post('/api/menus/default/items', async (req, res, next) => {
    const { food_item_id, discount_type, discount_value } = req.body;
    if (!food_item_id) {
        return res.status(400).json({ error: 'food_item_id required' });
    }
    try {
        const menuResult = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'No default menu found' });
        }
        const menuId = menuResult.rows[0].id;
        const maxOrder = await db.query(
            'SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM menu_food_items WHERE menu_id = $1',
            [menuId]
        );
        const order = maxOrder.rows[0].next_order;
        const dType = discount_type === 'percent' || discount_type === 'fixed' ? discount_type : null;
        const dVal = dType && discount_value != null && Number(discount_value) >= 0 ? Number(discount_value) : null;
        await db.query(
            `INSERT INTO menu_food_items (menu_id, food_item_id, display_order, discount_type, discount_value)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (menu_id, food_item_id) DO UPDATE SET display_order = EXCLUDED.display_order, discount_type = EXCLUDED.discount_type, discount_value = EXCLUDED.discount_value`,
            [menuId, food_item_id, order, dType, dVal]
        );
        res.status(201).json({ message: 'Added to default menu' });
    } catch (err) {
        next(err);
    }
});

// Update discount for one item on default menu
app.patch('/api/menus/default/items/:food_item_id', async (req, res, next) => {
    const { discount_type, discount_value } = req.body;
    const food_item_id = req.params.food_item_id;
    try {
        const menuResult = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'No default menu found' });
        }
        const menuId = menuResult.rows[0].id;
        const dType = discount_type === 'percent' || discount_type === 'fixed' ? discount_type : null;
        const dVal = dType && discount_value != null && Number(discount_value) >= 0 ? Number(discount_value) : null;
        const result = await db.query(
            `UPDATE menu_food_items SET discount_type = $1, discount_value = $2 WHERE menu_id = $3 AND food_item_id = $4 RETURNING *`,
            [dType, dVal, menuId, food_item_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not on default menu' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Remove one food item from default menu
app.delete('/api/menus/default/items/:food_item_id', async (req, res, next) => {
    const food_item_id = req.params.food_item_id;
    try {
        const menuResult = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'No default menu found' });
        }
        const menuId = menuResult.rows[0].id;
        await db.query(
            'DELETE FROM menu_food_items WHERE menu_id = $1 AND food_item_id = $2',
            [menuId, food_item_id]
        );
        res.json({ message: 'Removed from default menu' });
    } catch (err) {
        next(err);
    }
});

// Create or update menu for a specific date (upsert by date)
// Body: menu_date, name?, items: [{ food_item_id, discount_type?, discount_value? }] OR legacy food_item_ids: number[]
app.post('/api/menus', async (req, res, next) => {
    const { menu_date, name, food_item_ids, items } = req.body;
    try {
        if (!menu_date) {
            return res.status(400).json({ error: 'menu_date required for date-specific menu' });
        }

        let menuId;
        const existing = await db.query('SELECT id FROM menus WHERE menu_date = $1', [menu_date]);
        if (existing.rows.length > 0) {
            menuId = existing.rows[0].id;
            await db.query('DELETE FROM menu_food_items WHERE menu_id = $1', [menuId]);
        } else {
            const menuResult = await db.query(
                'INSERT INTO menus (menu_date, is_default, name) VALUES ($1, false, $2) RETURNING id',
                [menu_date, name || `Menu for ${menu_date}`]
            );
            menuId = menuResult.rows[0].id;
        }

        const entries = Array.isArray(items) && items.length > 0
            ? items.map((it) => ({
                food_item_id: it.food_item_id,
                discount_type: it.discount_type === 'percent' || it.discount_type === 'fixed' ? it.discount_type : null,
                discount_value: it.discount_value != null && Number(it.discount_value) >= 0 ? Number(it.discount_value) : null
            }))
            : (food_item_ids || []).map((id) => ({ food_item_id: id, discount_type: null, discount_value: null }));

        for (let i = 0; i < entries.length; i++) {
            const e = entries[i];
            const dType = e.discount_type || null;
            const dVal = e.discount_value != null ? e.discount_value : null;
            await db.query(
                'INSERT INTO menu_food_items (menu_id, food_item_id, display_order, discount_type, discount_value) VALUES ($1, $2, $3, $4, $5)',
                [menuId, e.food_item_id, i, dType, dVal]
            );
        }

        const menuRow = await db.query('SELECT * FROM menus WHERE id = $1', [menuId]);
        res.status(existing.rows.length > 0 ? 200 : 201).json(menuRow.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Update menu (add/remove items). Body: items: [{ food_item_id, discount_type?, discount_value? }] or food_item_ids: number[]
app.put('/api/menus/:id', async (req, res, next) => {
    const { food_item_ids, items } = req.body;
    try {
        await db.query('DELETE FROM menu_food_items WHERE menu_id = $1', [req.params.id]);

        const entries = Array.isArray(items) && items.length > 0
            ? items.map((it) => ({
                food_item_id: it.food_item_id,
                discount_type: it.discount_type === 'percent' || it.discount_type === 'fixed' ? it.discount_type : null,
                discount_value: it.discount_value != null && Number(it.discount_value) >= 0 ? Number(it.discount_value) : null
            }))
            : (food_item_ids || []).map((id) => ({ food_item_id: id, discount_type: null, discount_value: null }));

        for (let i = 0; i < entries.length; i++) {
            const e = entries[i];
            const dType = e.discount_type || null;
            const dVal = e.discount_value != null ? e.discount_value : null;
            await db.query(
                'INSERT INTO menu_food_items (menu_id, food_item_id, display_order, discount_type, discount_value) VALUES ($1, $2, $3, $4, $5)',
                [req.params.id, e.food_item_id, i, dType, dVal]
            );
        }

        res.json({ message: 'Menu updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Set menu as default
app.post('/api/menus/:id/set-default', async (req, res, next) => {
    try {
        // Clear all default flags
        await db.query('UPDATE menus SET is_default = false');
        // Set this menu as default
        await db.query('UPDATE menus SET is_default = true WHERE id = $1', [req.params.id]);
        res.json({ message: 'Default menu updated' });
    } catch (err) {
        next(err);
    }
});

// Delete menu
app.delete('/api/menus/:id', async (req, res, next) => {
    try {
        const result = await db.query('DELETE FROM menus WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Menu not found' });
        }
        res.json({ message: 'Menu deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Update display order for default menu items
app.patch('/api/menus/default/reorder', async (req, res, next) => {
    const { food_item_orders } = req.body; // [{ food_item_id: 1, display_order: 0 }, ...]
    try {
        const menuResult = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'No default menu found' });
        }
        const menuId = menuResult.rows[0].id;
        for (const item of food_item_orders) {
            await db.query(
                'UPDATE menu_food_items SET display_order = $1 WHERE menu_id = $2 AND food_item_id = $3',
                [item.display_order, menuId, item.food_item_id]
            );
        }
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Update display order for special date menu items
app.patch('/api/menus/:id/reorder', async (req, res, next) => {
    const { food_item_orders } = req.body;
    try {
        for (const item of food_item_orders) {
            await db.query(
                'UPDATE menu_food_items SET display_order = $1 WHERE menu_id = $2 AND food_item_id = $3',
                [item.display_order, req.params.id, item.food_item_id]
            );
        }
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        next(err);
    }
});

// ========== DEALS / PROMOS ==========

// Get all deals (optional filter: is_active)
app.get('/api/deals', async (req, res, next) => {
    try {
        const { active } = req.query;
        let query = 'SELECT * FROM deals WHERE 1=1';
        const params = [];
        if (active !== undefined) {
            params.push(active === 'true');
            query += ` AND is_active = $${params.length}`;
        }
        query += ' ORDER BY display_order, created_at DESC';
        const result = await db.query(query, params);
        const rows = await storage.resolveImages(result.rows);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// Get single deal with items
app.get('/api/deals/:id', async (req, res, next) => {
    try {
        const dealResult = await db.query('SELECT * FROM deals WHERE id = $1', [req.params.id]);
        if (dealResult.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found' });
        }
        const deal = dealResult.rows[0];
        deal.imageUrl = await storage.resolveImage(deal.image);
        const itemsResult = await db.query(`
            SELECT f.*, di.display_order
            FROM food_items f
            JOIN deal_items di ON f.id = di.food_item_id
            WHERE di.deal_id = $1 AND f.is_active = true
            ORDER BY di.display_order, f.name
        `, [req.params.id]);
        const items = await storage.resolveImages(itemsResult.rows);
        res.json({ ...deal, items });
    } catch (err) {
        next(err);
    }
});

// Create new deal
app.post('/api/deals', async (req, res, next) => {
    const { name, description, image, price, food_item_ids } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: 'name and price required' });
    }
    try {
        const maxOrder = await db.query('SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM deals');
        const order = maxOrder.rows[0].next_order;
        const dealResult = await db.query(
            'INSERT INTO deals (name, description, image, price, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description || '', image || '', price, order]
        );
        const dealId = dealResult.rows[0].id;
        if (food_item_ids && food_item_ids.length > 0) {
            for (let i = 0; i < food_item_ids.length; i++) {
                await db.query(
                    'INSERT INTO deal_items (deal_id, food_item_id, display_order) VALUES ($1, $2, $3)',
                    [dealId, food_item_ids[i], i]
                );
            }
        }
        res.status(201).json(dealResult.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Update deal
app.put('/api/deals/:id', async (req, res, next) => {
    const { name, description, image, price, is_active, food_item_ids } = req.body;
    try {
        await db.query(
            'UPDATE deals SET name = $1, description = $2, image = $3, price = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
            [name, description || '', image || '', price, is_active !== undefined ? is_active : true, req.params.id]
        );
        if (food_item_ids !== undefined) {
            await db.query('DELETE FROM deal_items WHERE deal_id = $1', [req.params.id]);
            if (food_item_ids.length > 0) {
                for (let i = 0; i < food_item_ids.length; i++) {
                    await db.query(
                        'INSERT INTO deal_items (deal_id, food_item_id, display_order) VALUES ($1, $2, $3)',
                        [req.params.id, food_item_ids[i], i]
                    );
                }
            }
        }
        res.json({ message: 'Deal updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Update display order for deal items
app.patch('/api/deals/:id/reorder', async (req, res, next) => {
    const { food_item_orders } = req.body;
    try {
        for (const item of food_item_orders) {
            await db.query(
                'UPDATE deal_items SET display_order = $1 WHERE deal_id = $2 AND food_item_id = $3',
                [item.display_order, req.params.id, item.food_item_id]
            );
        }
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Update display order for deals themselves
app.patch('/api/deals/reorder', async (req, res, next) => {
    const { deal_orders } = req.body; // [{ deal_id: 1, display_order: 0 }, ...]
    try {
        for (const deal of deal_orders) {
            await db.query('UPDATE deals SET display_order = $1 WHERE id = $2', [deal.display_order, deal.deal_id]);
        }
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Delete deal
app.delete('/api/deals/:id', async (req, res, next) => {
    try {
        const result = await db.query('DELETE FROM deals WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found' });
        }
        res.json({ message: 'Deal deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Central error handler: return 503 when DB is unreachable so frontend can show a message
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (db.isNetworkError && db.isNetworkError(err)) {
        return res.status(503).json({
            error: 'Database unreachable',
            code: 'DB_UNREACHABLE',
            hint: 'Check Supabase dashboard (restore project if paused), internet, and .env DATABASE_URL.'
        });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Test DB connection on startup
async function start() {
    try {
        await db.query('SELECT 1');
        console.log('✓ Database connected.');
    } catch (err) {
        if (db.isNetworkError && db.isNetworkError(err)) {
            db.logNetworkErrorOnce();
        } else {
            console.error('Database connection error:', err.message || err);
        }
    }
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

start();

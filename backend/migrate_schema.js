const db = require('./db');

// Create new tables for the redesigned menu management system
const createNewTables = async () => {
    try {
        console.log('Creating new tables for menu management system...');

        // 1. Create food_items table (Master Library)
        await db.query(`
      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image TEXT,
        
        -- Tags/Attributes
        is_veg BOOLEAN DEFAULT false,
        spice_level VARCHAR(20) DEFAULT 'none',
        tags TEXT[],
        allergens TEXT[],
        
        -- Availability
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✓ Created food_items table');

        // 2. Create menus table (Date-specific Menus)
        await db.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        menu_date DATE UNIQUE,
        is_default BOOLEAN DEFAULT false,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✓ Created menus table');

        // 3. Create menu_food_items junction table
        await db.query(`
      CREATE TABLE IF NOT EXISTS menu_food_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        UNIQUE(menu_id, food_item_id)
      );
    `);
        console.log('✓ Created menu_food_items junction table');

        console.log('\n✅ All new tables created successfully!');
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
};

// Migration: Transfer data from old menu_items to new food_items (if table exists)
const migrateData = async () => {
    try {
        console.log('\nMigrating data from old menu_items to new food_items...');

        let oldData = { rows: [] };
        try {
            oldData = await db.query('SELECT * FROM menu_items ORDER BY id');
        } catch (e) {
            console.log('menu_items table not found or empty; skipping migration.');
        }

        if (oldData.rows.length === 0) {
            console.log('No data to migrate.');
            await ensureDefaultMenu();
            return;
        }

        console.log(`Found ${oldData.rows.length} items to migrate.`);

        // Insert data into food_items
        for (const item of oldData.rows) {
            await db.query(`
        INSERT INTO food_items (name, category, price, description, image, is_veg, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT DO NOTHING
      `, [
                item.name,
                item.category,
                item.price,
                item.description || '',
                item.image || '',
                item.is_veg || false
            ]);
        }

        console.log('✓ Data migrated to food_items');

        // Create default menu with all items
        const menuResult = await db.query(`
      INSERT INTO menus (menu_date, is_default, name)
      VALUES (NULL, true, 'Default Menu')
      RETURNING id
    `);
        const defaultMenuId = menuResult.rows[0].id;
        console.log('✓ Created default menu');

        // Get all food items
        const foodItems = await db.query('SELECT id FROM food_items ORDER BY id');

        // Add all items to default menu
        let order = 0;
        for (const item of foodItems.rows) {
            await db.query(`
        INSERT INTO menu_food_items (menu_id, food_item_id, display_order)
        VALUES ($1, $2, $3)
      `, [defaultMenuId, item.id, order++]);
        }

        console.log('✓ Added all items to default menu');
        console.log('\n✅ Migration completed successfully!');
    } catch (err) {
        console.error('Error during migration:', err);
        throw err;
    }
};

// Ensure default menu exists (e.g. when no old data to migrate)
const ensureDefaultMenu = async () => {
    try {
        const existing = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (existing.rows.length > 0) {
            console.log('✓ Default menu already exists.');
            return;
        }
        await db.query(`
      INSERT INTO menus (menu_date, is_default, name)
      VALUES (NULL, true, 'Default Menu')
      RETURNING id
    `);
        console.log('✓ Created default menu (no items yet; add via Food Library + Default Menu).');
    } catch (err) {
        console.error('Error ensuring default menu:', err);
        throw err;
    }
};

// Main execution
const main = async () => {
    try {
        await createNewTables();
        await migrateData();
        const def = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (def.rows.length === 0) await ensureDefaultMenu();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

main();

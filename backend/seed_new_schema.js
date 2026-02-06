/**
 * Seed food_items and default menu for the new schema.
 * Run after: node migrate_schema.js
 * This populates the Food Library and adds all items to the Default Menu so the customer UI shows a menu.
 */
const db = require('./db');

const BASE_URL = 'http://localhost:3000/photos';

const SAMPLE_FOOD_ITEMS = [
    { name: "Grandma's Chicken Curry", category: 'mains', price: 12.99, is_veg: false, spice_level: 'medium', tags: ['special'], image: `${BASE_URL}/chicken_curry.jpg`, description: 'Tender chicken cooked in slow-roasted spices.' },
    { name: 'Baked Ocean Fillet', category: 'mains', price: 16.50, is_veg: false, spice_level: 'none', tags: [], image: `${BASE_URL}/fish_fillet.jpg`, description: 'Flaky white fish baked with a lemon-zest crust.' },
    { name: 'Paneer Butter Masala', category: 'mains', price: 11.00, is_veg: true, spice_level: 'mild', tags: ['special'], image: `${BASE_URL}/paneer_masala.jpg`, description: "Cottage cheese cubes in a rich tomato butter gravy." },
    { name: 'Grilled Salmon', category: 'mains', price: 18.99, is_veg: false, spice_level: 'none', tags: ['special'], image: `${BASE_URL}/grilled_salmon.png`, description: 'Fresh Atlantic salmon grilled to perfection with lemon butter sauce.' },
    { name: 'Pasta Carbonara', category: 'mains', price: 14.99, is_veg: false, spice_level: 'none', tags: [], image: `${BASE_URL}/pasta_carbonara.png`, description: 'Creamy Italian pasta with pancetta, eggs, and parmesan cheese.' },
    { name: 'Beef Stew', category: 'mains', price: 14.50, is_veg: false, spice_level: 'mild', tags: [], image: `${BASE_URL}/beef_stew.jpg`, description: 'Slow-cooked beef with carrots and potatoes.' },
    { name: 'Vegetable Stir Fry', category: 'mains', price: 10.50, is_veg: true, spice_level: 'mild', tags: ['seasonal'], image: `${BASE_URL}/stir_fry.jpg`, description: 'Seasonal vegetables tossed in a sesame soy glaze.' },
    { name: 'Garden Fresh Salad', category: 'sides', price: 8.50, is_veg: true, spice_level: 'none', tags: [], image: `${BASE_URL}/garden_salad.jpg`, description: 'Crispy lettuce, tomatoes, cucumbers with lemon dressing.' },
    { name: 'Lentil Soup (Dal)', category: 'sides', price: 6.00, is_veg: true, spice_level: 'mild', tags: [], image: `${BASE_URL}/lentil_soup.jpg`, description: 'Hearty yellow lentils tempered with cumin and garlic.' },
    { name: 'Cheesy Garlic Bread', category: 'sides', price: 5.50, is_veg: true, spice_level: 'none', tags: [], image: `${BASE_URL}/garlic_bread.jpg`, description: 'Toasted baguette slices topped with mozzarella and herbs.' },
    { name: 'Steamed Seasonal Veggies', category: 'sides', price: 7.00, is_veg: true, spice_level: 'none', tags: ['seasonal'], image: `${BASE_URL}/steamed_veggies.jpg`, description: 'Lightly salted broccoli, carrots, and beans.' },
    { name: 'Crispy Seasoned Fries', category: 'sides', price: 4.50, is_veg: true, spice_level: 'mild', tags: [], image: `${BASE_URL}/french_fries.jpg`, description: 'Golden fries tossed in our signature spice blend.' },
    { name: 'Caesar Salad', category: 'sides', price: 9.50, is_veg: true, spice_level: 'none', tags: [], image: `${BASE_URL}/caesar_salad.png`, description: "Crisp romaine lettuce with classic Caesar dressing, croutons, and parmesan." },
    { name: 'Chocolate Lava Cake', category: 'desserts', price: 8.50, is_veg: true, spice_level: 'none', tags: ['special'], image: `${BASE_URL}/chocolate_lava_cake.png`, description: 'Rich chocolate cake with a molten center, served warm with vanilla ice cream.' },
    { name: 'Classic Apple Pie', category: 'desserts', price: 7.50, is_veg: true, spice_level: 'none', tags: ['seasonal'], image: `${BASE_URL}/apple_pie.jpg`, description: 'Warm apple slices with cinnamon in a flaky crust.' },
    { name: 'Chocolate Fudge Brownie', category: 'desserts', price: 6.00, is_veg: true, spice_level: 'none', tags: [], image: `${BASE_URL}/brownie.jpg`, description: 'Decadent chocolate brownie served with vanilla ice cream.' },
    { name: 'Fruit Salad', category: 'desserts', price: 5.50, is_veg: true, spice_level: 'none', tags: ['seasonal'], image: `${BASE_URL}/fruit_salad.jpg`, description: 'Mix of seasonal fresh fruits.' }
];

async function run() {
    try {
        const count = await db.query('SELECT COUNT(*) AS n FROM food_items');
        if (Number(count.rows[0].n) > 0) {
            console.log('food_items already has data. Skipping seed. (Delete rows and run again to re-seed.)');
            process.exit(0);
            return;
        }

        const defaultMenu = await db.query('SELECT id FROM menus WHERE is_default = true LIMIT 1');
        if (defaultMenu.rows.length === 0) {
            console.log('No default menu found. Run: node migrate_schema.js');
            process.exit(1);
        }
        const defaultMenuId = defaultMenu.rows[0].id;

        console.log('Seeding food_items and default menu...');
        let order = 0;
        for (const item of SAMPLE_FOOD_ITEMS) {
            const r = await db.query(
                `INSERT INTO food_items (name, category, price, description, image, is_veg, spice_level, tags, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING id`,
                [item.name, item.category, item.price, item.description || '', item.image || '', item.is_veg, item.spice_level || 'none', item.tags || []]
            );
            const foodId = r.rows[0].id;
            await db.query(
                'INSERT INTO menu_food_items (menu_id, food_item_id, display_order) VALUES ($1, $2, $3)',
                [defaultMenuId, foodId, order++]
            );
        }

        console.log(`Seeded ${SAMPLE_FOOD_ITEMS.length} food items and added them to the default menu.`);
        console.log('Customer menu and admin Food Library should now show items.');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

run();

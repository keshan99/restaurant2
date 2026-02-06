const db = require('./db');

// Add discount columns to menu_food_items (per-item discount on a menu)
async function migrate() {
    try {
        await db.query('ALTER TABLE menu_food_items ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20)');
        await db.query('ALTER TABLE menu_food_items ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10, 2)');
        console.log('✓ Added discount_type and discount_value to menu_food_items');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();

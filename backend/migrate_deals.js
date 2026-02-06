const db = require('./db');

// Create deals tables for promo/bundle feature
async function migrate() {
    try {
        // 1. Create deals table
        await db.query(`
            CREATE TABLE IF NOT EXISTS deals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image TEXT,
                price DECIMAL(10, 2) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Created deals table');

        // 2. Create deal_items junction table
        await db.query(`
            CREATE TABLE IF NOT EXISTS deal_items (
                id SERIAL PRIMARY KEY,
                deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
                food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
                display_order INTEGER DEFAULT 0,
                UNIQUE(deal_id, food_item_id)
            );
        `);
        console.log('✓ Created deal_items junction table');

        console.log('\n✅ Deals migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();

const db = require('./db');

async function testConnection() {
    try {
        console.log('Testing connection to Supabase...');
        const result = await db.query('SELECT NOW()');
        console.log('✓ Connection successful!');
        console.log('Current time from DB:', result.rows[0].now);

        console.log('\nChecking tables...');
        const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables found:', tables.rows.map(r => r.table_name).join(', '));

        process.exit(0);
    } catch (err) {
        console.error('✗ Connection failed!');
        console.error(err);
        process.exit(1);
    }
}

testConnection();

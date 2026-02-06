/**
 * Remove duplicate food_items (same name + category).
 * Keeps the row with the smallest id and updates menu_food_items to point to it, then deletes duplicate rows.
 * Run: node remove_duplicate_food.js
 */
const db = require('./db');

async function run() {
    try {
        const dupes = await db.query(`
            SELECT name, category, array_agg(id ORDER BY id) AS ids, COUNT(*) AS n
            FROM food_items
            GROUP BY name, category
            HAVING COUNT(*) > 1
        `);

        if (dupes.rows.length === 0) {
            console.log('No duplicate food items found.');
            process.exit(0);
            return;
        }

        console.log(`Found ${dupes.rows.length} group(s) of duplicates.`);

        for (const row of dupes.rows) {
            const ids = row.ids;
            const keepId = ids[0];
            const duplicateIds = ids.slice(1);

            for (const dupId of duplicateIds) {
                const links = await db.query(
                    'SELECT menu_id, display_order FROM menu_food_items WHERE food_item_id = $1',
                    [dupId]
                );

                for (const link of links.rows) {
                    const existing = await db.query(
                        'SELECT 1 FROM menu_food_items WHERE menu_id = $1 AND food_item_id = $2',
                        [link.menu_id, keepId]
                    );
                    if (existing.rows.length > 0) {
                        await db.query(
                            'DELETE FROM menu_food_items WHERE menu_id = $1 AND food_item_id = $2',
                            [link.menu_id, dupId]
                        );
                    } else {
                        await db.query(
                            'UPDATE menu_food_items SET food_item_id = $1 WHERE menu_id = $2 AND food_item_id = $3',
                            [keepId, link.menu_id, dupId]
                        );
                    }
                }

                await db.query('DELETE FROM food_items WHERE id = $1', [dupId]);
                console.log(`  Removed duplicate food_items id=${dupId} (kept id=${keepId}): "${row.name}" [${row.category}]`);
            }
        }

        console.log('Done. Duplicate food items removed.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();

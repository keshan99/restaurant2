/**
 * First-run: upload existing images to GCP bucket and update DB.
 *
 * Usage:
 *   node scripts/upload-existing-images.js
 *     → For each food_items and deals row where image is an HTTP(S) URL,
 *       downloads the image, uploads to GCS, and updates the row with the new path.
 *
 *   node scripts/upload-existing-images.js <folder-path>
 *     → Uploads all files to GCS under dishes/<filename>; prints paths.
 *   node scripts/upload-existing-images.js <folder-path> --update-db
 *     → Same, then updates food_items and deals: any row whose image contains
 *       the filename is set to dishes/<filename> (e.g. for backend/photos_temp).
 *
 * Requires: .env with DATABASE_URL, GCS_BUCKET_NAME, and (locally) GOOGLE_APPLICATION_CREDENTIALS.
 */
require('dotenv').config();
const db = require('../db');
const storage = require('../storage');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BUCKET = process.env.GCS_BUCKET_NAME;
if (!BUCKET) {
    console.error('Missing GCS_BUCKET_NAME in .env');
    process.exit(1);
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.get(url, { timeout: 15000 }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function extFromUrl(url) {
    try {
        const u = new URL(url);
        const p = u.pathname;
        const i = p.lastIndexOf('.');
        if (i > 0 && /^\.(jpg|jpeg|png|gif|webp)$/i.test(p.slice(i))) return p.slice(i).toLowerCase();
    } catch (_) {}
    return '.jpg';
}

async function migrateDbUrls() {
    console.log('Migrating image URLs from DB to GCS...\n');

    const tables = [
        { name: 'food_items', id: 'id' },
        { name: 'deals', id: 'id' }
    ];

    for (const { name, id } of tables) {
        const result = await db.query(`SELECT ${id}, image FROM ${name} WHERE image IS NOT NULL AND image <> '' AND (image LIKE 'http://%' OR image LIKE 'https://%')`);
        console.log(`${name}: ${result.rows.length} row(s) with HTTP image URL(s).`);

        for (const row of result.rows) {
            const idVal = row[id];
            const url = row.image;
            try {
                const buffer = await fetchUrl(url);
                const ext = extFromUrl(url);
                const objectPath = `dishes/${Date.now()}-${idVal}${ext}`;
                await storage.uploadBuffer(objectPath, buffer, `image/${ext.slice(1)}` || 'image/jpeg');
                await db.query(`UPDATE ${name} SET image = $1 WHERE ${id} = $2`, [objectPath, idVal]);
                console.log(`  OK ${name} ${id}=${idVal} → ${objectPath}`);
            } catch (err) {
                console.error(`  FAIL ${name} ${id}=${idVal} (${url}): ${err.message}`);
            }
        }
    }

    console.log('\nDone migrating DB URLs.');
}

async function uploadFolder(folderPath) {
    const resolved = path.resolve(folderPath);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
        console.error('Not a directory:', folderPath);
        process.exit(1);
    }

    console.log('Uploading files from', resolved, 'to GCS dishes/...\n');
    const files = fs.readdirSync(resolved).filter((f) => {
        const p = path.join(resolved, f);
        return fs.statSync(p).isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(f);
    });

    const uploaded = [];
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const objectPath = `dishes/${path.basename(file)}`;
        const buf = fs.readFileSync(path.join(resolved, file));
        const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }[ext] || 'image/jpeg';
        try {
            await storage.uploadBuffer(objectPath, buf, mime);
            uploaded.push(objectPath);
            console.log('  OK', objectPath);
        } catch (err) {
            console.error('  FAIL', file, err.message);
        }
    }

    console.log('\nUploaded paths (use these in food_items.image or deals.image):');
    uploaded.forEach((p) => console.log('  ', p));
    return uploaded;
}

/** Upload folder to GCS and update food_items + deals so any row whose image contains the filename now points to dishes/<filename>. */
async function uploadFolderAndUpdateDb(folderPath) {
    const resolved = path.resolve(folderPath);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
        console.error('Not a directory:', folderPath);
        process.exit(1);
    }

    const files = fs.readdirSync(resolved).filter((f) => {
        const p = path.join(resolved, f);
        return fs.statSync(p).isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(f);
    });

    console.log(`Uploading ${files.length} files from ${resolved} to GCS and updating DB...\n`);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const objectPath = `dishes/${path.basename(file)}`;
        const buf = fs.readFileSync(path.join(resolved, file));
        const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }[ext] || 'image/jpeg';
        try {
            await storage.uploadBuffer(objectPath, buf, mime);
            console.log('  Uploaded', objectPath);
        } catch (err) {
            console.error('  FAIL upload', file, err.message);
            continue;
        }
        const filename = path.basename(file);
        try {
            const r1 = await db.query(
                `UPDATE food_items SET image = $1 WHERE image LIKE $2 OR image = $3 RETURNING id`,
                [objectPath, '%' + filename, filename]
            );
            const r2 = await db.query(
                `UPDATE deals SET image = $1 WHERE image LIKE $2 OR image = $3 RETURNING id`,
                [objectPath, '%' + filename, filename]
            );
            const n = (r1.rowCount || 0) + (r2.rowCount || 0);
            if (n > 0) console.log('    → Updated', n, 'row(s) to', objectPath);
        } catch (err) {
            console.error('    DB update failed:', err.message);
        }
    }
    console.log('\nDone. Restart or refresh the app to see images from GCS.');
}

async function main() {
    const folderArg = process.argv[2];
    const updateDb = process.argv[3] === '--update-db';
    try {
        if (folderArg) {
            if (updateDb) {
                await uploadFolderAndUpdateDb(folderArg);
            } else {
                await uploadFolder(folderArg);
            }
        } else {
            await migrateDbUrls();
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        if (db.pool) await db.pool.end();
    }
}

main();

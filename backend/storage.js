/**
 * GCS (Google Cloud Storage) helper for private bucket.
 * Backend uploads files and serves signed URLs for viewing. Bucket stays private (no public IAM).
 * Set GCS_BUCKET_NAME in .env (e.g. restaurant-files-001).
 */
const { Storage } = require('@google-cloud/storage');

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const SIGNED_URL_EXPIRY_MINUTES = 60;

function getBucket() {
    if (!BUCKET_NAME) return null;
    const storage = new Storage();
    return storage.bucket(BUCKET_NAME);
}

/**
 * Upload a buffer to GCS. Returns the object path (e.g. "dishes/abc123.jpg").
 */
async function uploadBuffer(objectPath, buffer, contentType) {
    const bucket = getBucket();
    if (!bucket) throw new Error('GCS_BUCKET_NAME not set; cannot upload');
    const file = bucket.file(objectPath);
    await file.save(buffer, {
        contentType: contentType || 'application/octet-stream',
        metadata: { cacheControl: 'public, max-age=31536000' }
    });
    return objectPath;
}

/**
 * Get a signed URL for reading an object. Use for private bucket so only backend can grant access.
 * Fails when using user ADC (no client_email). Use getImageUrl() for a URL that works in all cases.
 */
async function getSignedUrl(objectPath) {
    if (!objectPath || objectPath.startsWith('http')) return objectPath;
    const bucket = getBucket();
    if (!bucket) return objectPath;
    try {
        const [url] = await bucket.file(objectPath).getSignedUrl({
            action: 'read',
            expires: Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000
        });
        return url;
    } catch (err) {
        console.error('getSignedUrl error:', err.message);
        return null;
    }
}

/** Base URL of this backend (e.g. http://localhost:3000). When set, used as fallback when signed URLs are not available (e.g. user ADC). */
const BACKEND_URL = process.env.BACKEND_URL || process.env.PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');

/**
 * Return a URL that will serve this image. Uses signed URL when possible; otherwise proxy URL (for local dev with user credentials).
 */
async function getImageUrl(objectPath) {
    if (!objectPath || typeof objectPath !== 'string') return objectPath;
    if (objectPath.startsWith('http://') || objectPath.startsWith('https://')) return objectPath;
    const signed = await getSignedUrl(objectPath);
    if (signed) return signed;
    if (BACKEND_URL) return BACKEND_URL + '/api/image/' + encodeURIComponent(objectPath);
    return objectPath;
}

/**
 * Resolve image: return signed URL or proxy URL for GCS path; otherwise return as-is.
 */
async function resolveImage(image) {
    if (!image || typeof image !== 'string') return image;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return getImageUrl(image);
}

/**
 * Resolve image on each item: add imageUrl (signed) for display; keep image as stored path for form submit.
 */
async function resolveImages(rows) {
    if (!Array.isArray(rows)) return rows;
    return Promise.all(rows.map(async (row) => {
        const url = await resolveImage(row.image);
        return { ...row, imageUrl: url || row.image };
    }));
}

/**
 * Stream an object from GCS to a response. Used by GET /api/image/:path when signed URLs are not available.
 */
function streamFile(objectPath, res, next) {
    const bucket = getBucket();
    if (!bucket) {
        res.status(503).send('GCS not configured');
        return;
    }
    const file = bucket.file(objectPath);
    const readStream = file.createReadStream();
    readStream.on('error', (err) => {
        if (err.code === 404) return res.status(404).send('Not found');
        next(err);
    });
    const ext = objectPath.slice(objectPath.lastIndexOf('.')).toLowerCase();
    const contentType = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    readStream.pipe(res);
}

module.exports = {
    getBucket,
    uploadBuffer,
    getSignedUrl,
    getImageUrl,
    resolveImage,
    resolveImages,
    streamFile,
    BUCKET_NAME
};

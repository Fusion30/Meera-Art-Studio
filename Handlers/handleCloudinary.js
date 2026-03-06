import { v2 as cloudinary } from 'cloudinary'
import { Readable } from "stream";
import sharp from "sharp";

let isCloudinaryConfigured = false;

function cloudinaryConfig() {
    if (isCloudinaryConfigured) return;

    cloudinary.config({
        cloud_name: "dubdinigl",
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true // Recommended for HTTPS URLs
    });

    isCloudinaryConfigured = true;
}

async function convertBuffer(buffer) {
    //The method returns a stream, so for simplicity
    //we wrap it in a Promise
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
        // Convert the buffer to a readable stream and pipe it to Cloudinary's upload stream
        // This allows us to upload the image data directly from memory without writing to disk
        Readable.from(buffer).pipe(uploadStream)
    })
}

const CLOUDINARY_FREE_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;

async function ensureUnderCloudinaryLimit(buffer) {
    if (buffer.length <= CLOUDINARY_FREE_UPLOAD_LIMIT_BYTES) {
        return { buffer, converted: false, format: null };
    }

    // If the original file is too large for your Cloudinary plan,
    // we must shrink it BEFORE upload. Cloudinary transformations happen AFTER upload.
    const attempts = [
        { max: 2400, quality: 55 },
        { max: 2000, quality: 50 },
        { max: 1600, quality: 45 },
        { max: 1400, quality: 40 }
    ];

    for (const attempt of attempts) {
        const out = await sharp(buffer, { failOnError: false })
            .rotate()
            .resize({ width: attempt.max, height: attempt.max, fit: "inside", withoutEnlargement: true })
            .avif({ quality: attempt.quality, effort: 4 })
            .toBuffer();

        if (out.length <= CLOUDINARY_FREE_UPLOAD_LIMIT_BYTES) {
            return { buffer: out, converted: true, format: "avif" };
        }
    }

    return { buffer: null, converted: true, format: "avif" };
}

export async function handleUploadToCloudinary(req, res) {
    cloudinaryConfig()

    if (!req.file?.buffer) {
        return res.status(400).json({ error: "No file received. Field name must be 'uploaded-file'." });
    }

    try {
        const originalBytes = req.file.buffer.length;

        const processed = await ensureUnderCloudinaryLimit(req.file.buffer);
        if (!processed.buffer) {
            return res.status(413).json({
                error: "Image is too large even after compression. Try a smaller image.",
                originalBytes
            });
        }

        const result = await convertBuffer(processed.buffer);

        // Best practice: store `public_id` in DB, and generate optimized URLs on-demand.
        const optimizedUrl = cloudinary.url(result.public_id, {
            secure: true,
            transformation: [{ quality: "auto", fetch_format: "auto" }]
        });

        res.json({
            message: "Image uploaded to Cloudinary",
            upload: {
                public_id: result.public_id,
                bytesUploaded: result.bytes,
                originalBytes,
                convertedBeforeUpload: processed.converted,
                convertedFormat: processed.format
            },
            urls: {
                original: result.secure_url,
                optimized: optimizedUrl
            }
        });
    } catch (error) {
        console.error("Error uploading painting:", error);
        res.status(500).json({ error: "Failed to upload painting" });
    }
}

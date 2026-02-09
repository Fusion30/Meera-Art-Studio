import { v2 as cloudinary } from 'cloudinary'
import { Readable } from "stream";
import sharp from "sharp";
import { seedTable } from '../seedTable.js'

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

//----Resize image buffer using sharp before uploading to Cloudinary----
async function resizeImageBuffer(originalBuffer) {
    // We receive the uploaded file as an in-memory Buffer (multer.memoryStorage).
    // Before uploading to Cloudinary, resize the pixels locally using sharp.
    // This reduces upload size/bandwidth and ensures a reasonable max dimension.
    //
    // Brief sharp notes (summary):
    // - "Pipeline": the chained operations like `sharp(buf).rotate().resize(...)`.
    // - "Lazy": sharp mostly *queues* those operations; it doesn't do the heavy work yet.
    // - `.toBuffer()` is the step that *runs* the pipeline and returns the final processed
    //   image bytes as a new Node.js Buffer (which we then upload to Cloudinary).
    //
    // Notes:
    // - `.rotate()` auto-applies EXIF orientation so portrait photos don't upload sideways.
    // - `fit: "inside"` preserves aspect ratio.
    // - `withoutEnlargement: true` prevents upscaling small images.
    try {
        const resizedBuffer = await sharp(originalBuffer)
            .rotate()
            .resize({
                width: 1600,
                height: 1600,
                fit: "inside",
                withoutEnlargement: true,
            })
            // `.toBuffer()` runs the pipeline and returns the processed image bytes.
            .toBuffer();

        console.log("Resized image buffer created successfully");
        return resizedBuffer;
    } catch (err) {
        console.error("Error resizing image buffer:", err);
        // Re-throw so the upload handler can return a 500 instead of uploading `undefined`.
        throw err;
    }
}

//----Upload the resized image buffer to Cloudinary using a stream----
async function convertBuffer(buffer) {
    //The method returns a stream, so for simplicity
    //we wrap it in a Promise
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
        // Convert the buffer to a readable stream and pipe it to Cloudinary's upload stream.
        // This uploads image bytes directly from memory without writing to disk.
        Readable.from(buffer).pipe(uploadStream)
    })
}

//----Main handler function for uploading to Cloudinary----
export async function handleUploadToCloudinary(req, res) {
    cloudinaryConfig()

    //optional-chaining
    if (!req.file?.buffer) {
        // Response: 400 Bad Request
        return res.status(400).json({ error: "No file received. Field name must be 'uploaded-file'." });
    }

    try {
        // 1) Resize the uploaded image buffer locally (sharp)
        // 2) Upload the resized buffer to Cloudinary
        const resizedBuffer = await resizeImageBuffer(req.file.buffer);
        const result = await convertBuffer(resizedBuffer)
        console.log(result)
        await seedTable(result.public_id, req)
        // Response: 200 OK
        res.json({ message: "Image uploaded to cloudinary and data added to database" })
    } catch (error) {
        console.error("Error uploading painting:", error);
        // Response: 500 Internal Server Error
        res.status(500).json({ error: "Failed to upload painting" });
    }
}

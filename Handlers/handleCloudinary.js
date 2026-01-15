import { v2 as cloudinary } from 'cloudinary'
import { Readable } from "stream";

function cloudinaryConfig() {
    cloudinary.config({
        cloud_name: "dubdinigl",
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true // Recommended for HTTPS URLs
    });
}

async function convertBuffer(buffer) {
    //The method returns a stream, so for simplicity
    //we wrap it in a Promise:
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

export async function handleUpload(req, res) {
    cloudinaryConfig()

    try {
        const result = await convertBuffer(req.file.buffer)
        console.log(result)
        res.json("Image uploaded to cloudinary")
    } catch (error) {
        console.error("Error uploading painting:", error);
        res.status(500).json({ error: "Failed to upload painting" });
    }
}

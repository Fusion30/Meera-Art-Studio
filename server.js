import express from "express";
import dotenv from "dotenv"; // For env variables
import cors from 'cors'
import multer from "multer";
import { handleUploadToCloudinary } from './Handlers/handleCloudinary.js'
import { brevoSub } from './Handlers/brevoSubscription.js'
import { getDBConnection } from './DB/db.js'

dotenv.config();
const app = express(); // Creating an instance of express class
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const upload = multer({ storage: multer.memoryStorage() }); // Initialize multer for parsing multipart/form-data

//-----Static-Files-Serving-----
app.use(express.static("Public")); 
app.use("/admin", express.static("Admin"));

//-------Upload-Endpoint-------
app.post('/painting-upload', upload.single('uploaded-file'), handleUploadToCloudinary);
/*In multer -- upload.single('uploaded-file') puts the uploaded file on req.file.
Because we r using multer.memoryStorage(), the actual file bytes are in req.file.buffer.*/

/* Responses (from handleUploadToCloudinary):
 - 200 { message: "Image uploaded to cloudinary and data added to database" }
 - 400 { error: "No file received. Field name must be 'uploaded-file'." }
 - 500 { error: "Failed to upload painting" } */
 
//---------------------------------------------------------------------------

//-----Email-Subscription-Endpoint-----
app.post('/subscribe', brevoSub);

//-----Products API-----
app.get('/api/products', async (req, res) => {
    const db = await getDBConnection();
    try {
        const products = await db.all('SELECT * FROM products ORDER BY id DESC');
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    } finally {
        await db.close();
    }
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
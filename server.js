import express from "express";
import dotenv from "dotenv"; // For env variables
import cors from 'cors'
import session from 'express-session'
import multer from "multer";
import { handleCurrentUser, handleGoogleAuth, handleLogout } from './Auth/handleAuth.js'
import { brevoSub } from './Handlers/brevoSubscription.js'
import { handleUploadToCloudinary } from './Handlers/handleCloudinary.js'
import { getDBConnection } from './DB/db.js'

dotenv.config();
const app = express(); // Creating an instance of express class

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Session middleware gives every request a `req.session` object.
// We use it to remember which Google user has already signed in.
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Set up EJS view engine to render server-side shop page
app.set('view engine', 'ejs')
app.set('views', 'views')

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/auth/google', handleGoogleAuth);
app.get('/auth/me', handleCurrentUser);
app.post('/auth/logout', handleLogout);

const upload = multer({ storage: multer.memoryStorage() }); // Initialize multer for parsing multipart/form-data

//==== Static-Files-Serving ====
app.use(express.static("Public")); 
app.use("/admin", express.static("Admin"));

//===== Upload-Endpoint =====
app.post('/api/painting-upload', upload.single('uploaded-file'), handleUploadToCloudinary);
/* In multer -- upload.single('uploaded-file') puts the uploaded file on req.file.
   Because we r using multer.memoryStorage(), the actual file bytes are in req.file.buffer.*/
/* Responses (from handleUploadToCloudinary):
 - 200 { message: "Image uploaded to cloudinary and data added to database" }
 - 400 { error: "No file received. Field name must be 'uploaded-file'." }
 - 500 { error: "Failed to upload painting" } */

//==== Email-Subscription-Endpoint ====
app.post('/api/subscribe', brevoSub);

//==== Products API ====
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

// Server-rendered shop page using EJS
app.get('/shop', async (req, res) => {
    const db = await getDBConnection();
    try {
        const products = await db.all('SELECT * FROM products ORDER BY id DESC');
        // Render views/shop.ejs and pass products
        res.render('shop', { products });
    } catch (err) {
        console.error('Error rendering shop:', err);
        res.status(500).send('Failed to render shop');
    } finally {
        await db.close();
    }
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
import express from "express";
import dotenv from "dotenv"; // For env variables
import cors from 'cors'
import multer from "multer";
import { handleUpload } from './Handlers/handleCloudinary.js'
import { brevoSub } from './Handlers/brevoSubscription.js'

dotenv.config();
const app = express(); // Creating an instance of express class
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const upload = multer({ storage: multer.memoryStorage() }); // Initialize multer for parsing multipart/form-data

//-----Static-Files-Serving-----
app.use(express.static("Public")); 
app.use("/admin", express.static("Admin"));

//-------Upload-Endpoint-------
//----Upload.single() attaches uploaded file data to req----
app.post('/painting-upload', upload.single('uploaded-file'), handleUpload);

//-----Email-Subscription-Endpoint-----
app.post('/subscribe', brevoSub);

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
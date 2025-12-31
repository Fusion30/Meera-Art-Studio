import express from "express"
import path from "node:path"
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.API_KEY)
const app = express()

app.use(express.static( path.join(import.meta.dirname, "Public") ))
app.use(express.json())
app.post('/subscribe', async (req, res) => {
    
    
    // Send POST request to Brevo API to add contact
    
        const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "api-key": process.env.API_KEY
            },
            body: JSON.stringify({
                email: req.body.email,        // email to store
                listIds: [2],        // your Brevo list ID
                updateEnabled: true  // avoids duplicates
            })
        })
     
    
    

})
app.listen(8080, () => {
    console.log("Server is listening on port 8080")
})
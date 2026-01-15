export async function brevoSub(req, res) {
    
    try {
       // Send POST request to Brevo API to add contact
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            "api-key": process.env.BREVO_API_KEY // Your Brevo API key from env variables
        },
        body: JSON.stringify({
            email: req.body.email,  // Incoming email to store
            listIds: [2],          // Your Brevo list ID
            updateEnabled: true    // Avoids duplicates
        })
    }); 
    } catch (error) {
        res.status(500).json({ error: "Failed to subscribe email" });
    }
    
}
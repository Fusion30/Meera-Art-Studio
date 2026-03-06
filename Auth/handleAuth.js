import { OAuth2Client } from 'google-auth-library'
import { getDBConnection } from '../DB/db.js'

const client = new OAuth2Client()

// Save the Google user in SQLite.
// - First login: inserts a new row.
// - Later logins: updates the latest name/email/picture for the same googleId.
async function upsertGoogleUser(payload) {
    const db = await getDBConnection()

    try {
        await db.run(
            `
                INSERT INTO users (googleId, email, name, picture)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(googleId)
                DO UPDATE SET
                    email = excluded.email,
                    name = excluded.name,
                    picture = excluded.picture
            `,
            [payload.sub, payload.email ?? null, payload.name ?? null, payload.picture ?? null]
        )
        return await db.get(
            `SELECT id, googleId, email, name, picture, createdAt FROM users WHERE googleId = ?`,
            [payload.sub]
        )
    } finally {
        await db.close()
    }
}

async function getUserById(userId) {
    const db = await getDBConnection()
    try {
        return await db.get(
            `SELECT id, googleId, email, name, picture, createdAt FROM users WHERE id = ?`,
            [userId]
        )
    } finally {
        await db.close()
    }
}

// Main Google auth handler.
// Flow:
// 1. Read the Google credential posted by the browser.
// 2. Verify the credential with Google's library.
// 3. Read the verified payload.
// 4. Insert/update the user in our local users table.
// 5. Save the user's id in the session so later requests know who is logged in.
// 6. Return in res the verified + persisted user data.
export async function handleGoogleAuth(req, res) {
    const credential = req.body?.credential
    const googleClientId = process.env.GOOGLE_CLIENT_ID

    if (!credential) return res.status(400).json({ error: 'Google credential missing.' })
    if (!googleClientId) return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured on the server.' })
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: googleClientId
        })
        const payload = ticket.getPayload()
        if (!payload) return res.status(401).json({ error: 'Google token payload was empty.' })
        // `sub` is the stable Google account identifier and is the best user key.
        if (!payload.sub) return res.status(401).json({ error: 'Google token did not include a subject id.' })        

        //here savedUser and payload both are objects but savedUser has id also
        const savedUser = await upsertGoogleUser(payload)

        // Login state: remember this user for future requests.
        req.session.userId = savedUser.id

        res.status(200).json({
            message: 'Google sign-in verified successfully.',
            user: {
                id: savedUser.id,
                googleId: savedUser.googleId,
                email: savedUser.email,
                emailVerified: payload.email_verified,
                name: savedUser.name,
                picture: savedUser.picture,
                createdAt: savedUser.createdAt
            }
        })
    } catch (error) {
        // Any verification failure lands here: expired token, wrong audience, tampered token, etc.
        console.error('Error verifying Google token:', error)
        res.status(401).json({ error: 'Invalid Google token.' })
    }
}

// Return the currently logged-in user from the session.
// Frontend can call this after page load to know whether the user is signed in.
export async function handleCurrentUser(req, res) { 

    if (!req.session?.userId) return res.status(200).json({ authenticated: false, user: null })
    const user = await getUserById(req.session.userId)
    if (!user) {
        req.session.destroy(() => {})
        return res.status(200).json({ authenticated: false, user: null })
    }
    res.status(200).json({ authenticated: true, user })
}

// Destroy the session so the browser is no longer logged in to this app.
export function handleLogout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error)
            return res.status(500).json({ error: 'Failed to log out.' })
        }

        res.clearCookie('connect.sid')
        res.status(200).json({ message: 'Logged out successfully.' })
    })
}

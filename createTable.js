import { getDBConnection } from "./DB/db.js";

const db = await getDBConnection()

async function createTable() {
await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        media TEXT NOT NULL,
        cloudinaryPublicID TEXT NOT NULL,
        price REAL NOT NULL
    )
    `)

await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        googleId TEXT NOT NULL UNIQUE,
        email TEXT,
        name TEXT,
        picture TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `)

await db.close()
    console.log("Tables created successfully")
}

createTable()
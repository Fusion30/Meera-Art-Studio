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

await db.close()
    console.log("Table created successfully")
}

createTable()
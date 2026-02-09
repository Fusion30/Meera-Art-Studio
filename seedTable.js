import { getDBConnection } from "./DB/db.js";

export async function seedTable(publicID, req) {

    const db = await getDBConnection()//estb database connection
    
    try {
        await db.exec('BEGIN TRANSACTION')
        await db.run(`
            INSERT INTO products (name, media, cloudinaryPublicID, price)
            VALUES (?, ?, ?, ?)`,
            [req.body.name, req.body.media, publicID, req.body.price]
        )
        console.log("Data inserted successfully")
        await db.exec('COMMIT')
    } catch (error) {
        await db.exec("ROLLBACK")
        console.error("Error seeding table:", error)
        throw error
    } finally {
        await db.close()
    }
}
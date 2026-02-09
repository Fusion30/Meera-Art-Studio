import { getDBConnection } from "./DB/db.js";

async function viewAllProducts() {
  const db = await getDBConnection()//estb database connection

  try { 
    /**
     * Retrieves all products from the database.
     * @async
     * @function
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
     *          Each product object contains properties matching the columns in the products table.
     * @example
     * const products = await db.all('SELECT * FROM products');
     * // products = [
     * //   { id: 1, name: 'Product 1', price: 100, ... },
     * //   { id: 2, name: 'Product 2', price: 200, ... }
     * // ]
     */
    const products = await db.all('SELECT * FROM products')
    // Neater table display
    const displayItems = products.map(({ id, name, media, cloudinaryPublicID, price }) => {
      return { id, name, media, cloudinaryPublicID, price }
    })
    console.table(displayItems)
  } catch (err) {
    console.error('Error fetching products:', err.message)
  } finally {
    await db.close()
  }
}

viewAllProducts()
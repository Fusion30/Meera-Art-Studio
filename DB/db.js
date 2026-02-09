import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';

//Creating  new database connection
export async function getDBConnection() {

    return await open({
    filename: path.join('database.db'),
    driver:sqlite3.Database
})
} 
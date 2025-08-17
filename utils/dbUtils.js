import mysql from 'mysql2/promise';

let pool;

/**
 * Initialize MySQL connection pool
 */
export async function initDB() {
  try {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL ||  "mysql://root:VtcWtivSKVlqNjcRxYCHltmXUSyAlHkI@tramway.proxy.rlwy.net:56658/railway", // e.g. mysql://user:pass@host:port/dbname
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize DB:', error.message);
    throw error; // Let server.js decide whether to exit
  }
}

/**
 * Get connection pool instance
 */
export function getDB() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return pool;
}

/**
 * Run a raw query with optional params
 */
export async function executeQuery(query, params = []) {
  try {
    const [rows] = await getDB().execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message, { query, params });
    throw error;
  }
}

/**
 * Get a single row (first result only)
 */
export async function getOne(query, params = []) {
  try {
    const rows = await executeQuery(query, params);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ getOne failed:', error.message);
    throw error;
  }
}

/**
 * Insert a record and return insertId
 */
export async function insert(query, params = []) {
  try {
    const [result] = await getDB().execute(query, params);
    return result.insertId;
  } catch (error) {
    console.error('❌ Insert failed:', error.message);
    throw error;
  }
}

/**
 * Update/Delete a record and return affectedRows
 */
export async function executeUpdate(query, params = []) {
  try {
    const [result] = await getDB().execute(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Update/Delete failed:', error.message);
    throw error;
  }
}

/**
 * Run multiple queries inside a transaction
 */
export async function transaction(callback) {
  const connection = await getDB().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Drops a table if it exists, then recreates it with the provided schema
 * @param {string} tableName - Name of the table
 * @param {string} schema - SQL schema definition (columns, constraints, etc.)
 */
export const recreateTable = async (tableName, schema) => {
    try {
      // Step 1: Drop table
      await executeQuery(`DROP TABLE IF EXISTS \`${tableName}\`;`);
      console.log(`✅ Table '${tableName}' dropped (if existed).`);
  
      // Step 2: Create table
      await executeQuery(`CREATE TABLE \`${tableName}\` (${schema});`);
      console.log(`✅ Table '${tableName}' created successfully.`);
    } catch (error) {
      console.error(`❌ Error recreating table '${tableName}':`, error);
      throw error;
    }
  };
  

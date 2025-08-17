import { initDB, executeQuery, getOne, insert, executeUpdate, transaction, recreateTable } from './utils/dbUtils.js';

(async () => {
  try {
    await initDB();

    // // Simple select
    // const users = await executeQuery('SELECT * FROM users LIMIT 5');
    // console.log('Users:', users);

    // // Insert
    // const newUserId = await insert('INSERT INTO users (name, email) VALUES (?, ?)', ['Test User', 'test@example.com']);
    // console.log('Inserted User ID:', newUserId);

    // // Get one
    // const oneUser = await getOne('SELECT * FROM users WHERE id = ?', [newUserId]);
    // console.log('Fetched User:', oneUser);

    // // Update
    // const updated = await executeUpdate('UPDATE users SET name = ? WHERE id = ?', ['Updated User', newUserId]);
    // console.log('Updated Rows:', updated);

    // // Transaction
    // await transaction(async (conn) => {
    //   await conn.execute('INSERT INTO logs (message) VALUES (?)', ['Transaction started']);
    //   await conn.execute('INSERT INTO logs (message) VALUES (?)', ['Transaction finished']);
    // });
    // console.log('Transaction completed successfully');
    const usersSchema = `
  userId VARCHAR(50) PRIMARY KEY,
  userName VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  isEmailVerified BOOLEAN DEFAULT FALSE,
  isSubscribed BOOLEAN DEFAULT FALSE,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
`;
await recreateTable('users', usersSchema);

  } catch (err) {
    console.error('Test DB error:', err.message);
  } finally {
    process.exit(0);
  }
})();

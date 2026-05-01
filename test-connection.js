const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'host.docker.internal',
    port: 5432,
    user: 'ims',
    password: 'ims',
    database: 'ims'
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    const result = await client.query('SELECT current_user, current_database()');
    console.log('Result:', result.rows[0]);
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
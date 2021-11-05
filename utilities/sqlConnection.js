const { Pool } = require('pg')

/**
 * Obtain a Pool of DB connections.
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
})

module.exports = pool

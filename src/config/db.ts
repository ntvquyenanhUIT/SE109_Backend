import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(process.env.DB_SSL_CA as string).toString(),
    }
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client:', err.stack, client);
    }
    console.log('Database connected successfully');
    release();
});

export default pool;
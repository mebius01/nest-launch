import { Client } from 'pg';

const TABLE_NAME = 'users';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE ${TABLE_NAME} (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (client: Client) => {
  await client.query(`DROP TABLE ${TABLE_NAME}`);
};
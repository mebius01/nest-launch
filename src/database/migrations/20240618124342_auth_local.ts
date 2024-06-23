import { Client } from 'pg';

const TABLE_NAME = 'auth_local';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE ${TABLE_NAME} (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (client: Client) => {
  await client.query(`DROP TABLE ${TABLE_NAME}`);
};
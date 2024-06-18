import { Client } from 'pg';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE local_auth (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (client: Client) => {
  await client.query('DROP TABLE local_auth');
};
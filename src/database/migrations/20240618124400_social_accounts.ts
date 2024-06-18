import { Client } from 'pg';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE social_accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    provider VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (client: Client) => {
  await client.query('DROP TABLE social_accounts');
};
import { Client } from 'pg';

const TABLE_NAME = 'auth_otp';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE ${TABLE_NAME} (
      otp_id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      otp_code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (client: Client) => {
  await client.query(`DROP TABLE ${TABLE_NAME}`);
};
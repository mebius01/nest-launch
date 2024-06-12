import { Client } from 'pg';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE
    );
  `);
};

export const down = async (client: Client) => {
  await client.query('DROP TABLE users');
};

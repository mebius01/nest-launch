import { Client } from 'pg';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );
  `);
};

export const down = async (client: Client) => {
  await client.query('DROP TABLE projects');
};

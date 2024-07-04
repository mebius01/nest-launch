import { Client } from 'pg';

const TABLE_NAME = 'roles';

export const up = async (client: Client) => {
  await client.query(`
    CREATE TABLE ${TABLE_NAME} (
      role_id SERIAL PRIMARY KEY,
      role_name VARCHAR(255) NOT NULL
    );
  `);
};

export const down = async (client: Client) => {
  await client.query(`DROP TABLE ${TABLE_NAME} CASCADE;`);
};
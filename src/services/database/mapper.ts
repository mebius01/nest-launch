import { Injectable } from '@nestjs/common';
import { DBConnection } from './connection';  // Відповідний шлях до вашого модуля
import { Logger } from 'nestjs-pino';
import { DBErrorException } from '../exceptions/exceptions';
import { ETables } from './enums';

export abstract class BaseDBMapper {
  protected dbConnection: DBConnection;
  protected log: Logger;

  constructor(dbConnection: DBConnection, log: Logger) {
    this.dbConnection = dbConnection;
    this.log = log;
  }
  
  private isEmpty(data: any): boolean {
    if (Array.isArray(data)) {
      return data.length === 0;
    }
    return Object.keys(data).length === 0;
  }

  /**
   * Creates new records in the specified table with the provided data.
   *
   * @param {string} tableName - The name of the table where the records will be inserted.
   * @param {T | T[]} data - The data to be inserted into the table. It can be a single object or an array of objects.
   * @return {Promise<R[]>} A promise that resolves to an array of the inserted records.
   * @throws {Error} If the data is empty.
   * @throws {DBErrorException} If there is an error executing the database query.
   */
  async create<T, R>(tableName: ETables, data: T | T[]): Promise<R[]> {
    if (this.isEmpty(data)) throw new Error('Cannot insert empty data');

    const client = await this.dbConnection.getClient();
    try {
      const keys = Object.keys(data[0] || data);
      const valuesArray = Array.isArray(data) ? data : [data];
      const values = valuesArray.flatMap((d: any) => keys.map(k => d[k]));
      const valuePlaceholders = valuesArray
        .map((_, rowIndex) => `(${keys.map((_, colIndex) => `$${rowIndex * keys.length + colIndex + 1}`).join(', ')})`)
        .join(', ');

      const query = `
        INSERT INTO ${tableName} (${keys.join(', ')})
        VALUES ${valuePlaceholders}
        RETURNING *`;

      const res = await client.query(query, values);
      return res.rows;
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Updates a row in the specified table with the given data, based on the provided filter.
   *
   * @param {string} tableName - The name of the table to update.
   * @param {object} [filter={}] - An optional filter object to specify which row(s) to update.
   * @param {object} data - The data to update the row(s) with.
   * @return {Promise<object>} A Promise that resolves to the updated row(s) or null if no rows were updated.
   * @throws {DBErrorException} If an error occurs while updating the row(s).
   */
  async update<T, R>(tableName: ETables, filter: any = {}, data: T): Promise<R[]> {
    const client = this.dbConnection.getClient();
    try {
      const keys = Object.keys(data);
      const values = keys.map(key => data[key]);
      const filterKeys = Object.keys(filter);
      const filterValues = filterKeys.map(key => filter[key]);

      const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const whereClauses = filterKeys.map((key, i) => `${key} = $${keys.length + i + 1}`).join(' AND ');

      const query = `
        UPDATE ${tableName}
        SET ${setClauses}
        WHERE ${whereClauses}
        RETURNING *`;

      const res = await client.query(query, [...values, ...filterValues]);
      return res.rows;
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Deletes records from a table based on a filter condition.
   *
   * @param {string} tableName - The name of the table.
   * @param {any} [filter={}] - The filter condition to apply.
   * @return {Promise<T[]>} - A promise that resolves to an array of deleted records.
   * @throws {DBErrorException} - If there is an error executing the database query.
   */
  async delete<T>(tableName: ETables, filter: any = {}): Promise<T[]> {
    const client = this.dbConnection.getClient();
    try {
      const keys = Object.keys(filter);
      const values = keys.map(key => filter[key]);
      const whereClause = keys.length
        ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
        : '';

      const query = `
        DELETE FROM ${tableName}
        ${whereClause}
        RETURNING *`;

      const res = await client.query(query, values);
      return res.rows;
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Retrieves data from the database table based on the provided filter.
   *
   * @param {string} tableName - The name of the database table to retrieve data from.
   * @param {any} [filter={}] - The filter criteria to apply when fetching data.
   * @return {Promise<T>} A promise that resolves with the retrieved data.
   */
  async get<T>(tableName: ETables, filter: any = {}): Promise<T> {
    const client = this.dbConnection.getClient();
    try {
      const keys = Object.keys(filter);
      const values = keys.map(key => filter[key]);
      const whereClause = keys.length
        ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
        : '';

      const query = `
        SELECT * FROM ${tableName}
        ${whereClause}
        LIMIT 1`; // Додаємо LIMIT 1 для обмеження результатів до одного рядка

      const res = await client.query(query, values);
      return res.rows[0];
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Retrieves a list of data from the database table based on the provided filter.
   *
   * @param {string} tableName - The name of the database table to retrieve data from.
   * @param {any} [filter={}] - The filter criteria to apply when fetching data.
   * @return {Promise<T[]>} A promise that resolves with the list of retrieved data.
   */
  async list<T>(tableName: ETables, filter: Record<string, any> = {}): Promise<T[]> {
    const client = this.dbConnection.getClient();
    try {
      const keys = Object.keys(filter);
      const values = keys.map(key => filter[key]);
      const whereClause = keys.length
        ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
        : '';

      const query = `
        SELECT * FROM ${tableName}
        ${whereClause}`;

      const res = await client.query(query, values);
      return res.rows;
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  async count(tableName: ETables, filter: Record<string, any> = {}): Promise<number> {
    const client = this.dbConnection.getClient();
    try {
      const keys = Object.keys(filter);
      const values = keys.map(key => filter[key]);
      const whereClause = keys.length
        ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
        : '';

      const query = `
        SELECT COUNT(*) FROM ${tableName}
        ${whereClause}`;

      const res = await client.query(query, values);
      return parseInt(res.rows[0].count, 10); // Перетворення результату на число
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }
}

@Injectable()
export class DBMapper extends BaseDBMapper {
  dbConnection: DBConnection;
  log: Logger;

  constructor(dbConnection: DBConnection, log: Logger) {
    super(dbConnection, log);
    this.dbConnection = dbConnection;
    this.log = log;
  }

  async raw<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    try {
      const keys = Object.keys(params);
      const values = keys.map(key => params[key]);
      const parameterizedQuery = query.replace(/:([a-zA-Z0-9_]+)/g, (match, p1) => {
        const index = keys.indexOf(p1);
        if (index !== -1) {
          return `$${index + 1}`;
        }
        return match;
      });

      const res = await this.dbConnection.getClient().query(parameterizedQuery, values);
      return res.rows;
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  async transaction() {
    const client = await this.dbConnection.getClient()
    await client.query('BEGIN');
    return new TransactionalClient(client, this.log);
  }
}

class TransactionalClient extends BaseDBMapper {
  constructor(dbConnection: DBConnection, log: Logger) {
    super(dbConnection.getClient(), log);
  }
  async commit() {
    try {
      await this.dbConnection.getClient().query('COMMIT');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    } finally {
      this.dbConnection.getClient().release();
    }
  }

  async rollback() {
    try {
      await this.dbConnection.getClient().query('ROLLBACK');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    } finally {
      this.dbConnection.getClient().release();
    }
  }
}
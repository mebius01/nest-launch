/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { DBConnection } from './connection';
import { Logger } from 'nestjs-pino';
import { DBErrorException } from '../exceptions/exceptions';
import { ETables } from './enums';

export class QueryBuilder { 

  /**
  * Checks if the given data is empty.
  *
  * @param {any} data - The data to check for emptiness.
  * @return {boolean} Returns true if the data is empty, false otherwise.
  */
  private isEmpty(data: any): boolean {
    if (Array.isArray(data)) {
      return data.length === 0;
    }
    return Object.keys(data).length === 0;
  }

  /**
   * Creates an SQL query for inserting data into a specific table.
   *
   * @param {ETables} tableName - The name of the table to insert data into.
   * @param {any | any[]} data - The data to be inserted into the table.
   * @return {{ sql: string, values: any[]; }} An object containing the SQL query and corresponding values.
   */
  create(tableName: ETables, data: any | any[]): { sql: string, values: any[]; } {
    if (this.isEmpty(data)) throw new Error('Cannot insert empty data');
    
    const keys = Object.keys(data[0] || data);
    const valuesArray = Array.isArray(data) ? data : [data];
    const values = valuesArray.flatMap((d: any) => keys.map(k => d[k]));
    const valuePlaceholders = valuesArray
      .map((_, rowIndex) => `(${keys.map((_, colIndex) => `$${rowIndex * keys.length + colIndex + 1}`).join(', ')})`)
      .join(', ');

    const sql = `
      INSERT INTO ${tableName} (${keys.join(', ')})
      VALUES ${valuePlaceholders}
      RETURNING *`;

    return { sql, values };
  }

  /**
   * Updates records in the specified table based on the provided filter and data.
   *
   * @param {ETables} tableName - The name of the table to update.
   * @param {any} filter - The filter criteria to apply to the update operation.
   * @param {any} data - The new data to set in the updated records.
   * @return {{ sql: string, values: any[]; }} An object containing the SQL query and corresponding values.
   */
  update(tableName: ETables, filter: any = {}, data: any): { sql: string, values: any[]; } {
    if (this.isEmpty(data)) throw new Error('Cannot update with empty data');

    const keys = Object.keys(data);
    const values = keys.map(key => data[key]);
    const filterKeys = Object.keys(filter);
    const filterValues = filterKeys.map(key => filter[key]);

    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClauses = filterKeys.map((key, i) => `${key} = $${keys.length + i + 1}`).join(' AND ');

    const sql = `
      UPDATE ${tableName}
      SET ${setClauses}
      WHERE ${whereClauses}
      RETURNING *`;
    
    return { sql, values: [...values, ...filterValues] };
  }

  /**
   * Deletes records from the specified table based on the provided filter.
   *
   * @param {ETables} tableName - The name of the table to delete from.
   * @param {any} filter - The filter criteria to apply to the delete operation.
   * @return {{ sql: string, values: any[]; }} An object containing the SQL query and corresponding values for the delete operation.
   */
  delete(tableName: ETables, filter: any = {}): { sql: string, values: any[]; } {
    const keys = Object.keys(filter);
    const values = keys.map(key => filter[key]);
    const whereClause = keys.length
      ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
      : '';

    const sql = `
      DELETE FROM ${tableName}
      ${whereClause}
      RETURNING *`;

    return { sql, values };
  }

  /**
   * A description of the entire function.
   *
   * @param {ETables} tableName - The name of the table to fetch data from.
   * @param {any} filter - The filter criteria to apply to the query.
   * @return {{ sql: string, values: any[]; }} An object containing the SQL query and corresponding values for the query.
   */
  get(tableName: ETables, filter: any = {}): { sql: string, values: any[]; } {
    const keys = Object.keys(filter);
    const values = keys.map(key => filter[key]);
    const whereClause = keys.length
      ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
      : '';

    const sql = `
      SELECT * FROM ${tableName}
      ${whereClause}
      LIMIT 1`;

    return { sql, values };
  }

  /**
   * Retrieves a list of records from the specified table based on the provided filter.
   *
   * @param {ETables} tableName - The name of the table to retrieve records from.
   * @param {any} [filter={}] - The filter criteria to apply to the query. Defaults to an empty object.
   * @return {{ sql: string, values: any[]; }} An object containing the SQL query and corresponding values for the query.
   */
  list(tableName: ETables, filter: any = {}): { sql: string, values: any[]; } {
    const keys = Object.keys(filter);
    const values = keys.map(key => filter[key]);
    const whereClause = keys.length
      ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
      : '';

    const sql = `
      SELECT * FROM ${tableName}
      ${whereClause}`;

    return { sql, values };
  }

  /**
   * Counts the number of records in the specified table that match the provided filter criteria.
   *
   * @param {ETables} tableName - The name of the table to count records from.
   * @param {Record<string, any>} [filter={}] - The filter criteria to apply to the count operation. Defaults to an empty object.
   * @return {{ sql: string, values: any[]; }} An object containing the SQL query and corresponding values for the count operation.
   */
  count(tableName: ETables, filter: Record<string, any> = {}): { sql: string, values: any[]; } {
    const keys = Object.keys(filter);
    const values = keys.map(key => filter[key]);
    const whereClause = keys.length
      ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`
      : '';

    const sql = `
      SELECT COUNT(*) FROM ${tableName}
      ${whereClause}`;

    return { sql, values };
  }

  /**
   * A function that processes a raw query with parameters.
   *
   * @param {string} query - The raw SQL query.
   * @param {Record<string, any>} [params={}] - The parameters to be substituted in the query. Defaults to an empty object.
   * @return {{ sql: string, values: any[]; }} An object containing the processed SQL query and corresponding values.
   */
  raw(query: string, params: Record<string, any> = {}): { sql: string, values: any[]; } {
    const keys = Object.keys(params);
    const values = keys.map(key => params[key]);
    const sql = query.replace(/:([a-zA-Z0-9_]+)/g, (match, p1) => {
      const index = keys.indexOf(p1);
      if (index !== -1) {
        return `$${index + 1}`;
      }
      return match;
    });

    return { sql, values };
  }

  upsert(tableName: ETables, data: any | any[], conflictColumns: string[], ignore: boolean): { sql: string, values: any[]; } {
    if (this.isEmpty(data)) throw new Error('Cannot insert empty data');
    const keys = Object.keys(data[0] || data);
    const valuesArray = Array.isArray(data) ? data : [data];
    const values = valuesArray.flatMap((d: any) => keys.map(k => d[k]));
    const valuePlaceholders = valuesArray
      .map((_, rowIndex) => `(${keys.map((_, colIndex) => `$${rowIndex * keys.length + colIndex + 1}`).join(', ')})`)
      .join(', ');

    let onConflictClause = `ON CONFLICT (${conflictColumns.join(', ')})`;
    if (ignore) {
      onConflictClause += ' DO NOTHING';
    } else {
      const updateClause = keys.map(key => `${key} = EXCLUDED.${key}`).join(', ');
      onConflictClause += ` DO UPDATE SET ${updateClause}`;
    }

    const sql = `
      INSERT INTO ${tableName} (${keys.join(', ')})
      VALUES ${valuePlaceholders}
      ${onConflictClause}
      RETURNING *`;

    return { sql, values };
  }
}


@Injectable()
export class DBMapper {
  constructor(
    private readonly connection: DBConnection,
    private readonly log: Logger,
    private readonly queryBuilder: QueryBuilder
  ) { }

  /**
   * Executes an SQL query with the provided SQL string and values, and returns the result.
   *
   * @param {string} sql - The SQL string to execute.
   * @param {any[]} values - An array of values to be used in the SQL query.
   * @return {Promise<any>} A promise that resolves to the result of the SQL query.
   * @throws {DBErrorException} If there is an error executing the SQL query.
   */
  private async push(sql: string, values: any[]): Promise<any> {
    const client = await this.connection.getClient;
    try {
      return await client.query(sql, values);
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Begins a new transaction.
   *
   * @return {Promise<void>} - A promise that resolves when the transaction begins.
   */
  async transaction(): Promise<void> {
    const client = await this.connection.getClient;
    try {
      await client.query('BEGIN');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Commits the current transaction.
   *
   * @return {Promise<void>} - A promise that resolves when the transaction is committed.
   */
  async commit(): Promise<void> {
    const client = await this.connection.getClient;
    try {
      await client.query('COMMIT');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Rolls back the current transaction.
   *
   * @return {Promise<void>} - A promise that resolves when the transaction is rolled back.
   */
  async rollback(): Promise<void> {
    const client = await this.connection.getClient;
    try {
      await client.query('ROLLBACK');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  /**
   * Creates new records in the specified table.
   *
   * @param {ETables} tableName - The name of the table to insert data into.
   * @param {T | T[]} data - The data to be inserted into the table. Can be a single object or an array of objects.
   * @return {Promise<R[]>} - A promise that resolves to an array of the inserted records.
   */
  async create<T, R>(tableName: ETables, data: T | T[]): Promise<R[]> {
    const { sql, values } = this.queryBuilder.create(tableName, data);
    const res = await this.push(sql, values);
    return res.rows;
  }

  /**
   * Updates records in the specified table based on the provided filter and data.
   *
   * @param {ETables} tableName - The name of the table to update.
   * @param {any} filter - The filter criteria to apply to the update operation.
   * @param {T} data - The new data to set in the updated records.
   * @return {Promise<R[]>} - A promise that resolves to an array of the updated records.
   */
  async update<T, R>(tableName: ETables, filter: any = {}, data: T): Promise<R[]> {
    const { sql, values } = this.queryBuilder.update(tableName, filter, data);
    const res = await this.push(sql, values);
    return res.rows;
  }

  /**
   * Deletes records from the specified table based on the provided filter.
   *
   * @param {ETables} tableName - The name of the table to delete from.
   * @param {any} filter - The filter criteria to apply to the delete operation.
   * @return {Promise<T[]>} A promise that resolves to an array of the deleted records.
   */
  async delete<T>(tableName: ETables, filter: any = {}): Promise<T[]> {
    const { sql, values } = this.queryBuilder.delete(tableName, filter);
    const res = await this.push(sql, values);
    return res.rows;
  }

  /**
   * Retrieves a single record from the specified table based on the provided filter.
   *
   * @param {ETables} tableName - The name of the table to fetch data from.
   * @param {any} [filter={}] - The filter criteria to apply to the query.
   * @return {Promise<T>} A promise that resolves to the retrieved record.
   */
  async get<T>(tableName: ETables, filter: any = {}): Promise<T> {
    const { sql, values } = this.queryBuilder.get(tableName, filter);
    const res = await this.push(sql, values);
    return res.rows[0];
  }

  /**
   * Retrieves a list of records from the specified table based on the provided filter.
   *
   * @param {ETables} tableName - The name of the table to fetch data from.
   * @param {Record<string, any>} [filter={}] - The filter criteria to apply to the query.
   * @return {Promise<T[]>} A promise that resolves to an array of the retrieved records.
   */
  async list<T>(tableName: ETables, filter: Record<string, any> = {}): Promise<T[]> {
    const { sql, values } = this.queryBuilder.list(tableName, filter);
    const res = await this.push(sql, values);
    return res.rows;
  }

  /**
   * Counts the number of records in the specified table that match the provided filter criteria.
   *
   * @param {ETables} tableName - The name of the table to count records from.
   * @param {Record<string, any>} [filter={}] - The filter criteria to apply to the count operation. Defaults to an empty object.
   * @return {Promise<number>} - A promise that resolves to the number of records that match the filter criteria.
   */
  async count(tableName: ETables, filter: Record<string, any> = {}): Promise<number> {
    const { sql, values } = this.queryBuilder.count(tableName, filter);
    const res = await this.push(sql, values);
    return parseInt(res.rows[0].count, 10)
  }

  /**
   * Executes a raw SQL query with parameters and returns the result as an array of objects.
   *
   * @param {string} query - The raw SQL query to execute.
   * @param {Record<string, any>} [params={}] - The parameters to be substituted in the query. Defaults to an empty object.
   * @return {Promise<T[]>} A promise that resolves to an array of objects representing the result of the query.
   */
  async raw<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    const { sql, values } = this.queryBuilder.raw(query, params);
    const res = await this.push(sql, values);
    return res.rows;
  }

  /**
   * Inserts or updates records in the specified table based on the provided data and conflict columns.
   *
   * @param {ETables} tableName - The name of the table to upsert data into.
   * @param {T | T[]} data - The data to be inserted or updated. Can be a single record or an array of records.
   * @param {string[]} conflictColumns - The columns to check for conflicts when upserting.
   * @param {boolean} [ignore=false] - Whether to ignore conflicts and not update existing records.
   * @return {Promise<R[]>} A promise that resolves to an array of the updated or inserted records.
   */
  async upsert<T, R>(tableName: ETables, data: T | T[], conflictColumns: string[], ignore = false): Promise<R[]> {
    const { sql, values } = this.queryBuilder.upsert(tableName, data, conflictColumns, ignore);
    const client = await this.connection.getClient;
    const res = await client.query(sql, values);
    return res.rows;
  }

}
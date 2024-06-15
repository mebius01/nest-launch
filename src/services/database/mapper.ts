import { Injectable } from '@nestjs/common';
import { DBConnection } from './connection';  // Відповідний шлях до вашого модуля
import { Logger } from 'nestjs-pino';
import { DBErrorException } from '../exceptions/exceptions';

@Injectable()
export class DBMapper {
  constructor(
    private readonly dbConnection: DBConnection,
    private readonly log: Logger,
  ) {}

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
  async create<T, R>(tableName: string, data: T | T[]): Promise<R[]> {
    if (this.isEmpty(data)) throw new Error('Cannot insert empty data');

    const client = this.dbConnection.getClient();
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

  async update<T, R>(tableName: string, filter: any = {}, data: T): Promise<R> {
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
      return res.rows[0];
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
  async delete<T>(tableName: string, filter: any = {}): Promise<T[]> {
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
  async get<T>(tableName: string, filter: any = {}): Promise<T> {
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
  async list<T>(tableName: string, filter: Record<string, any> = {}): Promise<T[]> {
    if (this.isEmpty(filter)) throw new Error('Filter cannot be empty');
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

  async raw<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    const client = this.dbConnection.getClient();
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

      const res = await client.query(parameterizedQuery, values);
      return res.rows;
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  async count(tableName: string, filter: Record<string, any> = {}): Promise<number> {
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

// async update(tableName: string, id: any, data: any): Promise<any> {
//   const client = this.dbConnection.getClient();
//   try {
//     const keys = Object.keys(data);
//     const values = keys.map(key => data[key]);
//     const query = `
//       UPDATE ${tableName}
//       SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')}
//       WHERE id = $${keys.length + 1}
//       RETURNING *`;

//     const res = await client.query(query, [...values, id]);
//     return res.rows[0];
//   } catch (error) {
//     this.log.error(error);
//     throw new Error('Database error');
//   }
// }

// async delete(tableName: string, id: any): Promise<any> {
//   const client = this.dbConnection.getClient();
//   try {
//     const query = `
//       DELETE FROM ${tableName}
//       WHERE id = $1
//       RETURNING *`;

//     const res = await client.query(query, [id]);
//     return res.rows[0];
//   } catch (error) {
//     this.log.error(error);
//     throw new Error('Database error');
//   }
// }

// async list(tableName: string, filter: any = {}): Promise<any[]> {
//   const client = this.dbConnection.getClient();
//   try {
//     const keys = Object.keys(filter);
//     const values = keys.map(key => filter[key]);
//     const query = `
//       SELECT * FROM ${tableName}
//       ${keys.length ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}` : ''}`;

//     const res = await client.query(query, values);
//     return res.rows;
//   } catch (error) {
//     this.log.error(error);
//     throw new Error('Database error');
//   }
// }

// async get(tableName: string, id: any): Promise<any> {
//   const client = this.dbConnection.getClient();
//   try {
//     const query = `
//       SELECT * FROM ${tableName}
//       WHERE id = $1`;

//     const res = await client.query(query, [id]);
//     return res.rows[0];
//   } catch (error) {
//     this.log.error(error);
//     throw new Error('Database error');
//   }
// }

// async count(tableName: string, filter: any = {}): Promise<number> {
//   const client = this.dbConnection.getClient();
//   try {
//     const keys = Object.keys(filter);
//     const values = keys.map(key => filter[key]);
//     const query = `
//       SELECT COUNT(*) FROM ${tableName}
//       ${keys.length ? `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}` : ''}`;

//     const res = await client.query(query, values);
//     return parseInt(res.rows[0].count, 10);
//   } catch (error) {
//     this.log.error(error);
//     throw new Error('Database error');
//   }
// }

// async transaction(operations: any[]): Promise<any> {
//   const client = this.dbConnection.getClient();
//   try {
//     await client.query('BEGIN');
//     const results = [];
//     for (const operation of operations) {
//       const { method, tableName, data, id } = operation;
//       let result;
//       switch (method) {
//         case 'create':
//           result = await this.create(tableName, data);
//           break;
//         case 'update':
//           result = await this.update(tableName, id, data);
//           break;
//         case 'delete':
//           result = await this.delete(tableName, id);
//           break;
//         default:
//           throw new Error('Unknown method');
//       }
//       results.push(result);
//     }
//     await client.query('COMMIT');
//     return results;
//   } catch (error) {
//     await client.query('ROLLBACK');
//     this.log.error(error);
//     throw new Error('Database transaction error');
//   }
// }
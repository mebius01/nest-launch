import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import configuration from '../../configuration/main.config';
//! fix update
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DBService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor() {
    this.client = new Client({ ...configuration().pg });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to the database', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect the database', error);
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }
}

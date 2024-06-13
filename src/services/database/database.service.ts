import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DBErrorException } from '../exceptions/exceptions';

@Injectable()
export class DBConnection implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor(
    private readonly config: ConfigService,
    private readonly log: Logger,
  ) {
    this.client = new Client(config.get('pg'));
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
      this.log.log('Database connected successfully');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      this.log.log('Database disconnected successfully');
    } catch (error) {
      this.log.error(error);
      throw new DBErrorException();
    }
  }

  getClient(): Client {
    return this.client;
  }
}

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DBMapper } from './mapper';
import { Logger } from 'nestjs-pino';

@Injectable()
export class DBInitializer {
  constructor(
    private readonly log: Logger,
    private readonly mapper: DBMapper,
    private readonly seedsDir: string,
  ) { }

  async seed() {
    const environment = process.env.NODE_ENV;
    const environmentDir = path.join(this.seedsDir, environment);

    if (!fs.existsSync(environmentDir)) {
      this.log.error(`Seeds directory ${environmentDir} does not exist`);
      return;
    }

    const filePath = path.join(environmentDir, 'init');

    try {
      const seedModule = await import(filePath);
      if (seedModule && seedModule.seed) {
        await seedModule.seed(this.mapper);
      }
    } catch (error) {
      this.log.error(error);
    }
  }
}

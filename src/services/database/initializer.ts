import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { DBMapper } from './mapper';

@Injectable()
export class DBInitializer {
  constructor(
    private readonly mapper: DBMapper,
    private readonly seedsDir: string,
  ) { }

  async seed() {
    const environment = process.env.NODE_ENV;
    const environmentDir = path.join(this.seedsDir, environment);

    if (!fs.existsSync(environmentDir)) {
      console.error(`Seeds directory for environment "${environment}" not found.`);
      return;
    }

    const seedFiles = fs.readdirSync(environmentDir);
    console.log('[34minitializer.ts:[33m25[35m(seedFiles)[37m', seedFiles);

    for (const file of seedFiles) {
      const filePath = path.join(environmentDir, file);
      console.log('[34minitializer.ts:[33m29[35m(filePath)[37m', filePath);
    //   const seedModule = require(filePath);
    //   if (seedModule && seedModule.seed) {
    //     await seedModule.seed(this.dbConnection);
    //   }
    }
  }
}
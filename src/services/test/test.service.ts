import { INestApplication} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../app.module";

export class E2EInit {
  private app: INestApplication;
  /**
   * Initializes the necessary modules and configurations before running the tests.
   * @return {Promise<void>} A promise that resolves when the initialization is complete.
   */
  async before(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    this.app = moduleFixture.createNestApplication();
    this.app.setGlobalPrefix('api');

    await this.app.init();
  }

  /**
   * Closes the application and quits the client after all tests have finished.
   * @return {Promise<void>} A promise that resolves when the application is closed and the client is quit.
   */
  async after(): Promise<void> {
    await this.app.close();
  }

  /**
   * Returns the Nest application instance.
   * @return {INestApplication} The Nest application instance.
   */
  get getApp(): INestApplication {
    return this.app;
  }

}

import { PG, PINO_MODE_CONFIG, REDIS } from "./export";

export default () => ({
  prefix: process.env.PREFIX,
  port: process.env.PORT,
  pino: {
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: PINO_MODE_CONFIG,
      },
    },
  },
  redis: REDIS,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  mail: {
    token: process.env.MAILTRAP_TOKEN,
    sender: process.env.MAILTRAP_SENDER,
  },
  pg: PG,
});

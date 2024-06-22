const NODE_ENV = process.env.NODE_ENV;

const PINO_MODE_CONFIG =
  NODE_ENV !== 'development' && NODE_ENV !== 'test'
    ? {
        messageFormat: '{req.method} {req.url} {res.statusCode} {msg}',
        ignore: 'req.headers,res.headers',
        colorize: false,
        singleLine: true,
      }
    : {
        messageFormat: '{req.method} {req.url} {res.statusCode} {msg}',
        ignore: 'req,res',
        colorize: true,
        singleLine: true,
      };

const cookieMaxAge = 6 * 24 * 60 * 60 * 1000;

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
  redis: {
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  },
  pg: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  ex: parseInt(process.env.TOKEN_EXPIRATION, 10),
});

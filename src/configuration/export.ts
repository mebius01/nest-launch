const NODE_ENV = process.env.NODE_ENV;

export const PG = NODE_ENV === 'test'
  ? {
    host: 'localhost',
    port: 5434,
    user: 'postgres',
    password: 'postgres',
    database: 'db_nest_launch_test',
  }
  : {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  };

export const REDIS = NODE_ENV === 'test'
  ? {
    host: 'localhost',
    port: 6381,
    password: 'redis',
    url: `redis://:redis@localhost:6381`,
  }
  : {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  };

export const PINO_MODE_CONFIG =
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
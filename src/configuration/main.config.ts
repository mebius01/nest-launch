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

const COOKIE_MODE_CONFIG =
  NODE_ENV !== 'development' && NODE_ENV !== 'test'
    ? {
        expires: new Date(Date.now() + cookieMaxAge),
        maxAge: cookieMaxAge,
        sameSite: 'none',
        httpOnly: true,
        secure: true,
      }
    : {
        expires: new Date(Date.now() + cookieMaxAge),
        maxAge: cookieMaxAge,
        sameSite: false,
        httpOnly: false,
        secure: false,
      };

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
  session: {
    name: 'auth',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: COOKIE_MODE_CONFIG,
  },
  redis: {
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  },
  pg: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
});

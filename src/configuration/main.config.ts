const cookieMaxAge = 6 * 24 * 60 * 60 * 1000;

const COOKIE_MODE_CONFIG =
  process.env.NODE_ENV == 'production'
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
  session: {
    name: 'auth',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: COOKIE_MODE_CONFIG,
  },
});

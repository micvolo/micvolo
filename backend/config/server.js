module.exports = ({ env }) => env('NODE_ENV') === 'production' ? prod(env) : dev(env)

const prod = (env) => ({
  proxy: true,
  url: env('MY_HEROKU_URL'),
  app: {
    keys: env.array('APP_KEYS')
  },
});

const dev = (env) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});

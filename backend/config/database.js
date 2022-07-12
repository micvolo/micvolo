const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

const devConnection = (env) => ({
  client: 'sqlite',
  connection: {
    filename: env('DATABASE_FILENAME', '.tmp/data.db'),
  },
  useNullAsDefault: true,
  debug: false,
});

const prodConnection = (env) => ({
  client: 'postgres',
  connection: {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: {
      rejectUnauthorized: false
    },
  },
  debug: false,
});

module.exports = ({ env }) => ({
  connection: prodConnection(env)
});

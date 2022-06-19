const devConnection = (env) => ({
  client: 'sqlite',
  connection: {
    filename: env('DATABASE_FILENAME', '.tmp/data.db'),
  },
  useNullAsDefault: true,
  debug: false,
});

const prodConnection = (env) => ({
  client: env('DATABASE_CLIENT', 'postgres'),
  connection: {
    host: env('DATABASE_HOST', 'localhost'),
    port: env('DATABASE_PORT', 5432),
    database: env('DATABASE_NAME', 'develop'),
    user: env('DATABASE_USERNAME', 'develop'),
    password: env('DATABASE_PASSWORD', 'develop'),
  },
  ssl: {
    rejectUnauthorized: false
  },
});

module.exports = ({ env }) => ({
  connection: env('NODE_ENV') === 'development' ? devConnection(env) : prodConnection(env)
});

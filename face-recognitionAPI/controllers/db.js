import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'doomw1ngs',
    password: process.env.DB_PASSWORD || 'Fg2380',
    database: process.env.DB_NAME || 'smart-brain',
  },
});

export default db;

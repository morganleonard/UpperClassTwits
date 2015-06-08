// Update with your config settings.

module.exports = {

  client: 'postgresql',
  connection: {
    database: 'knex_db',
    user     : process.env.APP_DB_USER     || 'wiz',
    password : process.env.APP_DB_PASSWORD || 'cadillac',
    //database : process.env.APP_DB_NAME     || 'knex_db'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }

};

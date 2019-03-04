require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.RDS_USERNAME,
    "password": process.env.RDS_PASSWORD,
    "database": "jobstates",
    "host": process.env.RDS_MASTER_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.RDS_USERNAME,
    "password": process.env.RDS_PASSWORD,
    "database": "jobstates",
    "host": process.env.RDS_MASTER_HOST,
    "dialect": "mysql",
    "operatorsAliases": false,
    "logging": false
  }
}

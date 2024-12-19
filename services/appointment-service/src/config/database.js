const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mydb',
  process.env.DB_USER || 'user',
  process.env.DB_PASSWORD || 'userpassword',
  {
    host: process.env.DB_HOST || 'mysql-service',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 5
    }
  }
);

module.exports = sequelize;

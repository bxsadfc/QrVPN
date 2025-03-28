const { Sequelize } = require('sequelize');
const { logger } = require('./logger');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Для Render требуется SSL
    },
  },
  logging: (msg) => logger.info(msg),
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    
    sequelize.connectionManager.on('error', (err) => {
      logger.error(`PostgreSQL connection error: ${err.message}`);
    });
  } catch (err) {
    logger.error(`PostgreSQL connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
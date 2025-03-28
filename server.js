require('dotenv').config();
const express = require('express');
const { Server } = require('ws');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const path = require('path');
const session = require('express-session');
const sanitizeHtml = require('sanitize-html');
const { i18n } = require('./config/i18n');
const { sequelize, connectDB } = require('./config/db');
const { logger } = require('./config/logger');
const paymentRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const { setupWebSocket } = require('./utils/websocket');
const { cleanupQrCodes } = require('./utils/cleanup');
const { setCsrfToken } = require('./middlewares/csrf');
const cluster = require('cluster');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    logger.warn(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(path.join(__dirname, 'client')));
  app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  }));
  app.use(i18n.init);
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }));
  app.use(setCsrfToken);

  connectDB().then(async () => {
    await sequelize.sync({ force: false }); // Создает таблицы, если их нет
    logger.info('Database tables synchronized');
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}, Worker ${process.pid}`);
    });
    const wss = new Server({ server });
    setupWebSocket(wss);
    setInterval(cleanupQrCodes, 60 * 60 * 1000);
  }).catch((err) => {
    logger.error(`Failed to start server due to DB error: ${err.message}`);
    process.exit(1);
  });

  app.use('/', paymentRoutes);
  app.use('/admin', adminRoutes);
}
const { exec } = require('child_process');
const { logger } = require('../config/logger');

const backupDatabase = () => {
  const command = `mongodump --uri="${process.env.MONGO_URI}" --out=./backups/backup_${Date.now()}`;
  exec(command, (err) => {
    if (err) logger.error(`Backup error: ${err.message}`);
    else logger.info('Database backup completed');
  });
};

setInterval(backupDatabase, 24 * 60 * 60 * 1000); // Ежедневный бэкап

module.exports = { backupDatabase };
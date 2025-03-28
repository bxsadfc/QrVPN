const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'ru', 'es', 'fr', 'hi'],
  directory: path.join(__dirname, '../client/languages'),
  defaultLocale: 'en',
  objectNotation: true,
});

module.exports = { i18n };
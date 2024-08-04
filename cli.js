#!/usr/bin/env node

require('dotenv').config();
const { program } = require('commander');
const TranslationSync = require('./src/translation-sync');

program
  .version('1.0.0')
  .option('-p, --project <id>', 'Project ID (overrides OPENTRANSLATE_PROJECT_ID)')
  .option('-k, --key <apiKey>', 'API Key (overrides OPENTRANSLATE_API_KEY)')
  .option('-d, --dir <dir>', 'Directory for translations', './locales')
  .option('-l, --locales <locales>', 'Comma-separated list of locales to sync')
  .parse(process.argv);

const options = program.opts();

try {
  const sync = new TranslationSync(
    options.project || process.env.OPENTRANSLATE_PROJECT_ID,
    options.key || process.env.OPENTRANSLATE_API_KEY
  );

  const locales = options.locales ? options.locales.split(',').map(locale => locale.trim()) : null;
  sync.sync(options.dir, locales);
} catch (error) {
  console.error('An error occurred:', error.message);
  process.exit(1);
}
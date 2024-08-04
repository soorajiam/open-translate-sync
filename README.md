// README.md
# @opentranslate.dev/sync

A server-side compatible tool for syncing translations, part of the opentranslate.dev ecosystem.

## Installation

```
npm install @opentranslate.dev/sync
```

## Configuration

Create a `.env` file in your project root with the following content:

```
OPENTRANSLATE_API_KEY=your_api_key_here
OPENTRANSLATE_PROJECT_ID=your_project_id_here
```

## Usage

### As a library

```javascript
require('dotenv').config();
const TranslationSync = require('@opentranslate.dev/sync');

const sync = new TranslationSync();

// Sync all locales in the directory
await sync.sync('./locales');

// Sync specific locales
await sync.sync('./locales', ['en-us', 'fr-fr', 'ml-in']);

// Sync a single locale
await sync.syncLocale('en-us', './locales');
```

### As a CLI tool

Sync all locales in the directory:
```
npx opentranslate-sync -d ./locales
```

Sync specific locales:
```
npx opentranslate-sync -d ./locales -l en-us,fr-fr,ml-in
```

For more information, run:
```
npx opentranslate-sync --help
```

## How it works

For each locale, the sync process:
1. Uploads the current translation file to the server (if it exists)
2. Downloads the latest translation from the server
3. Saves the downloaded translation to the local file

This ensures that the server has the latest local changes before providing the most up-to-date translation.

## License

MIT
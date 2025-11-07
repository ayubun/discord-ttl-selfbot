#!/usr/bin/env node

import UndiscordCore from './undiscord/undiscord-core.js';
import { toSnowflake } from './undiscord/utils/helpers.js';
import { log } from './undiscord/utils/log.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let excludeDms = false;
let verboseLogging = false;
let debugLogging = false;

// Help text
const showHelp = () => {
  console.log(`
Undiscord CLI

Usage: node cli.js [options]

Options:
  --token, -t          Discord authorization token (required)
  --author-id, -a      Author ID of messages to delete

  --guild-id(s), -g    Server/Guild ID(s) (use "@me" for DMs) (comma-separated)
                       Note: Leaving this blank will run the script against all guilds.
                             If you would like to exclude DMs, use: --exclude-dms
                             If you would like to only delete DMs, use: --guild-id @me
                             If you would like to exclude specific guilds, use: --ignore-guild-ids (comma-separated list)

  --channel-id(s), -c  Channel ID(s) to delete from (comma-separated)
                       Note: Leaving this blank will run the script against all channels for the provided guilds.
                             If you would like to exclude specific DM channels, use: --ignore-dm-ids (comma-separated list)

  --ignore-guild-id(s) Server/Guild ID(s) to IGNORE (comma-separated)
  --ignore-dm-id(s)    DM Channel ID(s) to IGNORE (comma-separated)

  --min-id             Only delete messages after this ID
  --min-age            Only delete messages after this many days old
  --max-id             Only delete messages before this ID
  --max-age            Only delete messages before this many days old

  --content            Filter messages containing this text
  --has-link           Filter messages with links (true/false)
  --has-file           Filter messages with files (true/false)
  --include-nsfw       Include NSFW channels (true/false)
  --include-pinned     Delete pinned messages (true/false)
  --pattern            Regex pattern to match message content

  --search-delay       Delay between search requests (ms, default: 100)
  --delete-delay       Delay between delete requests (ms, default: 1000)
  --max-attempts       Max attempts to delete a message (default: 2)

  --verbose, -v        Show verbose logs
  --debug, -d          Show debug logs
  --help, -h           Show this help message

Examples:
  # Delete all your messages in a specific channel
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "SERVER_ID" --channel-id "CHANNEL_ID"

  # Delete all your messages across all servers and DMs
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID"

  # Delete all your messages in all DMs only
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "@me"

  # Delete all your messages in specific DM channels
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "@me" --channel-id "DM1,DM2"

  # Delete messages from multiple servers (all channels)
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-ids "SERVER1,SERVER2,SERVER3"

  # Delete messages from all servers except specific ones
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --ignore-guild-ids "SERVER1,SERVER2"

  # Delete messages older than 30 days
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --min-age 30

  # Delete messages between 7 and 30 days old
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --min-age 7 --max-age 30

  # Delete only messages with links
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --has-link true

  # Delete messages containing specific text
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --content "hello" --guild-id "SERVER_ID"

  # Delete messages matching a regex pattern (case-insensitive)
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --pattern "^(hello|hi|hey)" --guild-id "SERVER_ID"
`);
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const nextArg = args[i + 1];

  switch (arg) {
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
      break;
    case '--token':
    case '-t':
      options.authToken = nextArg;
      i++;
      break;
    case '--author-id':
    case '-a':
      options.authorId = nextArg;
      i++;
      break;
    case '--guild-id':
    case '--guild-ids':
    case '-g':
      options.guildIds = nextArg ? nextArg.split(',').map(id => id.trim()) : [];
      i++;
      break;
    case '--channel-id':
    case '--channel-ids':
    case '-c':
      options.channelIds = nextArg ? nextArg.split(',').map(id => id.trim()) : [];
      i++;
      break;
    case '--ignore-guild-id':
    case '--ignore-guild-ids':
    case '--ignored-guild-id':
    case '--ignored-guild-ids':
      options.ignoredGuildIds = nextArg ? nextArg.split(',').map(id => id.trim()) : [];
      i++;
      break;
    case '--ignore-dm-id':
    case '--ignore-dm-ids':
    case '--ignored-dm-id':
    case '--ignored-dm-ids':
      options.ignoredDmIds = nextArg ? nextArg.split(',').map(id => id.trim()) : [];
      i++;
      break
    case '--min-id':
      options.minId = nextArg;
      i++;
      break;
    case '--max-id':
      options.maxId = nextArg;
      i++;
      break;
    case '--min-age-in-days':
    case '--min-age':
      options.minAge = parseInt(nextArg) || undefined;
      i++;
      break;
    case '--max-age-in-days':
    case '--max-age':
      options.maxAge = parseInt(nextArg) || undefined;
      i++;
      break
    case '--content':
      options.content = nextArg;
      i++;
      break;
    case '--has-link':
      options.hasLink = nextArg === 'true';
      i++;
      break;
    case '--has-file':
      options.hasFile = nextArg === 'true';
      i++;
      break;
    case '--include-nsfw':
      options.includeNsfw = nextArg === 'true';
      i++;
      break;
    case '--include-pinned':
    case '--include-pins':
      options.includePinned = nextArg === 'true';
      i++;
      break;
    case '--exclude-dms':
      excludeDms = true;
      break
    case '--pattern':
      options.pattern = nextArg;
      i++;
      break;
    case '--search-delay':
      options.searchDelay = parseInt(nextArg) || 30000;
      i++;
      break;
    case '--delete-delay':
      options.deleteDelay = parseInt(nextArg) || 1000;
      i++;
      break;
    case '--max-attempts':
      options.maxAttempt = parseInt(nextArg) || 2;
      i++;
      break;
    case '--no-confirm':
      options.askForConfirmation = false;
      break;
    case '--verbose':
    case '-v':
      verboseLogging = true;
      break;
    case '--debug':
    case '-d':
      debugLogging = true;
      break
    default:
      if (arg.startsWith('-')) {
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
      }
  }
}

// Validate required options
if (!options.authToken) {
  console.error('Error: --token is required');
  showHelp();
  process.exit(1);
}

if (!options.channelIds || options.channelIds.length === 0) {
  options.channelIds = [];
}

if (!options.guildIds || options.guildIds.length === 0) {
  options.guildIds = [];
  if (options.channelIds.length > 0) {
    console.error('Error: --channel-ids cannot be provided if --guild-id is empty');
    showHelp();
    process.exit(1);
  }
} else if (options.guildIds.length > 1) {
  if (options.channelIds.length > 0) {
    console.error('Error: --channel-ids cannot be provided if --guild-ids is greater than one');
    showHelp();
    process.exit(1);
  }
}

if (options.minId && options.minAge) {
  console.error('Error: --min-id and --min-age are mutually exclusive');
  showHelp();
  process.exit(1);
} else {
  if (options.minAge) {
    const date = new Date()
    date.setDate(date.getDate() + options.minAge);
    options.minId = toSnowflake(date);
    delete options.minAge;
  }
}

if (options.maxId && options.maxAge) {
  console.error('Error: --max-id and --max-age are mutually exclusive');
  showHelp();
  process.exit(1);
} else {
  if (options.maxAge) {
    const date = new Date()
    date.setDate(date.getDate() + options.maxAge);
    options.maxId = toSnowflake(date);
    delete options.maxAge;
  }
}

// Set defaults
options.searchDelay = options.searchDelay || 30000;
options.deleteDelay = options.deleteDelay || 1000;
options.maxAttempt = options.maxAttempt || 2;
options.askForConfirmation = false;

// Create and configure UndiscordCore
const undiscord = new UndiscordCore();

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.warn('Received SIGINT, stopping...');
  undiscord.stop();
});

process.on('SIGTERM', () => {
  log.warn('Received SIGTERM, stopping...');
  undiscord.stop();
});

// Configure event handlers
undiscord.onStart = (state, stats) => {
  log.info('🚀 Started deletion process');
};

undiscord.onPage = (state, stats) => {
  const percent = state.grandTotal > 0 ? ((state.delCount + state.failCount) / state.grandTotal * 100).toFixed(1) : 0;
  log.info(`Progress: ${percent}% (${state.delCount + state.failCount}/${state.grandTotal}) - Deleted: ${state.delCount}, Failed: ${state.failCount}`);
};

undiscord.onStop = (state, stats) => {
  log.success('✅ Deletion process completed');
  log.info(`Final stats - Deleted: ${state.delCount}, Failed: ${state.failCount}`);
  process.exit(0);
};

async function getAllGuildIds(authToken) {
  const API_URL = `https://discord.com/api/v9/users/@me/guilds`;
  let resp;
  try {
    resp = await fetch(API_URL, {
      headers: {
        'Authorization': authToken,
      }
    });
    if (!resp.ok) {
      throw Error('response was not ok:', resp)
    }
  } catch (err) {
    log.error('getAllGuildIds threw an error:', err);
    throw err;
  }
  const data = await resp.json();
  const guildIds = [];
  for (const guild of data) {
    if (guild.features) {
      // ignore staff affiliated servers
      if (guild.features.includes("PREMIUM_TIER_3_OVERRIDE") || guild.features.includes("INTERNAL_EMPLOYEE_ONLY")) {
        continue;
      }
    }
    guildIds.push(guild.id);
  }
  return guildIds;
}

async function getAllDmIds(authToken) {
  const API_URL = `https://discord.com/api/v9/users/@me/channels`;
  let resp;
  try {
    resp = await fetch(API_URL, {
      headers: {
        'Authorization': authToken,
      }
    });
    if (!resp.ok) {
      throw Error('response was not ok:', resp)
    }
  } catch (err) {
    log.error('getAllDmIds threw an error:', err);
    throw err;
  }
  const data = await resp.json();
  const dmIds = [];
  for (const dm of data) {
    dmIds.push(dm.id);
  }
  return dmIds;
}

// Main execution
async function main() {
  try {
    log.info('🔧 Configuring undiscord...');

    if (!debugLogging) {
      console.debug = function () { };
    }
    if (!verboseLogging) {
      log.verb = function () { };
    }

    // Set options
    undiscord.options = {
      ...undiscord.options,
      ...options,
      channelId: options.channelIds.length === 1 ? options.channelIds[0] : undefined,
      guildId: options.guildIds.length === 1 ? options.guildIds[0] : undefined,
      channelIds: undefined,
      guildIds: undefined,
      ignoredGuildIds: undefined,
      ignoredDmIds: undefined,
    };

    // collect jobs
    let shouldFetchDmIds = false;
    let jobs = [];
    if (undiscord.options.guildId === undefined) {
      // guild ids are either 0 or many
      if (options.guildIds.length === 0) {
        // guild ids were NOT provided
        shouldFetchDmIds = true;
        log.info('Fetching all Guild IDs...');
        let guildIds = await getAllGuildIds(options.authToken);
        if (options.ignoredGuildIds) {
          guildIds = guildIds.filter(id => !options.ignoredGuildIds.includes(id));
        }
        for (const guildId of guildIds) {
          jobs.push({
            guildId: guildId,
          });
        }
      } else {
        // multiple guild ids were provided
        if (options.guildIds.includes('@me')) {
          // one of the guild ids is for DMs @me
          // channel ids cannot be provided if multiple guild ids were provided, so we will fetch them all
          shouldFetchDmIds = true;
        }
        for (const guildId of options.guildIds) {
          if (guildId === '@me' || (options.ignoredGuildIds && options.ignoredGuildIds.includes(guildId))) {
            continue;
          }
          jobs.push({
            guildId: guildId,
          });
        }
      }
    } else {
      // guild id is exactly one
      if (undiscord.options.guildId === '@me' && !excludeDms) {
        if (undiscord.options.channelId === undefined) {
          shouldFetchDmIds = true;
        } else {
          // no need to fetch dms, the user has provided them
          for (const dmId of options.channelIds) {
            jobs.push({
              guildId: '@me',
              channelId: dmId,
            });
          }
        }
      }
    }
    if (shouldFetchDmIds && !excludeDms) {
      log.info('Fetching all DM Channel IDs...');
      let dmIds = await getAllDmIds(options.authToken);
      if (options.ignoredDmIds) {
        dmIds = dmIds.filter(id => !options.ignoredDmIds.includes(id));
      }
      for (const dmId of dmIds) {
        jobs.push({
          guildId: '@me',
          channelId: dmId,
        });
      }
    }

    // Run deletion
    if (jobs.length > 0) {
      if (jobs.length === 1) {
        log.warn('Running batch with exactly 1 job -- there is a bug in the batch creation code !');
      }
      log.info(`📦 Running ${jobs.length} batch jobs`);
      await undiscord.runBatch(jobs);
    } else {
      log.info('🎯 Running deletion');
      await undiscord.run();
    }

  } catch (error) {
    log.error('❌ Error during execution:', error.message);
    process.exit(1);
  }
}

main(); 

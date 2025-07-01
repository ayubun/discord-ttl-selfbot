#!/usr/bin/env node

import UndiscordCore from './undiscord/undiscord-core.js';
import { log } from './undiscord/utils/log.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

// Help text
const showHelp = () => {
  console.log(`
Discord TTL Selfbot CLI

Usage: node cli.js [options]

Options:
  --token, -t          Discord authorization token (required)
  --author-id, -a      Author ID of messages to delete
  --guild-id, -g       Server/Guild ID (use "@me" for DMs)
  --channel-id, -c     Channel ID or comma-separated list
  --min-id             Only delete messages after this ID
  --max-id             Only delete messages before this ID
  --content            Filter messages containing this text
  --has-link           Filter messages with links (true/false)
  --has-file           Filter messages with files (true/false)
  --include-nsfw       Include NSFW channels (true/false)
  --include-pinned     Delete pinned messages (true/false)
  --pattern            Regex pattern to match message content
  --search-delay       Delay between search requests (ms, default: 100)
  --delete-delay       Delay between delete requests (ms, default: 1000)
  --max-attempts       Max attempts to delete a message (default: 2)
  --no-confirm         Skip confirmation prompt
  --help, -h           Show this help message

Examples:
  # Delete all your messages in a channel
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "SERVER_ID" --channel-id "CHANNEL_ID"
  
  # Delete messages in DMs
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "@me" --channel-id "DM_CHANNEL_ID"
  
  # Delete messages with specific content
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "SERVER_ID" --channel-id "CHANNEL_ID" --content "hello"
  
  # Delete from multiple channels
  node cli.js --token "YOUR_TOKEN" --author-id "YOUR_USER_ID" --guild-id "SERVER_ID" --channel-id "CHANNEL1,CHANNEL2,CHANNEL3"
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
  case '-g':
    options.guildId = nextArg;
    i++;
    break;
  case '--channel-id':
  case '-c':
    options.channelIds = nextArg ? nextArg.split(',').map(id => id.trim()) : [];
    i++;
    break;
  case '--min-id':
    options.minId = nextArg;
    i++;
    break;
  case '--max-id':
    options.maxId = nextArg;
    i++;
    break;
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
    options.includePinned = nextArg === 'true';
    i++;
    break;
  case '--pattern':
    options.pattern = nextArg;
    i++;
    break;
  case '--search-delay':
    options.searchDelay = parseInt(nextArg) || 100;
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

if (!options.guildId) {
  console.error('Error: --guild-id is required');
  showHelp();
  process.exit(1);
}

if (!options.channelIds || options.channelIds.length === 0) {
  console.error('Error: --channel-id is required');
  showHelp();
  process.exit(1);
}

// Set defaults
options.searchDelay = options.searchDelay || 100;
options.deleteDelay = options.deleteDelay || 1000;
options.maxAttempt = options.maxAttempt || 2;
options.askForConfirmation = options.askForConfirmation !== false;

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

undiscord.onProgress = (state, stats) => {
  const percent = state.grandTotal > 0 ? ((state.delCount + state.failCount) / state.grandTotal * 100).toFixed(1) : 0;
  log.info(`Progress: ${percent}% (${state.delCount + state.failCount}/${state.grandTotal}) - Deleted: ${state.delCount}, Failed: ${state.failCount}`);
};

undiscord.onStop = (state, stats) => {
  log.success('✅ Deletion process completed');
  log.info(`Final stats - Deleted: ${state.delCount}, Failed: ${state.failCount}`);
  process.exit(0);
};

// Main execution
async function main() {
  try {
    log.info('🔧 Configuring undiscord...');
    
    // Set options
    undiscord.options = {
      ...undiscord.options,
      ...options,
      channelId: options.channelIds.length === 1 ? options.channelIds[0] : undefined
    };

    log.info('Configuration:', {
      guildId: options.guildId,
      channelIds: options.channelIds,
      authorId: options.authorId || 'not specified',
      searchDelay: options.searchDelay,
      deleteDelay: options.deleteDelay
    });

    // Run deletion
    if (options.channelIds.length > 1) {
      // Multiple channels - run batch
      const jobs = options.channelIds.map(channelId => ({
        guildId: options.guildId,
        channelId: channelId,
      }));
      
      log.info(`📦 Running batch job for ${jobs.length} channels`);
      await undiscord.runBatch(jobs);
    } else {
      // Single channel
      log.info('🎯 Running single channel deletion');
      await undiscord.run();
    }
    
  } catch (error) {
    log.error('❌ Error during execution:', error.message);
    process.exit(1);
  }
}

main(); 
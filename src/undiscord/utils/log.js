import chalk from 'chalk';

// Helper function to strip HTML tags and apply chalk colors
function formatMessage(...args) {
  return args.map(arg => {
    if (typeof arg !== 'string') return arg;

    // Replace HTML tags with chalk colors
    return arg
      .replace(/<sup>(.*?)<\/sup>/g, (_, text) => chalk.dim(text))
      .replace(/<b>(.*?)<\/b>/g, (_, text) => chalk.bold.cyan(text))
      .replace(/<i>(.*?)<\/i>/g, (_, text) => chalk.italic(text))
      .replace(/<[^>]+>/g, ''); // Remove any remaining HTML tags
  });
}

export const log = {
  debug() {
    const formatted = formatMessage(...arguments);
    return logFn ? logFn('debug', formatted) : console.debug(chalk.gray('[DEBUG]'), ...formatted);
  },
  info() {
    const formatted = formatMessage(...arguments);
    return logFn ? logFn('info', formatted) : console.info(chalk.blue('[INFO]'), ...formatted);
  },
  verb() {
    const formatted = formatMessage(...arguments);
    return logFn ? logFn('verb', formatted) : console.log(chalk.gray('[VERBOSE]'), ...formatted);
  },
  warn() {
    const formatted = formatMessage(...arguments);
    return logFn ? logFn('warn', formatted) : console.warn(chalk.yellow('[WARN]'), ...formatted);
  },
  error() {
    const formatted = formatMessage(...arguments);
    return logFn ? logFn('error', formatted) : console.error(chalk.red('[ERROR]'), ...formatted);
  },
  success() {
    const formatted = formatMessage(...arguments);
    return logFn ? logFn('success', formatted) : console.info(chalk.green('[SUCCESS]'), ...formatted);
  },
};

var logFn; // custom console.log function
export const setLogFn = (fn) => logFn = fn;
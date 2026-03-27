const { parseArgs } = require('node:util');

function getUsageText() {
  return [
    'Usage: node cli/entry.js --input <queue.txt> [options]',
    '',
    'Options:',
    '  --input <path>                 Queue file containing one page ID per line',
    '  --output <dir>                Override the default Downloads directory',
    '  --state <file>                Override the default resume-state file',
    '  --preserve-browser-data       Keep per-item browser data for debugging',
    '  --fail-fast                   Stop after the first failed item',
    '  --full-rerun                  Ignore completed items recorded in state',
    '  --headed                      Run with a visible browser window',
    '  --help                        Show this message',
  ].join('\n');
}

function parseCliArgs(argv = process.argv.slice(2)) {
  let parsed;

  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: false,
      options: {
        input: { type: 'string' },
        output: { type: 'string' },
        state: { type: 'string' },
        'preserve-browser-data': { type: 'boolean', default: false },
        'fail-fast': { type: 'boolean', default: false },
        'full-rerun': { type: 'boolean', default: false },
        headed: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
    });
  } catch (error) {
    throw new Error(`${error.message}\n\n${getUsageText()}`);
  }

  if (parsed.values.help) {
    return { help: true, options: {} };
  }

  if (!parsed.values.input) {
    throw new Error(`Missing required --input argument.\n\n${getUsageText()}`);
  }

  return {
    help: false,
    options: {
      input: parsed.values.input,
      output: parsed.values.output,
      state: parsed.values.state,
      preserveBrowserData: parsed.values['preserve-browser-data'],
      failFast: parsed.values['fail-fast'],
      fullRerun: parsed.values['full-rerun'],
      headed: parsed.values.headed,
    },
  };
}

module.exports = {
  getUsageText,
  parseCliArgs,
};

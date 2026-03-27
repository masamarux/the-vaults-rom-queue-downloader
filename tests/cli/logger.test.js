const test = require('node:test');
const assert = require('node:assert/strict');

const { createLogger } = require('../../cli/logger');

function createStreamBuffer() {
  let output = '';
  return {
    stream: {
      write(chunk) {
        output += chunk;
      },
    },
    read() {
      return output;
    },
  };
}

test('logger prints run start and summary messages', () => {
  const stdout = createStreamBuffer();
  const stderr = createStreamBuffer();
  const logger = createLogger({
    stdout: stdout.stream,
    stderr: stderr.stream,
    now: () => '2026-03-27T00:00:00.000Z',
  });

  logger.runStart({
    inputFilePath: '/tmp/queue.txt',
    outputDirectory: '/tmp/downloads',
    totalItems: 2,
  });
  logger.summary({
    completed: 1,
    failed: 0,
    skipped: 1,
    total: 2,
  });

  assert.match(stdout.read(), /starting queue/);
  assert.match(stdout.read(), /summary: completed=1 failed=0 skipped=1 total=2/);
  assert.equal(stderr.read(), '');
});

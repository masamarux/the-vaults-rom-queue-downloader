const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatBytes,
  formatProgressMessage,
  parseDisplayedBytes,
  shouldEmitProgressUpdate,
} = require('../../core/download-progress');

test('formatBytes renders human-readable values', () => {
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2.0 KB');
});

test('shouldEmitProgressUpdate fires on heartbeat timeout', () => {
  assert.equal(
    shouldEmitProgressUpdate({
      now: 31_000,
      lastLoggedAt: 0,
      bytesDownloaded: undefined,
      previousBytesDownloaded: undefined,
      heartbeatMs: 30_000,
    }),
    true
  );
});

test('formatProgressMessage falls back to heartbeat messaging', () => {
  assert.match(
    formatProgressMessage({ heartbeatCount: 2 }),
    /heartbeat 2/
  );
});

test('parseDisplayedBytes converts page size labels to bytes', () => {
  assert.equal(parseDisplayedBytes('1.52 GB'), 1632087572);
  assert.equal(parseDisplayedBytes('512 MB'), 536870912);
  assert.equal(parseDisplayedBytes('invalid'), null);
});

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createEmptyRunState,
  recordItemOutcome,
  shouldSkipQueueItem,
} = require('../../core/run-state');

const queueItem = {
  index: 1,
  normalizedId: '12345',
  sourceLine: 1,
};

test('shouldSkipQueueItem returns false before a completion record exists', () => {
  const state = createEmptyRunState({
    inputFilePath: '/tmp/queue.txt',
    queueFingerprint: 'abc',
  });

  assert.equal(shouldSkipQueueItem(state, queueItem), false);
});

test('shouldSkipQueueItem returns true after a completed attempt', () => {
  const state = createEmptyRunState({
    inputFilePath: '/tmp/queue.txt',
    queueFingerprint: 'abc',
  });

  recordItemOutcome(state, queueItem, {
    status: 'completed',
    savedFilePath: '/tmp/download.bin',
  });

  assert.equal(shouldSkipQueueItem(state, queueItem), true);
});

test('failed attempts do not create duplicate-after-success skips', () => {
  const state = createEmptyRunState({
    inputFilePath: '/tmp/queue.txt',
    queueFingerprint: 'abc',
  });

  recordItemOutcome(state, queueItem, {
    status: 'failed',
    errorMessage: 'network timeout',
  });

  assert.equal(shouldSkipQueueItem(state, queueItem), false);
});

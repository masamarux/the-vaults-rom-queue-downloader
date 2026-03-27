const test = require('node:test');
const assert = require('node:assert/strict');

const { createQueueFingerprint, parseQueueText } = require('../../core/queue');

test('parseQueueText ignores blank lines and trims IDs', () => {
  const items = parseQueueText('\n 12345 \n\n67890\n');

  assert.deepEqual(items, [
    { index: 1, rawId: '12345', normalizedId: '12345', sourceLine: 2 },
    { index: 2, rawId: '67890', normalizedId: '67890', sourceLine: 4 },
  ]);
});

test('parseQueueText preserves duplicate order', () => {
  const items = parseQueueText('111\n222\n111\n');
  assert.deepEqual(
    items.map((item) => item.normalizedId),
    ['111', '222', '111']
  );
});

test('createQueueFingerprint is stable for the same ordered queue', () => {
  const items = parseQueueText('111\n222\n111\n');
  const first = createQueueFingerprint(items);
  const second = createQueueFingerprint(items);

  assert.equal(first, second);
});

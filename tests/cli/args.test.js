const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCliArgs } = require('../../cli/args');

test('parseCliArgs reads required input and boolean flags', () => {
  const parsed = parseCliArgs([
    '--input',
    './queue.txt',
    '--output',
    './downloads',
    '--preserve-browser-data',
    '--fail-fast',
    '--full-rerun',
    '--headed',
  ]);

  assert.equal(parsed.help, false);
  assert.deepEqual(parsed.options, {
    input: './queue.txt',
    output: './downloads',
    state: undefined,
    preserveBrowserData: true,
    failFast: true,
    fullRerun: true,
    headed: true,
  });
});

test('parseCliArgs throws without the required input flag', () => {
  assert.throws(() => parseCliArgs([]), /Missing required --input argument/);
});

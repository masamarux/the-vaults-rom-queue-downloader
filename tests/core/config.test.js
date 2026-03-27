const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  DEFAULT_STATE_FILENAME,
  getDefaultDownloadsDirectory,
  resolveConfig,
} = require('../../core/config');

test('getDefaultDownloadsDirectory points to the user Downloads folder', () => {
  assert.equal(getDefaultDownloadsDirectory('/tmp/example'), '/tmp/example/Downloads');
});

test('resolveConfig prefers CLI output over environment output', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
  const inputFile = path.join(tempDir, 'queue.txt');
  const cliOutput = path.join(tempDir, 'cli-output');
  const envOutput = path.join(tempDir, 'env-output');

  await fs.writeFile(inputFile, '12345\n');

  const config = await resolveConfig(
    {
      input: inputFile,
      output: cliOutput,
      preserveBrowserData: false,
      failFast: false,
      fullRerun: false,
      headed: false,
    },
    {
      ROM_QUEUE_OUTPUT_DIR: envOutput,
    }
  );

  assert.equal(config.outputDirectory, cliOutput);
  assert.equal(config.resumeStatePath, path.join(cliOutput, DEFAULT_STATE_FILENAME));
});

test('resolveConfig falls back to environment output and headed mode', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
  const inputFile = path.join(tempDir, 'queue.txt');
  const envOutput = path.join(tempDir, 'env-output');

  await fs.writeFile(inputFile, '12345\n');

  const config = await resolveConfig(
    {
      input: inputFile,
      preserveBrowserData: false,
      failFast: false,
      fullRerun: false,
    },
    {
      ROM_QUEUE_OUTPUT_DIR: envOutput,
      ROM_QUEUE_HEADED: 'true',
    }
  );

  assert.equal(config.outputDirectory, envOutput);
  assert.equal(config.headed, true);
  assert.equal(config.headless, false);
});

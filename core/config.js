const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const DEFAULT_PROGRESS_HEARTBEAT_SECONDS = 30;
const DEFAULT_STATE_FILENAME = '.rom-queue-state.json';

function envToBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

function envToInteger(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive integer value: ${value}`);
  }

  return parsed;
}

function getDefaultDownloadsDirectory(homeDir = os.homedir()) {
  return path.join(homeDir, 'Downloads');
}

async function ensureReadableFile(filePath) {
  await fs.access(filePath);
}

async function ensureWritableDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });

  const probePath = path.join(
    directoryPath,
    `.write-probe-${process.pid}-${Date.now()}`
  );

  await fs.writeFile(probePath, 'probe');
  await fs.rm(probePath, { force: true });
}

async function resolveConfig(cliOptions, env = process.env) {
  const inputFilePath = cliOptions.input;
  if (!inputFilePath) {
    throw new Error('Missing required --input argument.');
  }

  await ensureReadableFile(inputFilePath);

  const outputDirectory =
    cliOptions.output ||
    env.ROM_QUEUE_OUTPUT_DIR ||
    getDefaultDownloadsDirectory();

  await ensureWritableDirectory(outputDirectory);

  const statePath =
    cliOptions.state ||
    env.ROM_QUEUE_STATE_FILE ||
    path.join(outputDirectory, DEFAULT_STATE_FILENAME);

  await ensureWritableDirectory(path.dirname(statePath));

  const preserveBrowserData =
    cliOptions.preserveBrowserData ??
    envToBoolean(env.ROM_QUEUE_PRESERVE_BROWSER_DATA) ??
    false;

  const failFast =
    cliOptions.failFast ?? envToBoolean(env.ROM_QUEUE_FAIL_FAST) ?? false;

  const headed =
    cliOptions.headed ?? envToBoolean(env.ROM_QUEUE_HEADED) ?? false;

  const progressHeartbeatSeconds =
    envToInteger(env.ROM_QUEUE_PROGRESS_HEARTBEAT_SECONDS) ??
    DEFAULT_PROGRESS_HEARTBEAT_SECONDS;

  return {
    inputFilePath,
    outputDirectory,
    resumeStatePath: statePath,
    preserveBrowserData,
    failFast,
    fullRerun: cliOptions.fullRerun ?? false,
    headed,
    headless: !headed,
    progressHeartbeatSeconds,
  };
}

module.exports = {
  DEFAULT_PROGRESS_HEARTBEAT_SECONDS,
  DEFAULT_STATE_FILENAME,
  envToBoolean,
  getDefaultDownloadsDirectory,
  resolveConfig,
};

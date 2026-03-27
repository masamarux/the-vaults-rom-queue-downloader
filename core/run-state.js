const fs = require('node:fs/promises');

const STATE_VERSION = 1;

function createEmptyRunState({ inputFilePath, queueFingerprint }) {
  return {
    version: STATE_VERSION,
    queueFingerprint,
    inputFilePath,
    updatedAt: new Date().toISOString(),
    items: {},
  };
}

function getQueueItemKey(queueItem) {
  return queueItem.normalizedId;
}

async function loadRunState(
  statePath,
  { inputFilePath, queueFingerprint, fullRerun = false }
) {
  let existingState;

  try {
    existingState = JSON.parse(await fs.readFile(statePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return createEmptyRunState({ inputFilePath, queueFingerprint });
    }

    throw error;
  }

  if (
    fullRerun ||
    existingState.version !== STATE_VERSION ||
    existingState.queueFingerprint !== queueFingerprint ||
    existingState.inputFilePath !== inputFilePath
  ) {
    return createEmptyRunState({ inputFilePath, queueFingerprint });
  }

  return {
    version: STATE_VERSION,
    queueFingerprint,
    inputFilePath,
    updatedAt: existingState.updatedAt || new Date().toISOString(),
    items: existingState.items || {},
  };
}

function shouldSkipQueueItem(state, queueItem, { fullRerun = false } = {}) {
  if (fullRerun) {
    return false;
  }

  const key = getQueueItemKey(queueItem);
  const entry = state.items[key];
  return Boolean(entry && entry.lastStatus === 'completed');
}

function recordItemOutcome(state, queueItem, outcome) {
  const key = getQueueItemKey(queueItem);
  const existingEntry = state.items[key] || {
    normalizedId: queueItem.normalizedId,
    attempts: [],
  };

  const attempt = {
    at: new Date().toISOString(),
    status: outcome.status,
    sourceLine: queueItem.sourceLine,
    savedFilePath: outcome.savedFilePath || null,
    errorMessage: outcome.errorMessage || null,
    skipReason: outcome.skipReason || null,
  };

  const updatedEntry = {
    ...existingEntry,
    normalizedId: queueItem.normalizedId,
    lastStatus: outcome.status,
    lastUpdatedAt: attempt.at,
    savedFilePath:
      outcome.status === 'completed'
        ? outcome.savedFilePath
        : existingEntry.savedFilePath || null,
    skipReason: outcome.skipReason || null,
    errorMessage: outcome.errorMessage || null,
    attempts: [...existingEntry.attempts, attempt],
  };

  state.items[key] = updatedEntry;
  state.updatedAt = attempt.at;
  return state;
}

async function saveRunState(statePath, state) {
  const payload = JSON.stringify(state, null, 2);
  const temporaryPath = `${statePath}.tmp`;
  await fs.writeFile(temporaryPath, payload);
  await fs.rename(temporaryPath, statePath);
}

module.exports = {
  STATE_VERSION,
  createEmptyRunState,
  getQueueItemKey,
  loadRunState,
  recordItemOutcome,
  saveRunState,
  shouldSkipQueueItem,
};

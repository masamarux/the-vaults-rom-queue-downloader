const fs = require('node:fs/promises');
const crypto = require('node:crypto');

function normalizeQueueId(value) {
  return String(value).trim();
}

function parseQueueText(text) {
  const items = [];
  let parsedIndex = 0;

  for (const [lineIndex, rawLine] of String(text).split(/\r?\n/).entries()) {
    const normalizedId = normalizeQueueId(rawLine);
    if (!normalizedId) {
      continue;
    }

    parsedIndex += 1;

    items.push({
      index: parsedIndex,
      rawId: normalizedId,
      normalizedId,
      sourceLine: lineIndex + 1,
    });
  }

  return items;
}

async function loadQueueFile(filePath) {
  const contents = await fs.readFile(filePath, 'utf8');
  const items = parseQueueText(contents);

  if (items.length === 0) {
    throw new Error('Queue file does not contain any usable page IDs.');
  }

  return items;
}

function createQueueFingerprint(items) {
  const hash = crypto.createHash('sha256');
  hash.update(
    items
      .map((item) => `${item.sourceLine}:${item.normalizedId}`)
      .join('\n'),
    'utf8'
  );
  return hash.digest('hex');
}

module.exports = {
  createQueueFingerprint,
  loadQueueFile,
  normalizeQueueId,
  parseQueueText,
};

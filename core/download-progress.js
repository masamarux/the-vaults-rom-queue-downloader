function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return 'unknown';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function parseDisplayedBytes(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().replace(/\s+/g, ' ');
  const match = normalized.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);

  if (!match) {
    return null;
  }

  const numericValue = Number.parseFloat(match[1]);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const unit = match[2].toUpperCase();
  const multipliers = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return Math.round(numericValue * multipliers[unit]);
}

function shouldEmitProgressUpdate({
  now,
  lastLoggedAt,
  bytesDownloaded,
  previousBytesDownloaded,
  heartbeatMs,
}) {
  const bytesChanged =
    Number.isFinite(bytesDownloaded) &&
    Number.isFinite(previousBytesDownloaded) &&
    bytesDownloaded > previousBytesDownloaded;

  if (bytesChanged) {
    return true;
  }

  return now - lastLoggedAt >= heartbeatMs;
}

function formatProgressMessage({ bytesDownloaded, totalBytes, heartbeatCount }) {
  if (Number.isFinite(bytesDownloaded) && Number.isFinite(totalBytes) && totalBytes > 0) {
    const percentage = Math.min(
      100,
      Math.round((bytesDownloaded / totalBytes) * 100)
    );
    return `${percentage}% (${formatBytes(bytesDownloaded)} / ${formatBytes(
      totalBytes
    )})`;
  }

  if (Number.isFinite(bytesDownloaded)) {
    return `${formatBytes(bytesDownloaded)} downloaded`;
  }

  return `download still active (heartbeat ${heartbeatCount})`;
}

module.exports = {
  formatBytes,
  formatProgressMessage,
  parseDisplayedBytes,
  shouldEmitProgressUpdate,
};

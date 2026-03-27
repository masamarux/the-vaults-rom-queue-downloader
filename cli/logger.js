function createLogger({
  stdout = process.stdout,
  stderr = process.stderr,
  now = () => new Date().toISOString(),
} = {}) {
  function write(stream, level, message) {
    stream.write(`[${now()}] ${level} ${message}\n`);
  }

  return {
    info(message) {
      write(stdout, 'INFO ', message);
    },
    warning(message) {
      write(stderr, 'WARN ', message);
    },
    error(message) {
      write(stderr, 'ERROR', message);
    },
    runStart({ inputFilePath, outputDirectory, totalItems }) {
      write(
        stdout,
        'INFO ',
        `starting queue from ${inputFilePath} with ${totalItems} item(s); output=${outputDirectory}`
      );
    },
    itemStart(queueItem) {
      write(
        stdout,
        'INFO ',
        `item ${queueItem.index} (${queueItem.normalizedId}) started`
      );
    },
    itemSkip(queueItem, reason) {
      write(
        stdout,
        'INFO ',
        `item ${queueItem.index} (${queueItem.normalizedId}) skipped: ${reason}`
      );
    },
    downloadProgress(queueItem, message) {
      write(
        stdout,
        'INFO ',
        `item ${queueItem.index} (${queueItem.normalizedId}) progress: ${message}`
      );
    },
    itemSuccess(queueItem, savedFilePath) {
      write(
        stdout,
        'INFO ',
        `item ${queueItem.index} (${queueItem.normalizedId}) completed -> ${savedFilePath}`
      );
    },
    itemFailure(queueItem, error) {
      write(
        stderr,
        'ERROR',
        `item ${queueItem.index} (${queueItem.normalizedId}) failed: ${error.message}`
      );
    },
    summary({ completed, failed, skipped, total }) {
      write(
        stdout,
        'INFO ',
        `summary: completed=${completed} failed=${failed} skipped=${skipped} total=${total}`
      );
    },
  };
}

module.exports = {
  createLogger,
};

const fs = require('node:fs/promises');
const path = require('node:path');

const {
  formatProgressMessage,
  parseDisplayedBytes,
} = require('../core/download-progress');
const { createBrowserSession } = require('./browser-session');
const {
  dismissCookieConsent,
  findContinueTrigger,
  findDownloadTrigger,
  openGamePage,
  readExpectedDownloadSize,
} = require('./vimm-page');

async function removePartialFile(filePath) {
  if (!filePath) {
    return;
  }

  await fs.rm(filePath, { force: true });
}

async function waitForDownloadCompletion({
  download,
  destinationPath,
  downloadsPath,
  heartbeatMs,
  logger,
  queueItem,
  expectedTotalBytes,
}) {
  let heartbeatCount = 0;
  let lastLoggedPercent = -1;
  let lastObservedBytes = -1;

  const heartbeat = setInterval(() => {
    heartbeatCount += 1;
    void (async () => {
      const tempDownloadFilePath = await findActiveDownloadFile(downloadsPath);
      const observedBytes = tempDownloadFilePath
        ? await getFileSize(tempDownloadFilePath)
        : undefined;

      if (
        Number.isFinite(observedBytes) &&
        Number.isFinite(expectedTotalBytes) &&
        expectedTotalBytes > 0
      ) {
        const currentPercent = Math.max(
          0,
          Math.min(99, Math.floor((observedBytes / expectedTotalBytes) * 100))
        );

        if (
          currentPercent > lastLoggedPercent &&
          (currentPercent - lastLoggedPercent >= 1 ||
            observedBytes !== lastObservedBytes)
        ) {
          lastLoggedPercent = currentPercent;
          lastObservedBytes = observedBytes;
          logger.downloadProgress(
            queueItem,
            formatProgressMessage({
              bytesDownloaded: observedBytes,
              totalBytes: expectedTotalBytes,
            })
          );
          return;
        }
      }

      logger.downloadProgress(
        queueItem,
        formatProgressMessage({
          bytesDownloaded: observedBytes,
          totalBytes: expectedTotalBytes,
          heartbeatCount,
        })
      );
    })().catch(() => {
      logger.downloadProgress(
        queueItem,
        formatProgressMessage({ heartbeatCount })
      );
    });
  }, heartbeatMs);

  try {
    await download.saveAs(destinationPath);
    const failureMessage = await download.failure();

    if (failureMessage) {
      throw new Error(failureMessage);
    }

    return destinationPath;
  } finally {
    clearInterval(heartbeat);
  }
}

async function attemptDownload(page, action, timeoutMs) {
  const timeoutSentinel = Symbol('download-timeout');

  const downloadPromise = page
    .waitForEvent('download', { timeout: timeoutMs })
    .catch((error) => {
      if (error.name === 'TimeoutError') {
        return timeoutSentinel;
      }

      throw error;
    });

  await action();
  const result = await downloadPromise;

  if (result === timeoutSentinel) {
    return null;
  }

  return result;
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return undefined;
  }
}

async function findActiveDownloadFile(downloadsPath) {
  try {
    const entries = await fs.readdir(downloadsPath, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile());

    if (files.length === 0) {
      return null;
    }

    const withStats = await Promise.all(
      files.map(async (entry) => {
        const filePath = path.join(downloadsPath, entry.name);
        const stats = await fs.stat(filePath);
        return { filePath, mtimeMs: stats.mtimeMs };
      })
    );

    withStats.sort((left, right) => right.mtimeMs - left.mtimeMs);
    return withStats[0].filePath;
  } catch (error) {
    return null;
  }
}

async function downloadQueueItem({ queueItem, config, logger }) {
  const session = await createBrowserSession({
    headless: config.headless,
    preserveBrowserData: config.preserveBrowserData,
  });

  let destinationPath;

  try {
    const page = await session.context.newPage();
    const pageUrl = await openGamePage(page, queueItem);
    await dismissCookieConsent(page, logger, queueItem).catch(() => false);
    const expectedSizeText = await readExpectedDownloadSize(page);
    const expectedTotalBytes = parseDisplayedBytes(expectedSizeText);
    const downloadTrigger = await findDownloadTrigger(page);

    let download = await attemptDownload(
      page,
      async () => {
        await downloadTrigger.click({ timeout: 15000 });
      },
      7000
    );

    if (!download) {
      const continueTrigger = await findContinueTrigger(page);

      if (continueTrigger) {
        logger.downloadProgress(
          queueItem,
          'download confirmation required; clicking Continue'
        );

        download = await attemptDownload(
          page,
          async () => {
            await continueTrigger.click({ timeout: 15000 });
          },
          45000
        );
      }
    }

    if (!download) {
      throw new Error(
        'Download did not start after clicking the page download controls.'
      );
    }

    const suggestedFilename = download.suggestedFilename();
    destinationPath = path.join(config.outputDirectory, suggestedFilename);

    logger.downloadProgress(queueItem, `download started: ${suggestedFilename}`);
    if (expectedSizeText) {
      logger.downloadProgress(
        queueItem,
        `expected size: ${expectedSizeText}`
      );
    }

    const savedFilePath = await waitForDownloadCompletion({
      download,
      destinationPath,
      downloadsPath: session.downloadsPath,
      heartbeatMs: config.progressHeartbeatSeconds * 1000,
      logger,
      queueItem,
      expectedTotalBytes,
    });

    return {
      pageUrl,
      savedFilePath,
      status: 'completed',
      suggestedFilename,
    };
  } catch (error) {
    await removePartialFile(destinationPath);
    throw error;
  } finally {
    await session.close().catch(() => undefined);
    await session.cleanup().catch(() => undefined);
  }
}

module.exports = {
  downloadQueueItem,
};

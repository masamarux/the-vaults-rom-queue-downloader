#!/usr/bin/env node

const { parseCliArgs, getUsageText } = require('./args');
const { createLogger } = require('./logger');
const { resolveConfig } = require('../core/config');
const { createQueueFingerprint, loadQueueFile } = require('../core/queue');
const {
  loadRunState,
  recordItemOutcome,
  saveRunState,
  shouldSkipQueueItem,
} = require('../core/run-state');
const { downloadQueueItem } = require('../scraper/download-item');

async function run(argv = process.argv.slice(2), dependencies = {}) {
  const logger = dependencies.logger || createLogger();

  let parsedArgs;

  try {
    parsedArgs = parseCliArgs(argv);
  } catch (error) {
    logger.error(error.message);
    return 1;
  }

  if (parsedArgs.help) {
    logger.info(getUsageText());
    return 0;
  }

  try {
    const config = await resolveConfig(parsedArgs.options);
    const queueItems = await loadQueueFile(config.inputFilePath);
    const queueFingerprint = createQueueFingerprint(queueItems);

    const state = await loadRunState(config.resumeStatePath, {
      inputFilePath: config.inputFilePath,
      queueFingerprint,
      fullRerun: config.fullRerun,
    });

    await saveRunState(config.resumeStatePath, state);

    logger.runStart({
      inputFilePath: config.inputFilePath,
      outputDirectory: config.outputDirectory,
      totalItems: queueItems.length,
    });

    const summary = {
      completed: 0,
      failed: 0,
      skipped: 0,
      total: queueItems.length,
    };

    for (const queueItem of queueItems) {
      if (shouldSkipQueueItem(state, queueItem, { fullRerun: config.fullRerun })) {
        recordItemOutcome(state, queueItem, {
          status: 'skipped',
          skipReason: 'duplicate already completed',
        });
        await saveRunState(config.resumeStatePath, state);
        summary.skipped += 1;
        logger.itemSkip(queueItem, 'duplicate already completed');
        continue;
      }

      logger.itemStart(queueItem);

      try {
        const result = await downloadQueueItem({ queueItem, config, logger });
        recordItemOutcome(state, queueItem, {
          status: 'completed',
          savedFilePath: result.savedFilePath,
        });
        await saveRunState(config.resumeStatePath, state);
        summary.completed += 1;
        logger.itemSuccess(queueItem, result.savedFilePath);
      } catch (error) {
        recordItemOutcome(state, queueItem, {
          status: 'failed',
          errorMessage: error.message,
        });
        await saveRunState(config.resumeStatePath, state);
        summary.failed += 1;
        logger.itemFailure(queueItem, error);

        if (config.failFast) {
          logger.summary(summary);
          return 1;
        }
      }
    }

    logger.summary(summary);
    return 0;
  } catch (error) {
    logger.error(error.message);
    return 1;
  }
}

if (require.main === module) {
  run().then((exitCode) => {
    process.exitCode = exitCode;
  });
}

module.exports = {
  run,
};

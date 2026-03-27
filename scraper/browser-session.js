const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

async function createBrowserSession({
  headless,
  preserveBrowserData,
  browserDataRoot = path.join(os.tmpdir(), 'rom-queue-browser'),
}) {
  const { chromium } = require('playwright');

  await fs.mkdir(browserDataRoot, { recursive: true });
  const browserDataPath = path.join(
    browserDataRoot,
    `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
  const downloadsPath = path.join(browserDataPath, 'downloads');
  await fs.mkdir(browserDataPath, { recursive: true });
  await fs.mkdir(downloadsPath, { recursive: true });

  const context = await chromium.launchPersistentContext(browserDataPath, {
    headless,
    acceptDownloads: true,
    downloadsPath,
  });

  async function close() {
    await context.close();
  }

  async function cleanup() {
    if (!preserveBrowserData) {
      await fs.rm(browserDataPath, { recursive: true, force: true });
    }
  }

  return {
    browserDataPath,
    close,
    context,
    cleanup,
    downloadsPath,
  };
}

module.exports = {
  createBrowserSession,
};

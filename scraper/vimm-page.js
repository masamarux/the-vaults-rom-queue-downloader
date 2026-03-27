function buildGamePageUrl(queueItem) {
  return `https://vimm.net/vault/${encodeURIComponent(queueItem.normalizedId)}`;
}

async function openGamePage(page, queueItem) {
  const pageUrl = buildGamePageUrl(queueItem);
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(
    () => undefined
  );
  return pageUrl;
}

async function findDownloadTrigger(page) {
  const candidates = [
    () => page.locator('#dl_form button[type="submit"]').first(),
    () => page.getByRole('link', { name: /download/i }).first(),
    () => page.getByRole('button', { name: /download/i }).first(),
    () => page.locator('a[href*="download"]').first(),
    () => page.locator('button').filter({ hasText: /download/i }).first(),
    () => page.locator('text=/download/i').first(),
  ];

  for (const createCandidate of candidates) {
    const locator = createCandidate();

    try {
      const count = await locator.count();
      if (count === 0) {
        continue;
      }

      await locator.waitFor({ state: 'visible', timeout: 3000 });
      return locator;
    } catch (error) {
      continue;
    }
  }

  throw new Error('Unable to find a usable download action on the page.');
}

async function readExpectedDownloadSize(page) {
  const candidates = [
    () => page.locator('#dl_size').first(),
    () => page.locator('#dl-row #dl_size').first(),
  ];

  for (const createCandidate of candidates) {
    const locator = createCandidate();

    try {
      const count = await locator.count();
      if (count === 0) {
        continue;
      }

      const text = await locator.textContent();
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

async function dismissCookieConsent(page, logger, queueItem) {
  const candidateSelectors = [
    'button:has-text("Agree")',
    'button:has-text("I agree")',
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Allow all")',
    '[role="button"]:has-text("Agree")',
    '[role="button"]:has-text("Accept")',
  ];

  const frames = page.frames();

  for (const frame of frames) {
    for (const selector of candidateSelectors) {
      const locator = frame.locator(selector).first();

      try {
        const count = await locator.count();
        if (count === 0) {
          continue;
        }

        if (!(await locator.isVisible())) {
          continue;
        }

        await locator.click({ timeout: 3000 });
        logger.downloadProgress(queueItem, 'dismissed cookie/privacy prompt');
        await page.waitForTimeout(500);
        return true;
      } catch (error) {
        continue;
      }
    }
  }

  return false;
}

async function findContinueTrigger(page) {
  const candidates = [
    () => page.locator('#tooltip4 input[type="button"][value="Continue"]').first(),
    () => page.locator('#tooltip4 button').filter({ hasText: /continue/i }).first(),
    () => page.getByRole('button', { name: /continue/i }).first(),
    () => page.locator('input[type="button"][value="Continue"]').first(),
  ];

  for (const createCandidate of candidates) {
    const locator = createCandidate();

    try {
      const count = await locator.count();
      if (count === 0) {
        continue;
      }

      if (!(await locator.isVisible())) {
        continue;
      }

      return locator;
    } catch (error) {
      continue;
    }
  }

  return null;
}

module.exports = {
  buildGamePageUrl,
  dismissCookieConsent,
  findDownloadTrigger,
  findContinueTrigger,
  openGamePage,
  readExpectedDownloadSize,
};

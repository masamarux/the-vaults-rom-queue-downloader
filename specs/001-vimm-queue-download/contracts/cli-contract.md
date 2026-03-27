# CLI Contract: Vimm Queue Download

## Command Shape

```text
node cli/entry.js --input <queue.txt> [--output <dir>] [--state <file>] [--preserve-browser-data] [--fail-fast] [--full-rerun] [--headed]
```

## Inputs

- `--input <queue.txt>`
  - Required.
  - Path to the text file containing one vimm.net page ID per line.
- `--output <dir>`
  - Optional.
  - Overrides the default system Downloads folder.
- `--state <file>`
  - Optional.
  - Overrides the default JSON resume-state file path.
- `--preserve-browser-data`
  - Optional.
  - Keeps per-item browser artifacts for debugging instead of deleting them after each item.
- `--fail-fast`
  - Optional.
  - Stops the run after the first item failure instead of continuing.
- `--full-rerun`
  - Optional.
  - Ignores previously completed entries in the resume state and attempts all items again.
- `--headed`
  - Optional.
  - Runs with a visible browser for debugging; headless remains the default.

## Environment Variables

- `ROM_QUEUE_OUTPUT_DIR`
  - Used only when `--output` is absent.
- `ROM_QUEUE_STATE_FILE`
  - Used only when `--state` is absent.
- `ROM_QUEUE_PRESERVE_BROWSER_DATA`
  - Used only when `--preserve-browser-data` is absent.
- `ROM_QUEUE_FAIL_FAST`
  - Used only when `--fail-fast` is absent.
- `ROM_QUEUE_HEADED`
  - Used only when `--headed` is absent.

## Resolution Rules

1. CLI arguments take precedence over environment variables.
2. Environment variables take precedence over built-in defaults.
3. Defaults:
   - Output directory: system Downloads folder.
   - State file: hidden JSON file under the project working area or output directory.
   - Browser mode: headless.
   - Cleanup: enabled.
   - Failure handling: continue after item failures.

## Exit Behavior

- Exit `0` when the run completes, even if some items failed, as long as the process itself completed normally and a summary was produced.
- Exit non-zero when startup validation fails, the queue cannot be processed at all, or fail-fast stops the run on the first encountered item failure.

## Terminal Output Contract

- Run start line with queue path, resolved output directory, and number of items discovered.
- Per-item start line with queue position and page ID.
- Download progress updates with enough detail to show that large downloads are advancing.
- Explicit completion, skip, warning, and failure lines for each item.
- Final summary with counts for completed, failed, skipped, and total processed items.

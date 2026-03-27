# Quickstart: Vimm Queue Download

## Prerequisites

- Node.js 22 or newer installed locally
- Project dependencies installed with `npm install`
- Playwright browser binaries installed if not pulled automatically by project setup

## Prepare a queue file

Create a plain text file with one vimm.net page ID per line:

```text
12345
67890
24680
```

Blank lines are ignored. Whitespace around IDs is trimmed.

## Run with defaults

```bash
node cli/entry.js --input ./queue.txt
```

Expected behavior:

- Downloads are saved to the system Downloads folder.
- Processing happens one item at a time in file order.
- Duplicate IDs are skipped only after that ID already completed successfully.
- Terminal output reports run start, item progress, outcomes, and a final summary.
- Temporary browser data is cleaned after each item.
- Failed or interrupted downloads do not leave partial files behind.

## Override output directory

Using a CLI argument:

```bash
node cli/entry.js --input ./queue.txt --output ./downloads
```

Using an environment variable:

```bash
ROM_QUEUE_OUTPUT_DIR=./downloads node cli/entry.js --input ./queue.txt
```

If both are provided, the CLI argument wins.

## Resume an interrupted run

```bash
node cli/entry.js --input ./queue.txt
```

The downloader should reuse its state file, skip already completed items, and continue the remaining queue unless `--full-rerun` is supplied.

## Debug a failing item

```bash
node cli/entry.js --input ./queue.txt --preserve-browser-data --headed
```

Use this mode only when needed, since default cleanup is intentionally safer for normal runs.

## Test the planned logic surfaces

```bash
node --test tests/core/*.test.js tests/cli/*.test.js
```

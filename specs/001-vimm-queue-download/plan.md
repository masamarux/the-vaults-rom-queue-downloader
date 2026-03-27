# Implementation Plan: Vimm Queue Download

**Branch**: `[001-vimm-queue-download]` | **Date**: 2026-03-27 | **Spec**: [spec.md](/home/alves/www/pessoal/the-vaults-rom-queue-downloader/specs/001-vimm-queue-download/spec.md)
**Input**: Feature specification from `/specs/001-vimm-queue-download/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a Node.js CLI that reads a text queue of vimm.net page IDs, resolves each page sequentially through Playwright in headless mode, streams human-readable terminal progress, stores downloads in the system Downloads folder by default, and maintains lightweight resume state plus per-item browser cleanup so failures stay isolated.

## Technical Context

**Language/Version**: Node.js 22 LTS, plain JavaScript  
**Primary Dependencies**: Playwright as the sole browser automation dependency; Node built-in modules for CLI parsing, filesystem access, path handling, OS integration, and tests  
**Storage**: Local filesystem for downloads, JSON state file for resume tracking, ephemeral per-item browser profile directories  
**Testing**: Node built-in `node:test` with `node:assert/strict`; lightweight unit coverage for `core/` plus focused CLI/config tests  
**Target Platform**: Desktop/server environments running Node.js 22+ on Linux, macOS, or Windows with an accessible user Downloads directory  
**Project Type**: CLI automation tool  
**Performance Goals**: Support queue runs of at least 20 IDs in file order, emit visible progress or state updates at least every 30 seconds during active downloads, and avoid duplicate work on resumed runs  
**Constraints**: One item at a time, headless browser execution, safe default output path, CLI-over-env precedence, per-item cleanup by default, minimal dependency set, no overengineered test harness  
**Scale/Scope**: Single-user batch workflow for tens to low hundreds of queue items per run, with a small maintainable codebase organized into `core/`, `scraper/`, `cli/`, and `tests/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity gate: Pass. The design uses plain JavaScript, Node built-ins for configuration and tests, and Playwright as the only external dependency instead of adding extra parsers, loggers, or retry frameworks.
- Resumability and observability gate: Pass. The plan includes a durable JSON state file keyed by queue item, human-readable terminal logs for run/item/download lifecycle events, and a restart flow that skips previously completed items unless a full rerun is requested.
- Isolation gate: Pass. Each queue item gets its own temporary browser profile directory and its own outcome record so failures, partial downloads, or cleanup issues remain scoped to the current item.
- Safe-defaults gate: Pass. The default output path is the system Downloads folder, CLI arguments override environment variables, and temporary browser data is deleted after each item unless explicit debug preservation is enabled.
- Testing gate: Pass. Tests stay focused on `core/` logic and configuration behavior in `cli/`, with no mandatory heavy browser test suite for `scraper/`.

## Project Structure

### Documentation (this feature)

```text
specs/001-vimm-queue-download/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
core/
├── config.js
├── queue.js
├── run-state.js
└── download-progress.js

scraper/
├── browser-session.js
├── vimm-page.js
└── download-item.js

cli/
├── entry.js
├── args.js
└── logger.js

tests/
├── core/
│   ├── config.test.js
│   ├── queue.test.js
│   └── run-state.test.js
└── cli/
    └── args.test.js
```

**Structure Decision**: Use the repository’s constitution-mandated single-project CLI structure. `core/` contains pure logic for queue parsing, configuration resolution, resume state, and progress interpretation; `scraper/` contains Playwright-only browser automation; `cli/` handles argument parsing, environment mapping, and terminal output; `tests/` mirrors the `core/` and `cli/` surfaces that benefit most from lightweight automated coverage.

## Complexity Tracking

No constitution violations or special complexity exemptions are required for this design.

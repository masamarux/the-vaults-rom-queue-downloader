# Research: Vimm Queue Download

## Decision 1: Use plain Node.js with built-in utilities

- Decision: Implement the project in plain JavaScript on Node.js 22 LTS and rely on built-in modules for argument parsing, filesystem work, OS path discovery, and tests.
- Rationale: This keeps the dependency set minimal, aligns with the user request, and avoids introducing TypeScript, transpilers, or helper libraries that would add setup and maintenance overhead without improving the core scraping workflow.
- Alternatives considered:
  - TypeScript: Better compile-time checks, but adds compiler and configuration overhead that is unnecessary for a small CLI script.
  - Third-party CLI/config libraries: Faster initial parsing ergonomics, but duplicate capabilities available through Node built-ins and increase dependency surface.

## Decision 2: Use Playwright as the only browser automation dependency

- Decision: Use Playwright for all browser automation, including page navigation, action discovery, download initiation, and headless execution.
- Rationale: Playwright gives a straightforward headless workflow, consistent download event handling, and browser context controls that are well suited to per-item isolation and cleanup.
- Alternatives considered:
  - Puppeteer: Similar automation model, but the user explicitly requested Playwright and its download handling is a strong fit here.
  - HTTP-only scraping: Too brittle for a workflow that must trigger site download actions and observe browser-managed downloads.

## Decision 3: Use one temporary browser profile per queue item

- Decision: Create a fresh temporary browser data directory for each item and remove it after the item completes unless debug preservation is enabled.
- Rationale: This makes failure isolation concrete, prevents stale cookies or cached state from leaking across items, and keeps cleanup logic simple because each item owns a single disposable artifact.
- Alternatives considered:
  - One browser context reused across the run: Slightly faster, but increases risk of cross-item contamination and complicates cleanup after partial failures.
  - One persistent profile for all runs: Easier manual inspection, but violates the constitution’s safe-default cleanup expectations.

## Decision 4: Persist resumable run state in a local JSON file

- Decision: Store run state on disk as a lightweight JSON document that records normalized queue items and per-item outcomes.
- Rationale: JSON is easy to inspect, simple to update in a small project, and sufficient for the personal batch scale described in the spec. It supports resumability without adding a database dependency.
- Alternatives considered:
  - SQLite: Stronger concurrency guarantees, but unnecessary complexity for a single-user sequential CLI.
  - No persisted state: Simpler implementation, but fails the resumability requirements in the spec and constitution.

## Decision 5: Use a simple CLI-over-env precedence model

- Decision: Resolve runtime configuration in this order: explicit CLI arguments, then environment variables, then defaults.
- Rationale: This is predictable, easy to document, and matches the spec’s requirement that CLI overrides environment settings.
- Alternatives considered:
  - Environment-over-CLI precedence: Less intuitive for command-driven tools and conflicts with the feature spec.
  - Config file support in v1: Useful eventually, but outside the current scope and unnecessary for a minimal-dependency tool.

## Decision 6: Focus automated tests on pure logic and config behavior

- Decision: Add automated tests for queue parsing, configuration resolution, and run-state behavior, while validating Playwright flows manually unless a specific bug justifies scraper tests later.
- Rationale: This follows the project constitution by keeping test effort concentrated where it delivers the best maintenance value and avoids fragile browser-heavy suites for an early automation tool.
- Alternatives considered:
  - Full end-to-end browser tests: Higher confidence for scraping, but expensive to maintain and likely brittle against site changes.
  - No tests: Faster initially, but too risky for resume logic, precedence rules, and queue normalization.

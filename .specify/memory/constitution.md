<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] -> I. Reliability-First Simplicity
	- [PRINCIPLE_2_NAME] -> II. Resumable and Observable Automation
	- [PRINCIPLE_3_NAME] -> III. Isolated Item Processing
	- [PRINCIPLE_4_NAME] -> IV. Safe Defaults and Explicit Configuration
	- [PRINCIPLE_5_NAME] -> V. Practical Test Coverage
- Added sections:
	- Runtime and Structure Constraints
	- Delivery Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated .specify/templates/plan-template.md
	- ✅ updated .specify/templates/spec-template.md
	- ✅ updated .specify/templates/tasks-template.md
	- ⚠ pending .specify/templates/commands/*.md (directory not present)
	- ⚠ pending README.md or docs/quickstart.md (files not present)
- Deferred TODOs:
	- None
-->

# The Vaults ROM Queue Downloader Constitution

## Core Principles

### I. Reliability-First Simplicity
All features MUST prefer simple, understandable flows over clever or dense
implementations. Any added complexity MUST be justified by a clear reliability
benefit and documented in the feature plan.

Rationale: This project is a small automation script, so maintainability and
predictable behavior are more valuable than abstraction-heavy designs.

### II. Resumable and Observable Automation
Automation runs MUST be resumable and MUST emit clear terminal logs for progress,
decisions, warnings, and failures. Runtime behavior MUST be configurable through
CLI arguments and environment variables, with documented precedence rules.

Rationale: Long or flaky scraping workflows need transparent state and easy
recovery without rerunning all work.

### III. Isolated Item Processing
Each queued item MUST be processed in isolation. A failure in one item MUST NOT
corrupt shared state, block unrelated items, or invalidate successful outputs.
Error handling MUST continue safely to remaining work unless the user explicitly
requests fail-fast mode.

Rationale: Isolation preserves integrity of the overall run and avoids cascading
failures in batch processing.

### IV. Safe Defaults and Explicit Configuration
Default behavior MUST be safe and predictable, including sensible default output
paths and conservative runtime settings. Any override that changes data location,
cleanup behavior, or execution mode MUST be explicit via CLI flag or environment
variable.

Temporary browser data and session artifacts MUST be cleaned between runs unless
the user explicitly enables preservation for debugging.

Rationale: Safe defaults reduce accidental data loss, stale sessions, and hidden
state between runs.

### V. Practical Test Coverage
The project MUST keep tests simple and focused on behavior, not framework-heavy
architecture. Pure logic in `core/` MUST be unit tested. Browser-driver code in
`scraper/` MAY rely on manual validation unless a specific risk requires tests.
`cli/` code SHOULD have light integration checks.

The repository SHOULD maintain approximately 70% coverage for `core/` and `cli/`
combined. 100% coverage is NOT required.

Rationale: Targeted testing yields confidence without overengineering for a small
script.

## Runtime and Structure Constraints

- Source layout MUST use:
	- `core/` for pure, testable logic.
	- `scraper/` for Puppeteer/Playwright automation and browser-specific behavior.
	- `cli/` for argument parsing, environment mapping, and user interaction.
- Cross-folder dependencies SHOULD flow inward (`cli/` and `scraper/` depend on
	`core/`; `core/` depends on neither).
- Logs MUST be human-readable in terminal output and include per-item identifiers
	where available.
- Resume state, if persisted, MUST be durable and forward-compatible for the
	same major version.

## Delivery Workflow and Quality Gates

- Every feature spec and plan MUST state how it satisfies all five core
	principles.
- Implementation tasks MUST include observability, configuration, and cleanup
	checks when automation logic changes.
- Merge readiness requires:
	- Passing tests for changed `core/` logic.
	- No unresolved failure-mode gaps for item isolation.
	- Confirmed default-path and cleanup behavior.
- Coverage guidance:
	- Keep aggregate coverage for `core/` and `cli/` near 70%.
	- Do not block delivery solely to chase 100%.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes informal habits for planning and implementation.

Amendment process:
1. Propose changes in a dedicated constitution update.
2. Document impact on templates and active specs/tasks.
3. Obtain maintainer approval before merge.

Versioning policy for this constitution uses semantic versioning:
1. MAJOR: Principle removal/redefinition or governance changes that alter
	compatibility expectations.
2. MINOR: New principle/section or materially expanded guidance.
3. PATCH: Wording clarifications, typo fixes, and non-semantic improvements.

Compliance review expectations:
1. Every implementation plan MUST include a constitution gate check before coding.
2. Every task list MUST map principle-driven work (tests, logs, isolation,
	cleanup, config).
3. Reviewers MUST reject changes that violate non-negotiable principles unless
	the constitution is amended first.

**Version**: 1.0.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26

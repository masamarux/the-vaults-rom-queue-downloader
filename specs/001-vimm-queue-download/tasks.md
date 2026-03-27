# Tasks: Vimm Queue Download

**Input**: Design documents from `/specs/001-vimm-queue-download/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests according to constitution guidance. Prioritize `core/`
and lightweight `cli/` checks, targeting about 70% combined coverage. Do not
add heavy test scaffolding unless justified.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Automation script project**: `core/`, `scraper/`, `cli/`, `tests/` at
  repository root
- Paths shown below follow the automation script structure approved in
  [plan.md](/home/alves/www/pessoal/the-vaults-rom-queue-downloader/specs/001-vimm-queue-download/plan.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create the planned source and test directories in `core/`, `scraper/`, `cli/`, `tests/core/`, and `tests/cli/`
- [X] T002 Update the package metadata, Playwright dependency, and `node --test` script in `package.json`
- [X] T003 [P] Create CLI argument parsing and option shape scaffolding in `cli/args.js`
- [X] T004 [P] Create terminal logging helpers and message formatting scaffolding in `cli/logger.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement runtime configuration resolution, Downloads-folder defaults, and CLI-over-env precedence in `core/config.js`
- [X] T006 [P] Implement queue-file parsing, whitespace normalization, and stable item identity generation in `core/queue.js`
- [X] T007 [P] Implement persisted resume-state loading, updates, and completed-item skip logic in `core/run-state.js`
- [X] T008 [P] Implement reusable download progress formatting and heartbeat logic in `core/download-progress.js`
- [X] T009 Implement Playwright browser session lifecycle helpers with per-item temporary profile management in `scraper/browser-session.js`
- [X] T010 Wire startup validation and resolved configuration handoff in `cli/entry.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Run a queued download batch (Priority: P1) 🎯 MVP

**Goal**: Let a user process a queue text file sequentially, trigger one headless download per ID, continue after item failures, and resume safely on later runs.

**Independent Test**: Run `node cli/entry.js --input ./queue.txt` with a mixed queue of valid, duplicate, and failing IDs and confirm the script preserves file order, skips duplicates only after a prior success for that ID, saves successful files, records failures without stopping, and skips completed items on a rerun.

### Tests for User Story 1

- [X] T011 [P] [US1] Add queue parsing coverage for blank lines, whitespace trimming, stable item identity, and duplicate-order preservation in `tests/core/queue.test.js`
- [X] T012 [P] [US1] Add resume-state coverage for completed-item skipping, duplicate-after-success handling, failure recording, and full-rerun behavior in `tests/core/run-state.test.js`
- [X] T013 [P] [US1] Add CLI config validation coverage for required `--input`, `--state`, and startup failures in `tests/cli/args.test.js`

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement vimm.net page resolution and download-action discovery in `scraper/vimm-page.js`
- [X] T015 [P] [US1] Implement single-item headless download execution and outcome capture in `scraper/download-item.js`
- [X] T016 [US1] Implement sequential queue orchestration, duplicate-after-success skip checks, and per-item continuation behavior in `cli/entry.js`
- [X] T017 [US1] Integrate queue item lifecycle updates, persisted outcomes, and skip-reason tracking in `cli/entry.js` and `core/run-state.js`
- [X] T018 [US1] Add item-level failure classification, partial-file deletion on failed or interrupted downloads, and user-facing error reporting in `scraper/download-item.js`
- [ ] T019 [US1] Validate the MVP flow against the examples in `specs/001-vimm-queue-download/quickstart.md`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Monitor long-running downloads in the terminal (Priority: P2)

**Goal**: Give the user clear, ongoing terminal visibility into run state, active item progress, warnings, failures, and final results during large downloads.

**Independent Test**: Start a queue that includes a large downloadable item and confirm the terminal shows run start, per-item start, periodic progress or heartbeat updates, explicit outcome lines, and a final summary.

### Tests for User Story 2

- [X] T020 [P] [US2] Add progress formatting and heartbeat coverage in `tests/core/download-progress.test.js`
- [X] T021 [P] [US2] Add CLI logging output coverage for run start, item status, and final summary in `tests/cli/logger.test.js`

### Implementation for User Story 2

- [X] T022 [P] [US2] Implement structured terminal log emitters for run, item, warning, error, and summary events in `cli/logger.js`
- [X] T023 [P] [US2] Extend download progress calculation and display thresholds in `core/download-progress.js`
- [X] T024 [US2] Emit live download progress and heartbeat updates from Playwright download handling in `scraper/download-item.js`
- [X] T025 [US2] Integrate progress, warning, and summary logging throughout the run loop in `cli/entry.js`

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Control output location and cleanup behavior (Priority: P3)

**Goal**: Use the system Downloads folder by default, allow CLI or env overrides for output and state paths, and clean temporary browser data between items unless debugging is explicitly enabled.

**Independent Test**: Run once with defaults and once with `--output` or `ROM_QUEUE_OUTPUT_DIR`, confirm files land in the expected destination, verify browser profile cleanup happens after each item unless preservation is requested, and confirm failed downloads do not leave partial files behind.

### Tests for User Story 3

- [X] T026 [P] [US3] Add configuration precedence and default-path coverage in `tests/core/config.test.js`
- [X] T027 [P] [US3] Add CLI flag parsing coverage for `--output`, `--preserve-browser-data`, `--fail-fast`, `--full-rerun`, and `--headed` in `tests/cli/args.test.js`

### Implementation for User Story 3

- [X] T028 [P] [US3] Finalize path resolution, writable-directory checks, and state-file defaults in `core/config.js`
- [X] T029 [P] [US3] Implement explicit cleanup and debug-preservation behavior for per-item browser data in `scraper/browser-session.js`
- [X] T030 [US3] Wire output-path overrides, fail-fast mode, headed mode, and cleanup toggles in `cli/args.js` and `cli/entry.js`
- [X] T031 [US3] Add saved-file destination reporting, duplicate-skip messaging, and cleanup outcome logging in `cli/logger.js`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T032 [P] Add focused integration coverage to keep `core/` and `cli/` near the target coverage level in `tests/core/` and `tests/cli/`
- [X] T033 Update usage details, environment variables, and debugging guidance in `specs/001-vimm-queue-download/quickstart.md`
- [X] T034 Run the full planned test command and fix any remaining issues via `package.json` scripts and affected files
- [ ] T035 Perform a manual end-to-end verification of the queue, resume, progress, and cleanup flows using `specs/001-vimm-queue-download/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and benefits from US1 download execution hooks being available
- **User Story 3 (Phase 5)**: Depends on Foundational completion and integrates with US1 orchestration paths
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other user stories
- **User Story 2 (P2)**: Can start after Foundational, but integrates most cleanly once US1 has established the download flow
- **User Story 3 (P3)**: Can start after Foundational, but shares orchestration paths with US1 for runtime option handling

### Within Each User Story

- Tests for that story should be written before or alongside implementation and must fail before the corresponding implementation is considered complete
- Pure `core/` logic before higher-level CLI integration
- Scraper actions before full run-loop integration
- Story-specific validation before marking the story complete

### Parallel Opportunities

- **Setup**: T003 and T004 can run in parallel after T001-T002
- **Foundational**: T006, T007, and T008 can run in parallel after the project skeleton exists
- **US1**: T011, T012, and T013 can run in parallel; T014 and T015 can also proceed in parallel before orchestration wiring
- **US2**: T020 and T021 can run in parallel; T022 and T023 can run in parallel before integrating progress events
- **US3**: T026 and T027 can run in parallel; T028 and T029 can run in parallel before final CLI wiring
- **Polish**: T032 and T033 can run in parallel before the final validation tasks

---

## Parallel Example: User Story 1

```bash
# Launch the story-specific automated checks together:
Task: "Add queue parsing coverage in tests/core/queue.test.js"
Task: "Add resume-state coverage in tests/core/run-state.test.js"
Task: "Add CLI config validation coverage in tests/cli/args.test.js"

# Build the independent download pieces together:
Task: "Implement vimm.net page resolution in scraper/vimm-page.js"
Task: "Implement single-item headless download execution in scraper/download-item.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the sequential queue, duplicate-skip behavior, failure isolation, and resume behavior
5. Demo or ship the MVP before adding richer progress and configuration polish

### Incremental Delivery

1. Finish Setup + Foundational to establish the core architecture
2. Deliver User Story 1 for the first usable batch downloader
3. Add User Story 2 for better visibility during large downloads
4. Add User Story 3 for path overrides and cleanup controls
5. Finish with polish, coverage, and manual verification

### Parallel Team Strategy

1. One contributor completes Setup and shared Foundational tasks
2. After Phase 2:
   - Contributor A: User Story 1 orchestration and scraper flow
   - Contributor B: User Story 2 logging and progress presentation
   - Contributor C: User Story 3 config precedence and cleanup controls
3. Rejoin for final polish, test runs, and quickstart validation

---

## Notes

- Every task follows the required checklist format with Task ID, optional parallel marker, story label where applicable, and explicit file path
- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 only
- Total tasks: 35
- User story task counts:
  - US1: 9 tasks
  - US2: 6 tasks
  - US3: 6 tasks
- Parallel opportunities identified in every phase after initial project setup

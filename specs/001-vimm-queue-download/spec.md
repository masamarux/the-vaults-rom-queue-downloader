# Feature Specification: Vimm Queue Download

**Feature Branch**: `[001-vimm-queue-download]`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Build a script that reads a .txt file containing game page IDs from vimm.net and downloads each game sequentially. For each ID, the script should open the corresponding page, find the download action, start the download in headless mode, and print progress logs in the terminal since there're big files. Downloads should go to the system Downloads folder by default, but the output directory must also be configurable through a CLI argument or environment variable. After each download finishes, the script should clean temporary browser data and continue with the next ID until the list is exhausted."

## Clarifications

### Session 2026-03-27

- Q: How should duplicate IDs in the queue be handled? → A: Skip duplicates only if that ID already completed successfully earlier in the same run or a resumed run, while preserving the user's original queue order.
- Q: How should incomplete files from failed or interrupted downloads be handled? → A: Delete partial files and mark the item as failed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a queued download batch (Priority: P1)

A user provides a text file of vimm.net game page IDs and starts a terminal command that processes the list one ID at a time, launching the corresponding page, triggering the download, and continuing until the queue is exhausted.

**Why this priority**: This is the core value of the feature. Without reliable sequential processing of a queue file, the workflow does not exist.

**Independent Test**: Can be fully tested by providing a text file with multiple valid IDs and confirming that each item is attempted in order, each successful download is saved, and the run completes without manual browser interaction.

**Acceptance Scenarios**:

1. **Given** a text file containing valid game page IDs, **When** the user runs the downloader, **Then** the system processes the IDs sequentially in file order and starts one download per ID.
2. **Given** a queue where one ID fails to open or download, **When** the run reaches that ID, **Then** the system logs the failure for that item and continues to the next ID without corrupting successful downloads.
3. **Given** a run is interrupted after some downloads complete, **When** the user restarts the run with the same queue, **Then** the system can resume without reprocessing completed items unless the user explicitly requests a full rerun.

---

### User Story 2 - Monitor long-running downloads in the terminal (Priority: P2)

A user can watch progress logs in the terminal while large files download so they can tell which item is active, whether the download is advancing, and when each item succeeds or fails.

**Why this priority**: Large files make observability essential. Users need confidence that the script is still working and enough context to troubleshoot failures.

**Independent Test**: Can be fully tested by starting a queue with large downloads and confirming the terminal output includes run start, active item ID, download progress updates, completion, warnings, and final outcomes.

**Acceptance Scenarios**:

1. **Given** an active download, **When** bytes transferred or completion state changes, **Then** the terminal output reflects meaningful progress for the current item.
2. **Given** the run contains multiple IDs, **When** one item finishes, **Then** the terminal clearly reports the outcome before moving to the next ID.

---

### User Story 3 - Control output location and cleanup behavior (Priority: P3)

A user can rely on the system Downloads folder by default, or override the destination through a CLI argument or environment variable, while the downloader clears temporary browser data after each item to avoid stale session state between downloads.

**Why this priority**: Safe defaults and explicit configuration are necessary for predictable file handling, and cleanup is required to keep each item isolated.

**Independent Test**: Can be fully tested by running once without an output override, once with a CLI-specified output directory, and verifying that temporary browser artifacts are removed between item attempts.

**Acceptance Scenarios**:

1. **Given** the user does not provide an output override, **When** the downloader saves a successful file, **Then** it writes to the system Downloads folder.
2. **Given** the user provides an output directory by CLI argument or environment variable, **When** a file is downloaded, **Then** the system saves the file to the configured location using a documented precedence order.
3. **Given** one item has finished processing, **When** the system prepares the next item, **Then** temporary browser data from the previous item has been cleaned unless the user explicitly enabled preservation for debugging.

---

### Edge Cases

- How does the system handle blank lines or surrounding whitespace in the queue file?
- How does the system preserve queue order while skipping duplicate IDs that already completed successfully earlier in the same run or a resumed run?
- What happens when an ID points to a missing page, a page without a usable download action, or a page blocked by an interstitial state?
- How does the system respond when the output directory does not exist, cannot be created, or is not writable?
- What happens when a download stalls or is interrupted before completion?
- How does the system behave if the browser cannot start in headless mode or temporary browser data cannot be fully removed between items?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept a plain text input file containing one vimm.net game page ID per line.
- **FR-002**: The system MUST normalize queue input by ignoring blank lines and trimming surrounding whitespace from each ID before processing.
- **FR-002a**: The system MUST preserve the original queue order while skipping any duplicate ID whose successful completion has already been recorded earlier in the same run or in the active resume state.
- **FR-003**: The system MUST process IDs sequentially in file order and MUST NOT actively download more than one item at a time in a single run.
- **FR-004**: For each ID, the system MUST open the corresponding vimm.net game page, locate the page's download action, and attempt to start the download in headless mode.
- **FR-005**: The system MUST save successful downloads to the system Downloads folder by default.
- **FR-006**: The system MUST allow the output directory to be overridden through both a CLI argument and an environment variable, and the CLI argument MUST take precedence when both are provided.
- **FR-007**: The system MUST emit human-readable terminal logs for run start, queue size, current item ID, download progress, completion, warnings, failures, and final summary.
- **FR-008**: The system MUST record the outcome of each processed ID so the user can identify successes, failures, and skipped items after the run.
- **FR-009**: The system MUST continue processing remaining IDs after an item-level failure unless the user explicitly requests fail-fast behavior.
- **FR-010**: The system MUST support resuming an interrupted run without reprocessing items already completed successfully, unless the user explicitly requests a full rerun.
- **FR-011**: The system MUST isolate per-item browser/session state so one item's temporary data does not affect the next item's processing.
- **FR-012**: After each item finishes, the system MUST clean temporary browser data before continuing to the next item by default.
- **FR-013**: The system MUST provide an explicit opt-in control to preserve temporary browser data for debugging instead of cleaning it.
- **FR-014**: The system MUST detect and report when an ID is invalid, the page cannot be loaded, the download action cannot be found, or the download does not complete successfully.
- **FR-014a**: The system MUST delete any partial file left by a failed or interrupted download before marking that item as failed.
- **FR-015**: The system MUST surface configuration errors before starting the queue, including missing input files and unusable output directories.

### Reliability and Automation Requirements *(mandatory for automation features)*

- **AR-001**: Automation MUST be resumable after interruption without reprocessing completed items unless explicitly requested.
- **AR-002**: System MUST provide clear terminal logs for start, progress, per-item outcomes, warnings, and failures.
- **AR-003**: Each item MUST be processed in isolation so one failure does not corrupt or block the overall run.
- **AR-004**: Runtime behavior MUST be configurable via CLI arguments and environment variables, including output path and cleanup controls.
- **AR-005**: Temporary browser/session artifacts MUST be cleaned between runs by default, with explicit opt-in preservation for debugging.

### Key Entities *(include if feature involves data)*

- **Queue File**: A plain text source listing game page IDs in the order the user wants them processed.
- **Queue Item**: A normalized representation of one requested game page ID plus its position in the batch.
- **Download Job**: The lifecycle record for one queue item, including its start time, active state, progress updates, outcome, and saved file location when successful.
- **Run State**: Persisted information that identifies completed, failed, skipped, or pending queue items so interrupted runs can resume safely.
- **Runtime Configuration**: User-provided and default settings that determine input path, output path, cleanup behavior, and failure handling precedence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can start a batch run with a valid queue file and have 100% of reachable, downloadable IDs attempted in the original file order without manual browser interaction.
- **SC-002**: For a queue containing at least 20 IDs, a failure on one ID does not prevent later IDs from being attempted in the same run unless fail-fast mode was explicitly enabled.
- **SC-003**: During an active large-file download, terminal output provides visible status updates often enough that a user never goes more than 30 seconds without new progress or state information for the active item.
- **SC-004**: When both CLI and environment output settings are exercised in validation runs, saved files consistently land in the CLI-specified directory when present and in the system Downloads folder when no override is supplied.
- **SC-005**: After an interrupted run is restarted with the same queue, previously completed items are not downloaded again unless the user explicitly chooses a full rerun.
- **SC-006**: After each processed item, temporary browser data is absent before the next item begins unless debug preservation was explicitly enabled.
- **SC-007**: In validation runs with interrupted or failing downloads, no partial file remains in the destination directory after the item is recorded as failed.

## Assumptions

- Users have permission to download files from the referenced vimm.net pages and are responsible for the legality and appropriateness of the content they request.
- The queue file contains page IDs, not full URLs, and each ID maps to at most one downloadable game page.
- The host operating system exposes a recognizable user Downloads folder that can be used as the default destination.
- The site permits headless access to the same download action that a user could trigger manually in a browser.
- A lightweight persisted run state is acceptable to support resume behavior for repeated executions of the same queue.
- Detailed browser-specific anti-bot countermeasures are out of scope unless they are required just to support the normal download flow.

## Implementation Constraints *(mandatory)*

- Source code layout follows `core/` (pure logic), `scraper/` (browser automation), and `cli/` (user interaction).
- Testing focus is practical: strong coverage for `core/`, light checks for `cli/`, and no mandatory test suite for `scraper/` unless risk justifies it.

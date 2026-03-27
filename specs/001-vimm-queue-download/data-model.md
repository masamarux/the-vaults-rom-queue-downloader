# Data Model: Vimm Queue Download

## Queue Item

- Purpose: Represents one normalized entry from the user-provided text file.
- Fields:
  - `index`: 1-based position in the original queue after blank lines are removed.
  - `rawId`: Original trimmed ID string from the file.
  - `normalizedId`: Canonical ID used for state tracking and page resolution.
  - `sourceLine`: Original line number in the input file.
- Validation rules:
  - Must be non-empty after trimming whitespace.
  - Must remain stable enough to use as part of resume-state identity.
- Relationships:
  - One Queue Item maps to one Download Job.

## Runtime Configuration

- Purpose: Captures the resolved execution settings for a single run.
- Fields:
  - `inputFilePath`
  - `outputDirectory`
  - `resumeStatePath`
  - `preserveBrowserData`
  - `failFast`
  - `headless`
  - `progressHeartbeatSeconds`
- Validation rules:
  - `inputFilePath` must exist and be readable before the run starts.
  - `outputDirectory` must exist or be creatable and writable.
  - CLI values override environment values.
  - `progressHeartbeatSeconds` must be a positive integer if configurable.
- Relationships:
  - One Runtime Configuration governs one batch run.

## Download Job

- Purpose: Tracks the lifecycle of processing one queue item.
- Fields:
  - `queueItemId`
  - `status`: `pending | running | completed | failed | skipped`
  - `pageUrl`
  - `startedAt`
  - `finishedAt`
  - `savedFilePath`
  - `bytesDownloaded`
  - `totalBytes` when discoverable
  - `errorMessage`
  - `browserDataPath`
- Validation rules:
  - `status` transitions must follow allowed lifecycle order.
  - `savedFilePath` is required only when `status = completed`.
  - `errorMessage` is required when `status = failed`.
- State transitions:
  - `pending -> running`
  - `running -> completed`
  - `running -> failed`
  - `pending -> skipped` for already-completed items during resume

## Run State

- Purpose: Durable record used to resume interrupted or repeated runs safely.
- Fields:
  - `version`
  - `queueFingerprint`
  - `inputFilePath`
  - `updatedAt`
  - `items`: map keyed by normalized queue item identity
- Validation rules:
  - `version` must support forward-compatible migration decisions later.
  - `queueFingerprint` must change when queue contents change materially.
  - Completed items remain eligible for skip-on-resume unless full rerun is requested.
- Relationships:
  - One Run State contains many Download Job outcome snapshots.

## Progress Event

- Purpose: Standard terminal-facing event emitted during execution.
- Fields:
  - `type`: `run | item | download | warning | error | summary`
  - `queueItemId`
  - `message`
  - `timestamp`
  - `bytesDownloaded`
  - `totalBytes`
  - `status`
- Validation rules:
  - Every event must include a human-readable message.
  - Item-scoped events should include the queue item identifier when available.
- Relationships:
  - Many Progress Events may be emitted for one Download Job.

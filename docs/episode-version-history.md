# Episode Version History

Version history should help creators compare meaningful episode changes without exposing low-level file revisions.

## User Goal

A creator should be able to return to an earlier edit state, compare major creative decisions, and understand what changed before exporting or sending a review copy.

## Version Events

Capture creator-meaningful events:

- preset applied
- brand kit changed
- canvas layout saved
- template applied
- caption review completed
- b-roll moments approved
- review copy created
- export readiness warnings resolved
- metadata updated

Avoid showing every automatic render, autosave, or background processing step as a main version.

## Comparison

Creators should be able to compare:

- layout changes
- caption style changes
- approved versus rejected b-roll
- metadata changes
- template changes
- export warning changes

The comparison should use visual preview where possible.

## Flow Connections

Version history should stay connected to the creative workflows that produce episode-level decisions:

- template apply and divergence states from `docs/show-template-adaptation.md`
- review-copy milestones and resolved feedback from `docs/client-review-copy-flow.md`
- export warning changes before final handoff from `docs/export-package-handoff.md`

The product should show creator-meaningful checkpoints from these flows, not raw autosave noise or background processing logs.

## Restore Behavior

Restoring a version should explain what will change:

- current episode only
- linked template
- brand kit
- metadata
- review comments

The product should protect final exports and client-approved states from accidental overwrites.

## Maintainer Acceptance Notes

Accept work that makes meaningful episode decisions recoverable and understandable. Close work that shows raw autosave logs, treats exports as editable versions, or makes template changes ambiguous.

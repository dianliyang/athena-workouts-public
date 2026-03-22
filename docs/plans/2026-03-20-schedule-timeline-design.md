# Schedule Timeline Design

Build a new schedule display component that presents multiple session choices as a connected timeline within each workout title group.

## Goal

Replace the current schedule mini-card stack with a timeline layout where the left rail shows only time and day, and the right side shows repeated session details such as status, duration, instructor, price, and location.

## Current State

- Schedule entries render as small cards containing a combined day/time label and an optional location line.
- Status, duration, instructor, and price are rendered outside the schedule card stack.
- Multiple choices under the same title are grouped together structurally, but they are not visually connected as a timeline.

## Proposed Layout

- Each workout row keeps the current outer card and title grouping.
- The schedule area becomes a vertical timeline:
  - left column: time and day only
  - center rail: connected line with a marker per schedule entry
  - right column: session details for that entry
- Multiple schedule entries under one title share the same vertical rail so the choices read as one connected set.
- Empty schedule states still render a placeholder block without timeline connectors.

## Detail Content

- Repeat the following details inside each timeline entry:
  - booking status badge
  - opening time note when present
  - duration
  - instructor
  - price
  - resolved location
- Continue using existing localization helpers for status and schedule text.
- Continue using the grouped schedule logic so repeated day ranges with the same time and resolved location can still collapse into one timeline entry.

## Mobile Behavior

- Preserve the timeline feel on small screens.
- Keep the left time/day block compact.
- Allow the right detail panel to wrap below as needed without losing the rail connection.

## Verification

- Add renderer tests that assert:
  - timeline container and entry classes exist
  - multiple schedule entries render connected timeline entries
  - left time/day and right details appear in each entry
  - status and price move into the timeline entry area

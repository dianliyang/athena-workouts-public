# Schedule View Switcher Design

Add a schedule layout switcher that preserves the previous mini-card schedule view and the new connected timeline view.

## Goal

Allow users to switch between `timeline` and `cards` schedule layouts, with `timeline` as the default view.

## Current State

- The schedule renderer currently outputs only the new timeline layout.
- The earlier mini-card layout is no longer available in the rendered markup.
- There is an existing custom VitePress theme layer where small client-side enhancements can be added.

## Proposed Approach

- Render both schedule layouts from the same schedule grouping data.
- Add a small client-side view switcher above each schedule block.
- Default the visible mode to `timeline`.
- Persist the chosen mode in `localStorage` so the preference survives navigation and reloads.

## Layout Behavior

- `timeline` mode:
  - left column shows time and day
  - entries are visually connected by one shared vertical rail
  - right side contains repeated details, but panels should feel lighter and less isolated than separate cards
- `cards` mode:
  - restore the prior mini-card design for schedule entries
  - keep the same grouped schedule data and localized text

## Implementation Notes

- The renderer should emit both `timeline` and `cards` schedule containers plus a toggle control.
- A theme-level client script should:
  - read the saved view from `localStorage`
  - set a root class or data attribute
  - update the active button state
  - respond to toggle clicks
- CSS should:
  - show one layout at a time based on the active mode
  - keep `timeline` as the no-JavaScript default
  - visually connect timeline entries with the shared rail

## Verification

- Add renderer tests that assert:
  - the switcher markup exists
  - both `timeline` and `cards` containers are emitted
  - timeline is the default structural mode
- Run a production build to verify the generated pages and theme bundle still compile.

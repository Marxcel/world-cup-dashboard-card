# Changelog

## 0.1.11

- Added a qualification watch panel that summarizes stored results and real published knockout matchups without using fake advancement.
- Added a favorite/current team detail panel with score, status, recent stored result, and latest parsed events.
- Added icons to parsed goal, card, penalty, foul, handball, and timeline events.
- Added optional event alert helper controls for goals, key events, penalties, red cards, yellow cards, and favorite-team-only mode.
- Added optional per-team phone routing helper controls for notification automations.
- Improved the bracket layout on phones by stacking rounds instead of requiring a wide horizontal board.
- Updated helper and dashboard examples for the new alert and routing controls.

## 0.1.10

- Added native Live Now, Starting Soon, and Completed Today sections to overview mode.
- Added parsed match-event display for goals, cards, penalties, fouls, handballs, and own goals when TeamTracker exposes event text.
- Added persistent completed-results support for bracket mode through `completed_results_helper`.
- Added a Store Final Result blueprint and helper example for durable group-stage results.
- Kept knockout bracket slots reserved for real knockout-round TeamTracker data.

## 0.1.0

- Initial public-ready HACS dashboard card.
- Supports TeamTracker sensors, favorite team helper, alert helper status, speaker and phone test actions, opening-match list, and auto knockout placeholders.
- Added overview and bracket-only card modes.
- Added a full two-view dashboard example with a bracket tab.
- Tightened the default bracket view into a compact left-to-right tournament board with no extra opening-match cards.
- Added public screenshots and setup documentation for matching the Catppuccin-themed dashboard.
- Cleaned up README wording for public documentation.
- Added focused README screenshots for favorite teams, alert settings, schedule/status, and bracket board.
- Fixed bracket horizontal scroll resetting during Home Assistant state updates.
- Reduced unnecessary re-renders so unrelated Home Assistant state updates do not interrupt bracket scrolling.
- Limited bracket-mode re-renders to actual knockout data changes and added mobile scroll containment.
- Restored easier vertical page scrolling in bracket mode while keeping horizontal bracket scroll containment.

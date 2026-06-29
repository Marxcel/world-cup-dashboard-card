# Changelog

## 0.1.16

- Added stadium and city/state location display across match cards, live matches, compact match rows, focus mode, and bracket drill-down details.
- Added compact stadium/location text directly inside populated bracket slots.
- Included venue/location fields in bracket refresh tracking so stadium updates refresh automatically.

## 0.1.15

- Fixed knockout bracket detection for TeamTracker sensors that publish the real round in `season` values such as `round-of-32`.
- Normalized hyphenated and underscored round labels so published knockout matchups fill the bracket instead of staying as `TBD`.

## 0.1.14

- Added team, result, and bracket-slot drill-down detail panels.
- Added notification manager with quiet mode, focus mode, active alert summary, and team phone routing.
- Added result/event history log, data health panel, admin tools, and favorite-team focus mode.
- Added bracket jump links, sticky round headers, and compact/expanded bracket toggle.
- Added lightweight group pulse for tracked points impact without replacing real standings.
- Updated helper examples for quiet mode, focus mode, and optional event history storage.

## 0.1.13

- Fixed desktop bracket page scroll jumps by marking bracket renders complete and preserving page scroll during bracket refreshes.

## 0.1.12

- Added fresh release screenshots for the native overview card and bracket results/qualification-watch page.

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

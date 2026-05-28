# World Cup Dashboard Card for Home Assistant

A HACS-installable Lovelace card for FIFA World Cup 2026 dashboards. It reads TeamTracker sensors and builds a clean match center with favorite-team focus, today's matches, upcoming matches, tracked teams, alert settings, quick test buttons, and an auto-updating knockout section.

## What It Does

- Uses your existing TeamTracker sensors.
- Works with a few teams or all 48 confirmed World Cup 2026 teams.
- Keeps user-specific devices configurable through helpers.
- Shows scores only when TeamTracker has real match data.
- Leaves knockout slots blank until TeamTracker/ESPN publishes real knockout matchups.
- Provides optional test buttons for selected speaker/TTS and phone notification helpers.

## Requirements

- Home Assistant
- HACS
- TeamTracker installed through HACS
- One TeamTracker entry per team you want to follow

TeamTracker setup:

- Sport: `Soccer (International)`
- League: `WC`
- Team IDs: use abbreviations such as `USA`, `MEX`, `ARG`, `BRA`, `CAN`, `KOR`, `CZE`, `BIH`, `RSA`.

The full 48-team ID list is in `TEAMS.md`.

## Install With HACS

Until this is accepted as a default HACS repository, install it as a custom repository:

1. Upload this folder to a GitHub repository.
2. In Home Assistant, open HACS.
3. Open the three-dot menu, then choose Custom repositories.
4. Paste your GitHub repository URL.
5. Category: Dashboard.
6. Install `World Cup Dashboard Card`.
7. Clear browser cache or reload Home Assistant.

HACS will serve the card as:

```text
/hacsfiles/world-cup-dashboard-card/world-cup-dashboard-card.js
```

If Home Assistant does not add the dashboard resource automatically, add it manually:

```yaml
url: /hacsfiles/world-cup-dashboard-card/world-cup-dashboard-card.js
type: module
```

## Basic Card

```yaml
type: custom:world-cup-dashboard-card
title: World Cup 2026
team_sensors:
  - sensor.usa
  - sensor.mex
  - sensor.arg
favorite_team_helper: input_select.world_cup_favorite_team
announcement_player_helper: input_select.world_cup_announcement_player
tts_entity_helper: input_select.world_cup_tts_entity
notification_service_helper: input_select.world_cup_notification_service
show_controls: true
```

More examples are in `examples/`.

## Optional Helpers

Copy `examples/helpers-package.yaml` into a Home Assistant package, or create the helpers manually.

The card can use these helpers:

- `input_select.world_cup_favorite_team`
- `input_select.world_cup_announcement_player`
- `input_select.world_cup_tts_entity`
- `input_select.world_cup_notification_service`
- `input_boolean.world_cup_kickoff_alerts_enabled`
- `input_boolean.world_cup_match_start_alerts_enabled`
- `input_boolean.world_cup_final_score_alerts_enabled`
- `input_boolean.world_cup_speaker_announcements_enabled`
- `input_boolean.world_cup_phone_notifications_enabled`
- `input_number.world_cup_reminder_minutes`

## Blueprints

The `blueprints/` folder includes optional automation blueprints:

- Kickoff reminder
- Match started
- Final score

Each user should create automations from the blueprints and select their own TeamTracker sensor, media player, TTS service, and notification service.

## Public Sharing Notes

Do not hardcode personal entities in shared YAML. Use helpers for phones, speakers, TTS entities, notification services, and favorite teams. This card follows that pattern so it can be shared safely.

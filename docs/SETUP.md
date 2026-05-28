# Setup Guide

This guide explains how to recreate the dashboard shown in the screenshots.

## Install Requirements

1. Install HACS.
2. Install TeamTracker from HACS.
3. Add this repository to HACS as a custom Dashboard repository:

   `https://github.com/Marxcel/world-cup-dashboard-card`

4. Install `World Cup Dashboard Card`.

## Recommended Theme

The screenshots use the Catppuccin theme.

The card itself has built-in World Cup colors, but Catppuccin makes the surrounding Home Assistant navigation and background match the screenshots.

## TeamTracker

Create one TeamTracker entry for each team you want to follow.

Use:

- Sport: `Soccer (International)`
- League: `WC`

For the full dashboard, add all 48 teams listed in `TEAMS.md`.

## Helpers

Copy `examples/helpers-package.yaml` into your Home Assistant packages folder, or create matching helpers manually.

Users should choose their own:

- Favorite team
- Announcement media player
- TTS entity
- Phone notification service
- Alert toggles
- Reminder minutes

## Dashboard

Use `examples/full-dashboard.yaml` for the closest screenshot match.

It includes:

- Main World Cup tab
- Bracket tab
- Overview card mode
- Bracket-only card mode
- Alert settings tied to helpers

## Bracket Behavior

The bracket does not use predictions. It shows `TBD` slots until TeamTracker has real knockout match data from ESPN.

When knockout matches are published, the bracket fills from the TeamTracker sensors and shows scores/winners when that data is available.

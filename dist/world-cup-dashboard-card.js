class WorldCupDashboardCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:world-cup-dashboard-card",
      title: "World Cup 2026",
      team_sensors: ["sensor.usa", "sensor.mex", "sensor.arg"],
      favorite_team_helper: "input_select.world_cup_favorite_team",
      show_controls: true
    };
  }

  setConfig(config) {
    if (!config.team_sensors || !Array.isArray(config.team_sensors)) {
      throw new Error("team_sensors is required and must be a list of TeamTracker sensor entities.");
    }
    this.config = {
      title: "World Cup 2026",
      show_controls: true,
      ...config
    };
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 8;
  }

  render() {
    if (!this.shadowRoot || !this.config || !this._hass) return;
    const teams = this.getTeamRows();
    const favorite = this.getHelperState(this.config.favorite_team_helper) || this.config.favorite_team || "";
    const favoriteMatch = teams.find((team) => team.abbr === favorite || team.name === favorite) || teams[0];
    const today = this.getMatchesInWindow(teams, 0, 1);
    const nextSeven = this.getMatchesInWindow(teams, 0, 7);
    const nextMatches = this.uniqueMatches(teams).filter((match) => match.date && match.date >= new Date()).slice(0, 8);
    const knockout = this.getKnockoutMatches(teams);

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <ha-card>
        <div class="wc-wrap">
          ${this.renderHero()}
          <section class="grid">
            <div class="column">
              ${this.renderFeatured(favoriteMatch)}
              ${this.renderMatchList("Today's Matches", today, "No tracked matches today.")}
              ${this.renderMatchList("Next 7 Days", nextSeven, "No tracked matches in the next 7 days.")}
            </div>
            <div class="column">
              ${this.renderTrackedTeams(teams, favorite)}
              ${this.renderOpeningMatches()}
            </div>
            <div class="column">
              ${this.config.show_controls ? this.renderControls() : ""}
              ${this.renderStatus(teams)}
              ${this.renderLinks()}
            </div>
          </section>
          ${this.renderKnockout(knockout)}
          ${this.renderMatchList("Upcoming Tracked Matches", nextMatches, "No upcoming tracked matches found.")}
        </div>
      </ha-card>
    `;

    this.bindEvents();
  }

  getTeamRows() {
    return this.config.team_sensors
      .map((entityId) => {
        const state = this._hass.states[entityId];
        if (!state) return null;
        const attr = state.attributes || {};
        const abbr = this.first(attr.team_abbr, attr.team_id, attr.team_abbreviation, entityId.split(".").pop().toUpperCase());
        const opponentAbbr = this.first(attr.opponent_abbr, attr.opponent_id, attr.opponent_abbreviation, "");
        const date = this.asDate(this.first(attr.date, attr.event_date, attr.kickoff, attr.match_date));
        return {
          entityId,
          state: state.state,
          status: this.first(attr.status, attr.event_status, state.state, ""),
          abbr,
          name: this.first(attr.team_long_name, attr.team_name, attr.team, abbr),
          logo: this.first(attr.team_logo, attr.team_logo_url, attr.entity_picture, ""),
          score: this.first(attr.team_score, attr.score, ""),
          winner: Boolean(attr.team_winner),
          opponentAbbr,
          opponent: this.first(attr.opponent_name, attr.opponent_long_name, attr.opponent, opponentAbbr || "TBD"),
          opponentLogo: this.first(attr.opponent_logo, attr.opponent_logo_url, ""),
          opponentScore: this.first(attr.opponent_score, ""),
          opponentWinner: Boolean(attr.opponent_winner),
          date,
          venue: this.first(attr.venue, attr.location, ""),
          tv: this.first(attr.tv_network, attr.broadcast, attr.network, ""),
          round: this.first(attr.round, attr.event_name, attr.league, ""),
          url: this.first(attr.event_url, attr.url, "")
        };
      })
      .filter(Boolean);
  }

  uniqueMatches(teams) {
    const seen = new Set();
    return teams
      .filter((team) => team.date)
      .sort((a, b) => a.date - b.date)
      .filter((team) => {
        const key = [team.abbr, team.opponentAbbr, team.date.toISOString()].sort().join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  getMatchesInWindow(teams, startDays, endDays) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + startDays);
    const end = new Date(start);
    end.setDate(end.getDate() + endDays);
    return this.uniqueMatches(teams).filter((team) => team.date >= start && team.date < end);
  }

  getKnockoutMatches(teams) {
    const knockoutWords = ["round of 32", "round of 16", "quarter", "semi", "final"];
    return this.uniqueMatches(teams).filter((team) => {
      const round = String(team.round || "").toLowerCase();
      return knockoutWords.some((word) => round.includes(word));
    });
  }

  renderHero() {
    const opener = new Date("2026-06-11T15:00:00-04:00");
    const final = new Date("2026-07-19T15:00:00-04:00");
    const now = new Date();
    const days = Math.max(0, Math.ceil((opener - now) / 86400000));
    const subtitle = now < opener ? `${days} days until kickoff` : now < final ? "Tournament in progress" : "Tournament complete";
    return `
      <header class="hero panel color-world">
        <div>
          <p class="eyebrow">FIFA World Cup</p>
          <h1>${this.escape(this.config.title)}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="hero-meta">
          <span>Opens Jun 11</span>
          <span>Final Jul 19</span>
          <span>48 teams</span>
        </div>
      </header>
    `;
  }

  renderFeatured(match) {
    if (!match) return "";
    return `
      <section class="panel featured">
        <p class="eyebrow">Favorite / Featured Match</p>
        <h2>${this.escape(match.name)} vs ${this.escape(match.opponent)}</h2>
        <div class="scoreline">
          ${this.renderTeamBadge(match.logo, match.abbr, match.winner)}
          <span>${this.renderScore(match)}</span>
          ${this.renderTeamBadge(match.opponentLogo, match.opponentAbbr, match.opponentWinner)}
        </div>
        <div class="facts">
          <span>${this.formatDate(match.date) || "Date TBD"}</span>
          <span>${this.escape(match.venue || "Venue TBD")}</span>
          <span>${this.escape(match.tv || "TV TBD")}</span>
          <span>Status: ${this.escape(match.status || "Unknown")}</span>
        </div>
        ${match.url ? `<a href="${this.escape(match.url)}" target="_blank" rel="noreferrer">Open match</a>` : ""}
      </section>
    `;
  }

  renderTrackedTeams(teams, favorite) {
    const sorted = [...teams].sort((a, b) => {
      if (a.abbr === favorite) return -1;
      if (b.abbr === favorite) return 1;
      return a.abbr.localeCompare(b.abbr);
    });
    return `
      <section class="panel">
        <div class="section-head">
          <h2>Tracked Teams</h2>
          <span>${teams.length} connected</span>
        </div>
        <div class="team-grid">
          ${sorted.map((team) => `
            <article class="team-pill ${team.abbr === favorite ? "favorite" : ""}">
              ${this.renderTeamBadge(team.logo, team.abbr, false)}
              <div>
                <strong>${this.escape(team.abbr)}</strong>
                <span>${this.escape(team.status || "Unknown")}</span>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  renderControls() {
    return `
      <section class="panel controls">
        <h2>Alert Settings</h2>
        ${this.renderSelect("Favorite Team", this.config.favorite_team_helper)}
        ${this.renderToggleState("Kickoff reminders", "input_boolean.world_cup_kickoff_alerts_enabled")}
        ${this.renderToggleState("Match-start alerts", "input_boolean.world_cup_match_start_alerts_enabled")}
        ${this.renderToggleState("Final-score alerts", "input_boolean.world_cup_final_score_alerts_enabled")}
        ${this.renderToggleState("Speaker announcements", "input_boolean.world_cup_speaker_announcements_enabled")}
        ${this.renderToggleState("Phone notifications", "input_boolean.world_cup_phone_notifications_enabled")}
        ${this.renderHelperValue("Reminder", "input_number.world_cup_reminder_minutes", "min")}
        ${this.renderSelect("Speaker", this.config.announcement_player_helper)}
        ${this.renderSelect("TTS", this.config.tts_entity_helper)}
        ${this.renderSelect("Phone", this.config.notification_service_helper)}
        <div class="button-row">
          <button data-action="test-speaker">Test Speaker</button>
          <button data-action="stop-speaker">Stop Speaker</button>
          <button data-action="test-phone">Test Phone</button>
        </div>
      </section>
    `;
  }

  renderSelect(label, entityId) {
    if (!entityId || !this._hass.states[entityId]) return "";
    const state = this._hass.states[entityId];
    const options = state.attributes.options || [state.state];
    return `
      <label class="field">
        <span>${this.escape(label)}</span>
        <select data-helper="${this.escape(entityId)}">
          ${options.map((option) => `<option value="${this.escape(option)}" ${option === state.state ? "selected" : ""}>${this.escape(option)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  renderToggleState(label, entityId) {
    const state = this.getHelperState(entityId);
    if (!state) return "";
    return `<div class="status-row"><span>${this.escape(label)}</span><strong class="${state === "on" ? "ok" : "muted"}">${state}</strong></div>`;
  }

  renderHelperValue(label, entityId, unit = "") {
    const state = this.getHelperState(entityId);
    if (!state) return "";
    return `<div class="status-row"><span>${this.escape(label)}</span><strong>${this.escape(state)} ${this.escape(unit)}</strong></div>`;
  }

  renderStatus(teams) {
    const missing = this.config.team_sensors.length - teams.length;
    return `
      <section class="panel color-blue">
        <h2>Dashboard Status</h2>
        <div class="status-row"><span>Team sensors</span><strong>${teams.length}/${this.config.team_sensors.length}</strong></div>
        <div class="status-row"><span>Missing</span><strong class="${missing ? "warn" : "ok"}">${missing}</strong></div>
        <p class="muted">Scores and knockout matches update from TeamTracker data. Blank knockout slots mean real matchups have not been published yet.</p>
      </section>
    `;
  }

  renderLinks() {
    return `
      <section class="panel links">
        <h2>Links</h2>
        <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noreferrer">FIFA World Cup</a>
        <a href="https://www.espn.com/soccer/scoreboard" target="_blank" rel="noreferrer">ESPN Scores</a>
        <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures" target="_blank" rel="noreferrer">Full Schedule</a>
      </section>
    `;
  }

  renderMatchList(title, matches, emptyText) {
    return `
      <section class="panel match-list">
        <div class="section-head">
          <h2>${this.escape(title)}</h2>
          <span>${matches.length}</span>
        </div>
        ${matches.length ? matches.map((match) => `
          <article class="match-row">
            <div>${this.renderTeamBadge(match.logo, match.abbr, match.winner)} ${this.escape(match.abbr)} vs ${this.escape(match.opponentAbbr || match.opponent)}</div>
            <strong>${this.formatDate(match.date) || "TBD"}</strong>
            <span>${this.escape(match.venue || "")}${match.tv ? ` - ${this.escape(match.tv)}` : ""}</span>
          </article>
        `).join("") : `<p class="muted">${this.escape(emptyText)}</p>`}
      </section>
    `;
  }

  renderOpeningMatches() {
    const matches = [
      ["Jun 11", "Group A", "MEX", "RSA", "Mexico City"],
      ["Jun 11", "Group A", "KOR", "CZE", "Guadalajara"],
      ["Jun 12", "Group B", "CAN", "BIH", "Toronto"],
      ["Jun 12", "Group D", "USA", "PAR", "Los Angeles"],
      ["Jun 13", "Group B", "QAT", "SUI", "San Francisco Bay Area"],
      ["Jun 13", "Group C", "BRA", "MAR", "New York/New Jersey"],
      ["Jun 13", "Group C", "HAI", "SCO", "Boston"],
      ["Jun 14", "Group D", "TUR", "AUS", "Vancouver"],
      ["Jun 14", "Group E", "GER", "CUW", "Houston"],
      ["Jun 14", "Group F", "NED", "JPN", "Dallas"]
    ];
    return `
      <section class="panel color-green">
        <h2>Opening Matches</h2>
        ${matches.map((match) => `
          <article class="match-row compact">
            <div><strong>${match[0]}</strong> ${match[1]}</div>
            <strong>${match[2]} vs ${match[3]}</strong>
            <span>${match[4]}</span>
          </article>
        `).join("")}
      </section>
    `;
  }

  renderKnockout(matches) {
    const rounds = ["Round of 32", "Round of 16", "Quarter Finals", "Semi Finals", "Final"];
    const cards = matches.length ? matches : Array.from({ length: 16 }, (_, index) => ({
      abbr: `R32 ${index + 1}`,
      opponent: "TBD",
      status: "Waiting for real matchup"
    }));
    return `
      <section class="panel bracket color-field">
        <div class="section-head">
          <h2>Auto Knockout Bracket</h2>
          <span>${matches.length ? "Live data" : "Waiting for knockout stage"}</span>
        </div>
        <div class="round-labels">${rounds.map((round) => `<strong>${round}</strong>`).join("")}</div>
        <div class="bracket-grid">
          ${cards.slice(0, 16).map((match) => `
            <article class="bracket-slot">
              <span>${this.escape(match.abbr || "TBD")}</span>
              <b>${this.renderScore(match)}</b>
              <span>${this.escape(match.opponentAbbr || match.opponent || "TBD")}</span>
            </article>
          `).join("")}
        </div>
        <p class="muted">The bracket updates from TeamTracker when real knockout matchups are available. It does not use prediction placeholders.</p>
      </section>
    `;
  }

  renderTeamBadge(logo, abbr, winner) {
    if (logo) {
      return `<img class="badge ${winner ? "winner" : ""}" src="${this.escape(logo)}" alt="${this.escape(abbr)}">`;
    }
    return `<span class="badge fallback ${winner ? "winner" : ""}">${this.escape(abbr || "?")}</span>`;
  }

  renderScore(match) {
    const status = String(match.status || "").toLowerCase();
    const pre = ["pre", "scheduled", "not started"].some((word) => status.includes(word));
    if (pre) return "vs";
    if (match.score !== "" && match.opponentScore !== "") return `${this.escape(match.score)} - ${this.escape(match.opponentScore)}`;
    return "vs";
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll("select[data-helper]").forEach((select) => {
      select.addEventListener("change", (event) => {
        this._hass.callService("input_select", "select_option", {
          entity_id: event.target.dataset.helper,
          option: event.target.value
        });
      });
    });
    this.shadowRoot.querySelector('[data-action="test-speaker"]')?.addEventListener("click", () => this.testSpeaker());
    this.shadowRoot.querySelector('[data-action="stop-speaker"]')?.addEventListener("click", () => this.stopSpeaker());
    this.shadowRoot.querySelector('[data-action="test-phone"]')?.addEventListener("click", () => this.testPhone());
  }

  testSpeaker() {
    const player = this.getHelperState(this.config.announcement_player_helper);
    const tts = this.getHelperState(this.config.tts_entity_helper);
    if (!player || !tts) return;
    this._hass.callService("tts", "speak", {
      entity_id: tts,
      cache: true,
      media_player_entity_id: player,
      message: "World Cup dashboard speaker test."
    }, { entity_id: tts });
  }

  stopSpeaker() {
    const player = this.getHelperState(this.config.announcement_player_helper);
    if (!player) return;
    this._hass.callService("media_player", "media_stop", { entity_id: player });
  }

  testPhone() {
    const serviceEntity = this.getHelperState(this.config.notification_service_helper);
    if (!serviceEntity || !serviceEntity.startsWith("notify.")) return;
    const service = serviceEntity.split(".").slice(1).join(".");
    this._hass.callService("notify", service, {
      title: "World Cup",
      message: "World Cup dashboard phone notification test."
    });
  }

  getHelperState(entityId) {
    return entityId && this._hass.states[entityId] ? this._hass.states[entityId].state : "";
  }

  asDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  formatDate(date) {
    if (!date) return "";
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  first(...values) {
    return values.find((value) => value !== undefined && value !== null && value !== "") ?? "";
  }

  escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  styles() {
    return `
      :host {
        display: block;
        --wc-bg: #11131f;
        --wc-panel: rgba(31, 32, 49, 0.92);
        --wc-line: rgba(255, 255, 255, 0.12);
        --wc-text: #f7f8ff;
        --wc-muted: #c6c8dd;
        --wc-purple: #c9a1ff;
        --wc-blue: #60a5fa;
        --wc-green: #45d483;
        --wc-gold: #f4bd50;
        --wc-red: #f05a64;
      }
      ha-card {
        overflow: hidden;
        color: var(--wc-text);
        background: var(--wc-bg);
      }
      .wc-wrap {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(260px, 1fr));
        gap: 14px;
        align-items: start;
      }
      .column {
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }
      .panel {
        border: 1px solid var(--wc-line);
        border-radius: 12px;
        padding: 16px;
        background: var(--wc-panel);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
      }
      .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .color-world {
        background: linear-gradient(135deg, rgba(22, 92, 190, 0.6), rgba(17, 117, 72, 0.45) 45%, rgba(188, 52, 66, 0.45));
        border-color: rgba(244, 189, 80, 0.55);
      }
      .color-blue { background: linear-gradient(135deg, rgba(35, 73, 136, 0.62), rgba(25, 40, 62, 0.9)); }
      .color-green { background: linear-gradient(135deg, rgba(28, 100, 72, 0.58), rgba(35, 37, 45, 0.92)); }
      .color-field { background: linear-gradient(180deg, rgba(15, 94, 61, 0.46), rgba(31, 32, 49, 0.95)); }
      h1, h2, p { margin: 0; }
      h1 { font-size: clamp(24px, 3vw, 42px); line-height: 1; }
      h2 { font-size: 20px; line-height: 1.2; }
      a { color: #d9b7ff; font-weight: 700; }
      .eyebrow {
        color: var(--wc-gold);
        font-weight: 800;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0;
        margin-bottom: 6px;
      }
      .hero-meta, .facts, .button-row, .section-head, .status-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .hero-meta { flex-wrap: wrap; justify-content: flex-end; }
      .hero-meta span, .team-pill, button {
        border: 1px solid var(--wc-line);
        border-radius: 999px;
        padding: 8px 11px;
        background: rgba(0, 0, 0, 0.18);
      }
      .section-head, .status-row { justify-content: space-between; }
      .featured {
        border-color: rgba(244, 189, 80, 0.5);
        background: linear-gradient(135deg, rgba(125, 74, 22, 0.62), rgba(54, 35, 78, 0.72));
      }
      .scoreline {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 16px;
        margin: 18px 0;
      }
      .scoreline span { text-align: center; font-size: 22px; font-weight: 900; }
      .facts { flex-direction: column; align-items: flex-start; color: var(--wc-muted); }
      .team-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }
      .team-pill {
        display: flex;
        align-items: center;
        gap: 9px;
        border-radius: 10px;
      }
      .team-pill.favorite {
        border-color: var(--wc-gold);
        background: rgba(244, 189, 80, 0.12);
      }
      .team-pill div, .match-row {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .team-pill span, .muted, .match-row span {
        color: var(--wc-muted);
        font-size: 12px;
      }
      .badge {
        width: 34px;
        height: 24px;
        object-fit: contain;
        flex: 0 0 auto;
      }
      .badge.fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        font-size: 11px;
        font-weight: 800;
      }
      .winner { outline: 2px solid var(--wc-green); }
      .match-list, .controls, .links {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .match-row {
        padding: 10px 0;
        border-top: 1px solid var(--wc-line);
      }
      .match-row div {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }
      .compact { gap: 4px; }
      .field {
        display: grid;
        gap: 5px;
      }
      .field span {
        color: var(--wc-muted);
        font-size: 12px;
      }
      select {
        width: 100%;
        min-width: 0;
        border: 1px solid var(--wc-line);
        border-radius: 8px;
        padding: 10px;
        color: var(--wc-text);
        background: rgba(0,0,0,0.2);
      }
      button {
        color: var(--wc-text);
        cursor: pointer;
        font-weight: 800;
      }
      button:hover { border-color: var(--wc-purple); }
      .button-row { flex-wrap: wrap; }
      .ok { color: var(--wc-green); }
      .warn { color: var(--wc-red); }
      .bracket {
        overflow: auto;
      }
      .round-labels {
        display: grid;
        grid-template-columns: repeat(5, minmax(120px, 1fr));
        gap: 8px;
        margin: 14px 0 8px;
        min-width: 720px;
        text-align: center;
      }
      .bracket-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(150px, 1fr));
        gap: 10px;
        min-width: 720px;
      }
      .bracket-slot {
        min-height: 58px;
        border: 2px solid rgba(255, 255, 255, 0.42);
        border-left-width: 8px;
        border-radius: 8px;
        padding: 8px;
        background: rgba(255,255,255,0.9);
        color: #10131d;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 8px;
      }
      @media (max-width: 1100px) {
        .grid { grid-template-columns: repeat(2, minmax(240px, 1fr)); }
      }
      @media (max-width: 760px) {
        .wc-wrap { padding: 10px; }
        .grid { grid-template-columns: 1fr; }
        .hero { align-items: flex-start; flex-direction: column; }
        .hero-meta { justify-content: flex-start; }
        .team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    `;
  }
}

customElements.define("world-cup-dashboard-card", WorldCupDashboardCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "world-cup-dashboard-card",
  name: "World Cup Dashboard Card",
  description: "FIFA World Cup dashboard powered by TeamTracker sensors."
});

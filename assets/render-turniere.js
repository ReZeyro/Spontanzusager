const turnierListContainer = document.getElementById("turnierList");
const showMoreWrap = document.getElementById("turnierMoreWrap");
const finishedTurniereList = document.getElementById("finishedTurniereList");
const toggleFinishedBtn = document.getElementById("toggleFinishedBtn");

function parseGermanDate(dateString) {
    const [day, month, year] = dateString.split(".");
    return new Date(`${year}-${month}-${day}T00:00:00`);
}

function getPlayerOptions() {
    if (typeof players === "undefined") return "";

    return players.map((player) => `
        <option value="${player.id}">
            ${player.jerseyName} (${player.realName})
        </option>
    `).join("");
}

function getActiveTournaments() {
    return tournaments
        .filter((tournament) => !tournament.finished)
        .sort((a, b) => parseGermanDate(a.date) - parseGermanDate(b.date));
}

function getFinishedTournaments() {
    return tournaments
        .filter((tournament) => tournament.finished)
        .sort((a, b) => parseGermanDate(b.date) - parseGermanDate(a.date));
}

function getTournamentAutoStatus(tournamentId) {
    const tournament = tournaments.find((t) => t.id === tournamentId);

    if (!tournament) return "Geplant";
    if (tournament.finished) return "Abgeschlossen";

    const activeTournaments = getActiveTournaments();
    const index = activeTournaments.findIndex((t) => t.id === tournamentId);

    if (index === 0) return "Nächstes Turnier";
    if (index === 1) return "Ausstehend";
    return "Geplant";
}

function renderActiveTurniere() {
    if (!turnierListContainer) return;

    const activeTournaments = getActiveTournaments();

    if (activeTournaments.length === 0) {
        turnierListContainer.innerHTML = `
            <div class="turnier-empty-state">
                Aktuell sind keine aktiven Turniere eingetragen.
            </div>
        `;
        showMoreWrap.innerHTML = "";
        return;
    }

    turnierListContainer.innerHTML = activeTournaments.map((tournament, index) => {
        const isHidden = index >= 3 ? "hidden-turnier" : "visible";
        const number = index + 1;
        const autoStatus = getTournamentAutoStatus(tournament.id);

        return `
            <article class="turnier-item ${isHidden}" data-tournament-id="${tournament.id}">
                <button class="turnier-toggle" type="button">
                    <div class="turnier-main">
                        <div>
                            <p class="turnier-status">${autoStatus}</p>
                            <h3>${tournament.title}</h3>
                        </div>
                        <div class="turnier-meta">
                            <span>${tournament.date}</span>
                            <span>${tournament.location}</span>
                        </div>
                    </div>
                    <span class="turnier-arrow">⌄</span>
                </button>

                <div class="turnier-content">
                    <div class="turnier-info-grid">
                        <div>
                            <h4>Infos</h4>
                            <p><strong>Datum:</strong> ${tournament.date}</p>
                            <p><strong>Ort:</strong> ${tournament.location}</p>
                            <p><strong>Status:</strong> ${tournament.statusDetail}</p>
                        </div>

                        <div>
                            <h4>Bereits dabei</h4>
                            <ul class="teilnehmer-liste" data-list>
                                <li><span>Lädt...</span><span>...</span></li>
                            </ul>
                        </div>
                    </div>

                    <div class="turnier-admin-box">
                        <h4>Turnierstatus</h4>
                        <p>Wenn das Turnier vorbei ist, kannst du es hier abschließen und die Platzierung eintragen.</p>
                        <button class="btn btn-secondary finish-tournament-btn" data-id="${tournament.id}" type="button">
                            Turnier abschließen
                        </button>
                    </div>

                    <form class="turnier-form" data-form>
                        <h4>Für dieses Turnier eintragen</h4>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="player${number}">Spieler</label>
                                <select id="player${number}" name="playerId" required>
                                    <option value="">Bitte wählen</option>
                                    ${getPlayerOptions()}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="position${number}">Position</label>
                                <select id="position${number}" name="position" required>
                                    <option value="">Bitte wählen</option>
                                    <option value="Torwart">Torwart</option>
                                    <option value="Schütze">Schütze</option>
                                    <option value="Torwart & Schütze">Torwart &amp; Schütze</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary">Eintragen</button>
                    </form>
                </div>
            </article>
        `;
    }).join("");

    if (activeTournaments.length <= 3) {
        showMoreWrap.innerHTML = "";
    } else {
        showMoreWrap.innerHTML = `
            <button id="showMoreBtn" class="show-more-btn" type="button">
                Weitere Turniere anzeigen ⌄
            </button>
        `;

        const showMoreBtn = document.getElementById("showMoreBtn");
        const hiddenTurniere = document.querySelectorAll(".hidden-turnier");

        showMoreBtn.addEventListener("click", () => {
            hiddenTurniere.forEach((turnier) => {
                turnier.classList.toggle("show");
            });

            const anyHiddenStillClosed = [...hiddenTurniere].some(
                (turnier) => !turnier.classList.contains("show")
            );

            showMoreBtn.textContent = anyHiddenStillClosed
                ? "Weitere Turniere anzeigen ⌄"
                : "Weniger anzeigen ⌃";
        });
    }

    initFinishButtons();
}

function renderFinishedTurniere() {
    if (!finishedTurniereList) return;

    const finishedTournaments = getFinishedTournaments();

    if (finishedTournaments.length === 0) {
        finishedTurniereList.innerHTML = `
            <div class="turnier-empty-state">
                Noch keine abgeschlossenen Turniere vorhanden.
            </div>
        `;
        return;
    }

    finishedTurniereList.innerHTML = finishedTournaments.map((tournament) => `
        <article class="finished-turnier-card" data-finished-id="${tournament.id}">
            <div class="finished-header">
                <h3>${tournament.title}</h3>
                <span class="finished-placement">
                    ${tournament.placement ? `${tournament.placement}. Platz` : "–"}
                </span>
            </div>

            <div class="finished-stats-grid" id="stats-${tournament.id}">
                <div class="finished-stat-box">
                    <span>Lädt…</span>
                    <strong>…</strong>
                </div>
            </div>

            <div class="finished-performance-box" id="performance-${tournament.id}">
                Lädt Top Performance...
            </div>

            <div class="finished-actions">
                <button class="btn btn-secondary reopen-tournament-btn" data-id="${tournament.id}" type="button">
                    Wieder öffnen
                </button>
            </div>
        </article>
    `).join("");

    initReopenButtons();
}

function initFinishButtons() {
    const finishButtons = document.querySelectorAll(".finish-tournament-btn");

    finishButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tournamentId = button.dataset.id;
            const tournament = tournaments.find((t) => t.id === tournamentId);

            if (!tournament) return;

            const placementInput = prompt("Welchen Platz habt ihr gemacht? (z. B. 1, 2, 3)");

            if (!placementInput) return;

            const placement = parseInt(placementInput, 10);

            if (Number.isNaN(placement) || placement < 1) {
                alert("Bitte eine gültige Platzierung eingeben.");
                return;
            }

            tournament.finished = true;
            tournament.placement = placement;

            saveTournamentMeta();
            location.reload();
        });
    });
}

function initReopenButtons() {
    const reopenButtons = document.querySelectorAll(".reopen-tournament-btn");

    reopenButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tournamentId = button.dataset.id;
            const tournament = tournaments.find((t) => t.id === tournamentId);

            if (!tournament) return;

            const confirmReset = confirm("Willst du dieses Turnier wirklich wieder öffnen?");

            if (!confirmReset) return;

            tournament.finished = false;
            tournament.placement = null;

            saveTournamentMeta();
            location.reload();
        });
    });
}

if (toggleFinishedBtn && finishedTurniereList) {
    toggleFinishedBtn.addEventListener("click", () => {
        finishedTurniereList.classList.toggle("open");

        toggleFinishedBtn.textContent = finishedTurniereList.classList.contains("open")
            ? "Ausblenden ⌃"
            : "Anzeigen ⌄";
    });
}

renderActiveTurniere();
renderFinishedTurniere();
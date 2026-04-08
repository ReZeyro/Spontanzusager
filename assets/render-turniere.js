const turnierListContainer = document.getElementById("turnierList");
const showMoreWrap = document.getElementById("turnierMoreWrap");

function getSortedTournaments() {
    return [...tournaments].sort((a, b) => a.finished - b.finished);
}

function getPlayerOptions() {
    if (typeof players === "undefined") return "";

    return players.map((player) => `
        <option value="${player.id}">
            ${player.jerseyName} (${player.realName})
        </option>
    `).join("");
}

function renderTurnierePage() {
    if (!turnierListContainer || typeof tournaments === "undefined") return;

    const sortedTournaments = getSortedTournaments();

    turnierListContainer.innerHTML = sortedTournaments.map((tournament, index) => {
        const isHidden = index >= 3 ? "hidden-turnier" : "visible";
        const number = index + 1;
        const finishLabel = tournament.finished ? "Wieder öffnen" : "Turnier abschließen";
        const placementInfo = tournament.finished && tournament.placement
            ? `<p><strong>Platz:</strong> ${tournament.placement}.</p>`
            : "";

        return `
            <article class="turnier-item ${isHidden}" data-tournament-id="${tournament.id}">
                <button class="turnier-toggle" type="button">
                    <div class="turnier-main">
                        <div>
                            <p class="turnier-status">${tournament.status}</p>
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
                            ${placementInfo}
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
                        <p>${tournament.finished ? "Dieses Turnier ist abgeschlossen." : "Dieses Turnier ist noch aktiv."}</p>
                        <button class="btn btn-secondary finish-tournament-btn" data-id="${tournament.id}" type="button">
                            ${finishLabel}
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

    if (showMoreWrap) {
        if (sortedTournaments.length <= 3) {
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
    }

    initFinishButtons();
}

function initFinishButtons() {
    const finishButtons = document.querySelectorAll(".finish-tournament-btn");

    finishButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tournamentId = button.dataset.id;
            const tournament = tournaments.find(t => t.id === tournamentId);

            if (!tournament) return;

            if (!tournament.finished) {
                const placementInput = prompt("Welchen Platz habt ihr gemacht? (z. B. 1, 2, 3)");

                if (!placementInput) return;

                const placement = parseInt(placementInput, 10);

                if (Number.isNaN(placement) || placement < 1) {
                    alert("Bitte eine gültige Platzierung eingeben.");
                    return;
                }

                tournament.finished = true;
                tournament.placement = placement;
                tournament.status = "Abgeschlossen";
                tournament.statusDetail = `Turnier beendet · ${placement}. Platz`;

                saveTournamentMeta();
                location.reload();
            } else {
                const confirmReset = confirm("Turnier wieder öffnen und Platzierung entfernen?");

                if (!confirmReset) return;

                tournament.finished = false;
                tournament.placement = null;
                saveTournamentMeta();
                location.reload();
            }
        });
    });
}

renderTurnierePage();
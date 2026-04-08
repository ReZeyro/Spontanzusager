/* TURNIERE */
const turnierItems = document.querySelectorAll(".turnier-item");
const hiddenTurniere = document.querySelectorAll(".hidden-turnier");
const showMoreBtn = document.getElementById("showMoreBtn");

turnierItems.forEach((item) => {
    const toggleButton = item.querySelector(".turnier-toggle");

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            turnierItems.forEach((otherItem) => {
                otherItem.classList.remove("open");
            });

            if (!isOpen) {
                item.classList.add("open");
            }
        });
    }
});

if (showMoreBtn) {
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

const forms = document.querySelectorAll("[data-form]");

forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameInput = form.querySelector('input[name="name"]');
        const positionSelect = form.querySelector('select[name="position"]');
        const turnierContent = form.closest(".turnier-content");

        if (!turnierContent) return;

        const teilnehmerListe = turnierContent.querySelector("[data-list]");

        if (!teilnehmerListe || !nameInput || !positionSelect) return;

        const name = nameInput.value.trim();
        const position = positionSelect.value;

        if (!name || !position) return;

        const firstEntry = teilnehmerListe.querySelector("li");

        if (firstEntry && firstEntry.textContent.includes("Noch niemand")) {
            firstEntry.remove();
        }

        const newItem = document.createElement("li");
        newItem.innerHTML = `<span>${name}</span><span>${position}</span>`;
        teilnehmerListe.appendChild(newItem);

        form.reset();
    });
});

/* TEAM RENDER */
const teamList = document.getElementById("teamList");

if (teamList && typeof players !== "undefined") {
    teamList.innerHTML = players.map((player) => `
        <article class="team-member">
            <span class="real-name">${player.realName}</span>
            <span class="jersey-name">${player.jerseyName}</span>
        </article>
    `).join("");
}

/* TOPSCORER RENDER */
const topscorerGrid = document.getElementById("topscorerGrid");

if (topscorerGrid && typeof players !== "undefined") {
    const topThree = [...players]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 3);

    const placeClasses = ["first-place", "second-place", "third-place"];

    topscorerGrid.innerHTML = topThree.map((player, index) => `
        <article class="topscorer-card ${placeClasses[index]}">
            <span class="place-badge">#${index + 1}</span>
            <h3>${player.jerseyName}</h3>
            <p class="topscorer-goals">${player.goals} Tore</p>
            <p>${player.realName}</p>
        </article>
    `).join("");
}

/* TEAMSTATS RENDER */
const teamStatsGrid = document.getElementById("teamStatsGrid");

if (teamStatsGrid && typeof teamStats !== "undefined") {
    teamStatsGrid.innerHTML = `
        <article class="team-stat-card">
            <span class="team-stat-number">${teamStats.tournamentsPlayed}</span>
            <span class="team-stat-label">Turniere gespielt</span>
        </article>

        <article class="team-stat-card">
            <span class="team-stat-number">${teamStats.totalGoals}</span>
            <span class="team-stat-label">Tore gesamt</span>
        </article>

        <article class="team-stat-card">
            <span class="team-stat-number">${teamStats.firstPlaces}</span>
            <span class="team-stat-label">1. Plätze</span>
        </article>

        <article class="team-stat-card">
            <span class="team-stat-number">${teamStats.secondPlaces}</span>
            <span class="team-stat-label">2. Plätze</span>
        </article>

        <article class="team-stat-card">
            <span class="team-stat-number">${teamStats.thirdPlaces}</span>
            <span class="team-stat-label">3. Plätze</span>
        </article>

        <article class="team-stat-card">
            <span class="team-stat-number">${teamStats.prizeMoney}</span>
            <span class="team-stat-label">Preisgeld gewonnen</span>
        </article>
    `;
}

/* SPIELERSTATISTIKEN RENDER */
const playerStatsList = document.getElementById("playerStatsList");

if (playerStatsList && typeof players !== "undefined") {
    const sortedPlayers = [...players].sort((a, b) => b.goals - a.goals);

    playerStatsList.innerHTML = sortedPlayers.map((player) => {
        const quote = player.shots > 0
            ? Math.round((player.goals / player.shots) * 100)
            : 0;

        return `
            <article class="player-stat-item">
                <button class="player-stat-toggle" type="button">
                    <div class="player-stat-head">
                        <div>
                            <h3>${player.jerseyName}</h3>
                            <p>${player.realName} · Trefferquote: ${quote}%</p>
                        </div>
                        <span class="player-stat-arrow">⌄</span>
                    </div>
                </button>

                <div class="player-stat-content">
                    <div class="player-stat-grid">
                        <div class="player-stat-box">
                            <span class="mini-label">Turniere</span>
                            <strong>${player.tournaments}</strong>
                        </div>
                        <div class="player-stat-box">
                            <span class="mini-label">Schüsse</span>
                            <strong>${player.shots}</strong>
                        </div>
                        <div class="player-stat-box">
                            <span class="mini-label">Tore</span>
                            <strong>${player.goals}</strong>
                        </div>
                        <div class="player-stat-box">
                            <span class="mini-label">Quote</span>
                            <strong>${quote}%</strong>
                        </div>
                    </div>

                    <div class="quote-bar-wrap">
                        <div class="quote-bar">
                            <div class="quote-fill" style="width: ${quote}%;"></div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

/* SPIELERSTATISTIKEN AUFKLAPPEN */
const initPlayerStatToggles = () => {
    const playerStatItems = document.querySelectorAll(".player-stat-item");

    playerStatItems.forEach((item) => {
        const toggleButton = item.querySelector(".player-stat-toggle");

        if (toggleButton) {
            toggleButton.addEventListener("click", () => {
                const isOpen = item.classList.contains("open");

                playerStatItems.forEach((otherItem) => {
                    otherItem.classList.remove("open");
                });

                if (!isOpen) {
                    item.classList.add("open");
                }
            });
        }
    });
};

initPlayerStatToggles();
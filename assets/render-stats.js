import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const topscorerGrid = document.getElementById("topscorerGrid");
const teamStatsGrid = document.getElementById("teamStatsGrid");
const playerStatsList = document.getElementById("playerStatsList");
const performanceGrid = document.getElementById("performanceGrid");

const tournamentSnapshots = new Map();

function createEmptyPlayerMap() {
    const map = new Map();

    players.forEach((player) => {
        map.set(player.id, {
            playerId: player.id,
            realName: player.realName,
            jerseyName: player.jerseyName,
            tournaments: 0,
            shots: 0,
            goals: 0
        });
    });

    return map;
}

function renderStats() {
    const playerMap = createEmptyPlayerMap();
    let totalGoals = 0;
    const performanceEntries = [];

    tournamentSnapshots.forEach((entries, tournamentId) => {
        const tournament = tournaments.find((t) => t.id === tournamentId);

        entries.forEach((entry) => {
            const current = playerMap.get(entry.playerId);

            if (!current) return;

            current.tournaments += 1;
            current.shots += entry.shots || 0;
            current.goals += entry.goals || 0;

            totalGoals += entry.goals || 0;
        });

        if (tournament && tournament.finished && entries.length > 0) {
            const bestEntry = [...entries]
                .map((entry) => ({
                    ...entry,
                    quote: (entry.shots || 0) > 0
                        ? Math.round(((entry.goals || 0) / (entry.shots || 0)) * 100)
                        : 0
                }))
                .sort((a, b) => {
                    if ((b.goals || 0) !== (a.goals || 0)) {
                        return (b.goals || 0) - (a.goals || 0);
                    }

                    return (b.quote || 0) - (a.quote || 0);
                })[0];

            performanceEntries.push({
                tournamentTitle: tournament.title,
                placement: tournament.placement,
                jerseyName: bestEntry.jerseyName,
                realName: bestEntry.realName,
                goals: bestEntry.goals || 0,
                shots: bestEntry.shots || 0,
                quote: bestEntry.quote || 0
            });
        }
    });

    const playerStats = [...playerMap.values()].map((player) => ({
        ...player,
        quote: player.shots > 0 ? Math.round((player.goals / player.shots) * 100) : 0
    }));

    const sortedByGoals = [...playerStats].sort((a, b) => {
        if (b.goals !== a.goals) {
            return b.goals - a.goals;
        }

        return b.quote - a.quote;
    });

    const topThree = sortedByGoals.slice(0, 3);

    const finishedTournaments = tournaments.filter((t) => t.finished);
    const firstPlaces = finishedTournaments.filter((t) => t.placement === 1).length;
    const secondPlaces = finishedTournaments.filter((t) => t.placement === 2).length;
    const thirdPlaces = finishedTournaments.filter((t) => t.placement === 3).length;

    if (topscorerGrid) {
        const placeClasses = ["first-place", "second-place", "third-place"];

        topscorerGrid.innerHTML = topThree.map((player, index) => `
            <article class="topscorer-card ${placeClasses[index] || ""}">
                <span class="place-badge">#${index + 1}</span>
                <h3>${player.jerseyName}</h3>
                <p class="topscorer-goals">${player.goals} Tore</p>
                <p>${player.realName}</p>
            </article>
        `).join("");
    }

    if (teamStatsGrid) {
        teamStatsGrid.innerHTML = `
            <article class="team-stat-card">
                <span class="team-stat-number">${finishedTournaments.length}</span>
                <span class="team-stat-label">Turniere gespielt</span>
            </article>

            <article class="team-stat-card">
                <span class="team-stat-number">${totalGoals}</span>
                <span class="team-stat-label">Tore gesamt</span>
            </article>

            <article class="team-stat-card">
                <span class="team-stat-number">${firstPlaces}</span>
                <span class="team-stat-label">1. Plätze</span>
            </article>

            <article class="team-stat-card">
                <span class="team-stat-number">${secondPlaces}</span>
                <span class="team-stat-label">2. Plätze</span>
            </article>

            <article class="team-stat-card">
                <span class="team-stat-number">${thirdPlaces}</span>
                <span class="team-stat-label">3. Plätze</span>
            </article>

            <article class="team-stat-card">
                <span class="team-stat-number">–</span>
                <span class="team-stat-label">Preisgeld frei pflegbar</span>
            </article>
        `;
    }

    if (performanceGrid) {
        if (performanceEntries.length === 0) {
            performanceGrid.innerHTML = `
                <div class="turnier-empty-state">
                    Noch keine abgeschlossenen Turniere mit Spielerdaten vorhanden.
                </div>
            `;
        } else {
            performanceGrid.innerHTML = performanceEntries.map((entry) => `
                <article class="performance-card">
                    <div class="performance-header">
                        <h3>${entry.tournamentTitle}</h3>
                        <span class="performance-placement">
                            ${entry.placement ? `${entry.placement}. Platz` : "–"}
                        </span>
                    </div>

                    <div class="performance-player">
                        <p class="performance-label">Top Performance</p>
                        <h4>${entry.jerseyName}</h4>
                        <p>${entry.realName}</p>
                    </div>

                    <div class="performance-stats">
                        <div class="performance-stat-box">
                            <span>Tore</span>
                            <strong>${entry.goals}</strong>
                        </div>
                        <div class="performance-stat-box">
                            <span>Schüsse</span>
                            <strong>${entry.shots}</strong>
                        </div>
                        <div class="performance-stat-box">
                            <span>Quote</span>
                            <strong>${entry.quote}%</strong>
                        </div>
                    </div>
                </article>
            `).join("");
        }
    }

    if (playerStatsList) {
        playerStatsList.innerHTML = sortedByGoals.map((player) => `
            <article class="player-stat-item">
                <button class="player-stat-toggle" type="button">
                    <div class="player-stat-head">
                        <div>
                            <h3>${player.jerseyName}</h3>
                            <p>${player.realName} · Trefferquote: ${player.quote}%</p>
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
                            <strong>${player.quote}%</strong>
                        </div>
                    </div>

                    <div class="quote-bar-wrap">
                        <div class="quote-bar">
                            <div class="quote-fill" style="width: ${player.quote}%;"></div>
                        </div>
                    </div>
                </div>
            </article>
        `).join("");

        initPlayerStatToggles();
    }
}

function initPlayerStatToggles() {
    const playerStatItems = document.querySelectorAll(".player-stat-item");

    playerStatItems.forEach((item) => {
        const toggleButton = item.querySelector(".player-stat-toggle");

        if (!toggleButton) return;

        toggleButton.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            playerStatItems.forEach((otherItem) => {
                otherItem.classList.remove("open");
            });

            if (!isOpen) {
                item.classList.add("open");
            }
        });
    });
}

if (typeof tournaments !== "undefined") {
    tournaments.forEach((tournament) => {
        const participantsRef = collection(db, "tournaments", tournament.id, "participants");

        onSnapshot(participantsRef, (snapshot) => {
            const entries = snapshot.docs.map((doc) => doc.data());
            tournamentSnapshots.set(tournament.id, entries);
            renderStats();
        });
    });
}
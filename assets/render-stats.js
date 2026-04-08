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

    tournamentSnapshots.forEach((entries) => {
        entries.forEach((entry) => {
            const current = playerMap.get(entry.playerId);

            if (!current) return;

            current.tournaments += 1;
            current.shots += entry.shots || 0;
            current.goals += entry.goals || 0;

            totalGoals += entry.goals || 0;
        });
    });

    const playerStats = [...playerMap.values()].map((player) => ({
        ...player,
        quote: player.shots > 0 ? Math.round((player.goals / player.shots) * 100) : 0
    }));

    const sortedByGoals = [...playerStats].sort((a, b) => b.goals - a.goals);
    const topThree = sortedByGoals.slice(0, 3);

    const finishedTournaments = tournaments.filter(t => t.finished);
    const firstPlaces = finishedTournaments.filter(t => t.placement === 1).length;
    const secondPlaces = finishedTournaments.filter(t => t.placement === 2).length;
    const thirdPlaces = finishedTournaments.filter(t => t.placement === 3).length;

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
            const entries = snapshot.docs.map(doc => doc.data());
            tournamentSnapshots.set(tournament.id, entries);
            renderStats();
        });
    });
}
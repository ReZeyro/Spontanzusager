import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    onSnapshot,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tournamentSelect = document.getElementById("liveTournamentSelect");
const livePlayersGrid = document.getElementById("livePlayersGrid");
const liveTournamentTitle = document.getElementById("liveTournamentTitle");
const liveTournamentMeta = document.getElementById("liveTournamentMeta");

let unsubscribeParticipants = null;

function getSortedTournaments() {
    return [...tournaments].sort((a, b) => a.finished - b.finished);
}

function populateTournamentSelect() {
    const sortedTournaments = getSortedTournaments();

    tournamentSelect.innerHTML = sortedTournaments.map((tournament) => `
        <option value="${tournament.id}">
            ${tournament.title}${tournament.finished ? " (abgeschlossen)" : ""}
        </option>
    `).join("");
}

function renderPlayerCard(entry, tournamentId) {
    const quote = entry.shots > 0 ? Math.round((entry.goals / entry.shots) * 100) : 0;

    const card = document.createElement("article");
    card.className = "live-player-card";

    card.innerHTML = `
        <div class="live-player-top">
            <div>
                <p class="live-player-tag">${entry.position}</p>
                <h3>${entry.jerseyName}</h3>
                <p class="live-player-realname">${entry.realName}</p>
            </div>
            <div class="live-player-score">
                <span>${entry.goals} / ${entry.shots}</span>
            </div>
        </div>

        <div class="live-progress-wrap">
            <div class="live-progress-label">
                <span>Trefferquote</span>
                <span>${quote}%</span>
            </div>
            <div class="live-progress-bar">
                <div class="live-progress-fill" style="width: ${quote}%;"></div>
            </div>
        </div>

        <div class="live-actions">
            <button type="button" class="live-btn live-btn-goal">+ Tor</button>
            <button type="button" class="live-btn live-btn-miss">+ Fehlversuch</button>
            <button type="button" class="live-btn live-btn-reset">Reset</button>
        </div>
    `;

    const goalBtn = card.querySelector(".live-btn-goal");
    const missBtn = card.querySelector(".live-btn-miss");
    const resetBtn = card.querySelector(".live-btn-reset");

    goalBtn.addEventListener("click", async () => {
        await updateDoc(doc(db, "tournaments", tournamentId, "participants", entry.id), {
            shots: (entry.shots || 0) + 1,
            goals: (entry.goals || 0) + 1
        });
    });

    missBtn.addEventListener("click", async () => {
        await updateDoc(doc(db, "tournaments", tournamentId, "participants", entry.id), {
            shots: (entry.shots || 0) + 1
        });
    });

    resetBtn.addEventListener("click", async () => {
        const confirmReset = confirm(`${entry.jerseyName} wirklich auf 0 / 0 zurücksetzen?`);

        if (!confirmReset) return;

        await updateDoc(doc(db, "tournaments", tournamentId, "participants", entry.id), {
            shots: 0,
            goals: 0
        });
    });

    return card;
}

function loadLiveTournament() {
    const tournamentId = tournamentSelect.value;
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) return;

    liveTournamentTitle.textContent = tournament.title;
    liveTournamentMeta.textContent = `${tournament.date} · ${tournament.location}`;

    if (unsubscribeParticipants) {
        unsubscribeParticipants();
    }

    const participantsRef = collection(db, "tournaments", tournamentId, "participants");

    unsubscribeParticipants = onSnapshot(participantsRef, (snapshot) => {
        livePlayersGrid.innerHTML = "";

        if (snapshot.empty) {
            livePlayersGrid.innerHTML = `
                <div class="live-empty-state">
                    Noch keine Spieler für dieses Turnier eingetragen.
                </div>
            `;
            return;
        }

        snapshot.docs.forEach((docSnap) => {
            const entry = {
                id: docSnap.id,
                ...docSnap.data()
            };

            livePlayersGrid.appendChild(renderPlayerCard(entry, tournamentId));
        });
    });
}

populateTournamentSelect();
loadLiveTournament();

tournamentSelect.addEventListener("change", loadLiveTournament);
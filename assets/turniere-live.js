import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const turnierItems = document.querySelectorAll(".turnier-item");
const registeredPlayersByTournament = new Map();

/* Aktive Turniere: Aufklappen */
turnierItems.forEach((item) => {
    const toggleButton = item.querySelector(".turnier-toggle");

    if (!toggleButton) return;

    toggleButton.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");

        turnierItems.forEach((otherItem) => {
            otherItem.classList.remove("open");
        });

        if (!isOpen) {
            item.classList.add("open");
        }
    });
});

/* Aktive Turniere: Teilnehmer laden + speichern + löschen */
turnierItems.forEach((item) => {
    const tournamentId = item.dataset.tournamentId;
    const listElement = item.querySelector("[data-list]");
    const form = item.querySelector("[data-form]");

    if (!tournamentId || !listElement || !form) return;

    const participantsRef = collection(db, "tournaments", tournamentId, "participants");
    const participantsQuery = query(participantsRef, orderBy("createdAt", "asc"));

    onSnapshot(participantsQuery, (snapshot) => {
        listElement.innerHTML = "";
        const registeredIds = [];

        if (snapshot.empty) {
            registeredPlayersByTournament.set(tournamentId, registeredIds);
            listElement.innerHTML = `<li><span>Noch niemand</span><span>–</span></li>`;
            return;
        }

        snapshot.forEach((entry) => {
            const data = entry.data();
            const participantId = entry.id;

            if (data.playerId) {
                registeredIds.push(data.playerId);
            }

            const li = document.createElement("li");
            li.classList.add("teilnehmer-eintrag");

            li.innerHTML = `
                <div class="teilnehmer-info">
                    <span>${data.jerseyName} (${data.realName})</span>
                    <span>${data.position}</span>
                </div>
                <button type="button" class="delete-participant-btn">
                    Entfernen
                </button>
            `;

            const deleteButton = li.querySelector(".delete-participant-btn");

            deleteButton.addEventListener("click", async () => {
                const confirmDelete = confirm(`${data.jerseyName} wirklich aus diesem Turnier entfernen?`);

                if (!confirmDelete) return;

                try {
                    await deleteDoc(doc(db, "tournaments", tournamentId, "participants", participantId));
                } catch (error) {
                    console.error("Fehler beim Löschen:", error);
                    alert("Eintrag konnte nicht gelöscht werden.");
                }
            });

            listElement.appendChild(li);
        });

        registeredPlayersByTournament.set(tournamentId, registeredIds);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const playerSelect = form.querySelector('select[name="playerId"]');
        const positionSelect = form.querySelector('select[name="position"]');

        const playerId = playerSelect.value;
        const position = positionSelect.value;

        if (!playerId || !position) return;

        const player = players.find((p) => p.id === playerId);

        if (!player) return;

        const alreadyRegistered = registeredPlayersByTournament.get(tournamentId)?.includes(playerId);

        if (alreadyRegistered) {
            alert("Dieser Spieler ist für dieses Turnier bereits eingetragen.");
            return;
        }

        try {
            await addDoc(participantsRef, {
                playerId: player.id,
                realName: player.realName,
                jerseyName: player.jerseyName,
                position,
                shots: 0,
                goals: 0,
                createdAt: serverTimestamp()
            });

            form.reset();
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Eintrag konnte nicht gespeichert werden.");
        }
    });
});

/* Abgeschlossene Turniere: Stats + Top Performance laden */
const finishedTournaments = tournaments.filter((tournament) => tournament.finished);

finishedTournaments.forEach((tournament) => {
    const statsElement = document.getElementById(`stats-${tournament.id}`);
    const performanceElement = document.getElementById(`performance-${tournament.id}`);

    if (!statsElement || !performanceElement) return;

    const participantsRef = collection(db, "tournaments", tournament.id, "participants");

    onSnapshot(participantsRef, (snapshot) => {
        let totalParticipants = 0;
        let totalShots = 0;
        let totalGoals = 0;
        const entries = [];

        snapshot.forEach((entry) => {
            const data = entry.data();
            entries.push(data);

            totalParticipants += 1;
            totalShots += data.shots || 0;
            totalGoals += data.goals || 0;
        });

        const quote = totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : 0;

        statsElement.innerHTML = `
            <div class="finished-stat-box">
                <span>Spieler</span>
                <strong>${totalParticipants}</strong>
            </div>
            <div class="finished-stat-box">
                <span>Schüsse</span>
                <strong>${totalShots}</strong>
            </div>
            <div class="finished-stat-box">
                <span>Tore</span>
                <strong>${totalGoals}</strong>
            </div>
            <div class="finished-stat-box">
                <span>Quote</span>
                <strong>${quote}%</strong>
            </div>
        `;

        if (entries.length === 0) {
            performanceElement.innerHTML = `
                <div class="finished-performance-empty">
                    Noch keine Performance-Daten vorhanden.
                </div>
            `;
            return;
        }

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

        performanceElement.innerHTML = `
            <p class="finished-performance-label">Top Performance</p>
            <div class="finished-performance-top">
                <div>
                    <h4>${bestEntry.jerseyName}</h4>
                    <p>${bestEntry.realName}</p>
                </div>
                <span class="finished-performance-quote">${bestEntry.quote}%</span>
            </div>

            <div class="finished-performance-stats">
                <div class="finished-performance-stat">
                    <span>Tore</span>
                    <strong>${bestEntry.goals || 0}</strong>
                </div>
                <div class="finished-performance-stat">
                    <span>Schüsse</span>
                    <strong>${bestEntry.shots || 0}</strong>
                </div>
            </div>
        `;
    });
});
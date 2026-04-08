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

        const player = players.find(p => p.id === playerId);

        if (!player) return;

        const alreadyRegistered = registeredPlayersByTournament.get(tournamentId)?.includes(playerId);

        if (alreadyRegistered) {
            alert("Dieser Spieler ist für das Turnier bereits eingetragen.");
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
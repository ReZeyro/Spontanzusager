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

/* Turniere auf- und zuklappen */
const turnierItems = document.querySelectorAll(".turnier-item");

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

/* Teilnehmer live laden + speichern + löschen */
turnierItems.forEach((item) => {
    const tournamentId = item.dataset.tournamentId;
    const listElement = item.querySelector("[data-list]");
    const form = item.querySelector("[data-form]");

    if (!tournamentId || !listElement || !form) return;

    const participantsRef = collection(db, "tournaments", tournamentId, "participants");
    const participantsQuery = query(participantsRef, orderBy("createdAt", "asc"));

    onSnapshot(participantsQuery, (snapshot) => {
        listElement.innerHTML = "";

        if (snapshot.empty) {
            listElement.innerHTML = `<li><span>Noch niemand</span><span>–</span></li>`;
            return;
        }

        snapshot.forEach((entry) => {
            const data = entry.data();
            const participantId = entry.id;

            const li = document.createElement("li");
            li.classList.add("teilnehmer-eintrag");

            li.innerHTML = `
                <div class="teilnehmer-info">
                    <span>${data.name}</span>
                    <span>${data.position}</span>
                </div>
                <button type="button" class="delete-participant-btn">
                    Entfernen
                </button>
            `;

            const deleteButton = li.querySelector(".delete-participant-btn");

            deleteButton.addEventListener("click", async () => {
                const confirmDelete = confirm(`${data.name} wirklich aus diesem Turnier entfernen?`);

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
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput = form.querySelector('input[name="name"]');
        const positionSelect = form.querySelector('select[name="position"]');

        const name = nameInput.value.trim();
        const position = positionSelect.value;

        if (!name || !position) return;

        try {
            await addDoc(participantsRef, {
                name,
                position,
                createdAt: serverTimestamp()
            });

            form.reset();
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Eintrag konnte nicht gespeichert werden.");
        }
    });
});
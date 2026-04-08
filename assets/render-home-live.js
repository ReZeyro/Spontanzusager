import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const homeStatGoals = document.getElementById("homeStatGoals");
const homeTournamentText = document.getElementById("homeTournamentText");

const tournamentSnapshots = new Map();

function renderHomeTotals() {
    let totalGoals = 0;

    tournamentSnapshots.forEach((docs) => {
        docs.forEach((entry) => {
            totalGoals += entry.goals || 0;
        });
    });

    if (homeStatGoals) {
        homeStatGoals.textContent = totalGoals;
    }
}

if (typeof tournaments !== "undefined") {
    tournaments.forEach((tournament) => {
        const participantsRef = collection(db, "tournaments", tournament.id, "participants");

        onSnapshot(participantsRef, (snapshot) => {
            const docs = snapshot.docs.map(doc => doc.data());
            tournamentSnapshots.set(tournament.id, docs);
            renderHomeTotals();
        });
    });
}

if (homeTournamentText && typeof tournaments !== "undefined") {
    const sortedTournaments = [...tournaments].sort((a, b) => a.finished - b.finished);
    const nextTournament = sortedTournaments[0];

    if (nextTournament && nextTournament.finished) {
        homeTournamentText.textContent = "Dieses Turnier ist abgeschlossen.";
    }
}
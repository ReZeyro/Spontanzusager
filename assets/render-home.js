const homeTournamentStatus = document.getElementById("homeTournamentStatus");
const homeTournamentTitle = document.getElementById("homeTournamentTitle");
const homeTournamentLocation = document.getElementById("homeTournamentLocation");
const homeTournamentDate = document.getElementById("homeTournamentDate");
const homeTournamentState = document.getElementById("homeTournamentState");
const homeTournamentText = document.getElementById("homeTournamentText");

if (
    typeof tournaments !== "undefined" &&
    tournaments.length > 0 &&
    homeTournamentTitle
) {
    const nextTournament = tournaments[0];

    homeTournamentStatus.textContent = nextTournament.status;
    homeTournamentTitle.textContent = nextTournament.title;
    homeTournamentLocation.textContent = `Ort: ${nextTournament.location}`;
    homeTournamentDate.textContent = `Datum: ${nextTournament.date}`;
    homeTournamentState.textContent = `Status: ${nextTournament.statusDetail}`;
    homeTournamentText.textContent = `Hier wird automatisch das erste Turnier aus deiner zentralen Turnierliste angezeigt.`;
}
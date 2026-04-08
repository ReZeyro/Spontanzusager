const homeTournamentStatus = document.getElementById("homeTournamentStatus");
const homeTournamentTitle = document.getElementById("homeTournamentTitle");
const homeTournamentLocation = document.getElementById("homeTournamentLocation");
const homeTournamentDate = document.getElementById("homeTournamentDate");
const homeTournamentState = document.getElementById("homeTournamentState");
const homeTournamentText = document.getElementById("homeTournamentText");

const homeStatTournaments = document.getElementById("homeStatTournaments");
const homeStatPodiums = document.getElementById("homeStatPodiums");

const homeTeamTitle = document.getElementById("homeTeamTitle");
const homeTeamText = document.getElementById("homeTeamText");
const homeTeamExtra = document.getElementById("homeTeamExtra");

const homeBannerTitle = document.getElementById("homeBannerTitle");
const homeBannerText = document.getElementById("homeBannerText");

function parseGermanDate(dateString) {
    const [day, month, year] = dateString.split(".");
    return new Date(`${year}-${month}-${day}T00:00:00`);
}

if (
    typeof tournaments !== "undefined" &&
    tournaments.length > 0 &&
    homeTournamentTitle
) {
    const nextActiveTournament = [...tournaments]
        .filter((tournament) => !tournament.finished)
        .sort((a, b) => parseGermanDate(a.date) - parseGermanDate(b.date))[0];

    if (nextActiveTournament) {
        homeTournamentStatus.textContent = nextActiveTournament.status;
        homeTournamentTitle.textContent = nextActiveTournament.title;
        homeTournamentLocation.textContent = `Ort: ${nextActiveTournament.location}`;
        homeTournamentDate.textContent = `Datum: ${nextActiveTournament.date}`;
        homeTournamentState.textContent = `Status: ${nextActiveTournament.statusDetail}`;
        homeTournamentText.textContent = "Hier wird automatisch das nächste aktive Turnier nach Datum angezeigt.";
    } else {
        homeTournamentStatus.textContent = "Kein aktives Turnier";
        homeTournamentTitle.textContent = "Aktuell nichts offen";
        homeTournamentLocation.textContent = "Ort: –";
        homeTournamentDate.textContent = "Datum: –";
        homeTournamentState.textContent = "Status: Alle Turniere abgeschlossen";
        homeTournamentText.textContent = "Sobald ein neues aktives Turnier eingetragen ist, erscheint es hier automatisch.";
    }
}

if (
    typeof tournaments !== "undefined" &&
    homeStatTournaments &&
    homeStatPodiums
) {
    const finishedTournaments = tournaments.filter((t) => t.finished);
    const podiums = finishedTournaments.filter(
        (t) => t.placement === 1 || t.placement === 2 || t.placement === 3
    ).length;

    homeStatTournaments.textContent = finishedTournaments.length;
    homeStatPodiums.textContent = podiums;
}

if (
    typeof players !== "undefined" &&
    typeof teamInfo !== "undefined" &&
    homeTeamTitle &&
    homeTeamText &&
    homeTeamExtra
) {
    const playerCount = players.length;
    const jerseyPreview = players.slice(0, 3).map((player) => player.jerseyName).join(", ");

    homeTeamTitle.textContent = "Wer wir sind";
    homeTeamText.textContent = teamInfo.aboutText;
    homeTeamExtra.textContent = `${playerCount} Spieler im Team · z. B. ${jerseyPreview}`;
}

if (
    typeof teamInfo !== "undefined" &&
    homeBannerTitle &&
    homeBannerText
) {
    homeBannerTitle.textContent = teamInfo.bannerTitle;
    homeBannerText.textContent = teamInfo.bannerText;
}
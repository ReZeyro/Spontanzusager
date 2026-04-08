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

if (
    typeof tournaments !== "undefined" &&
    tournaments.length > 0 &&
    homeTournamentTitle
) {
    const sortedTournaments = [...tournaments].sort((a, b) => a.finished - b.finished);
    const nextTournament = sortedTournaments[0];

    homeTournamentStatus.textContent = nextTournament.status;
    homeTournamentTitle.textContent = nextTournament.title;
    homeTournamentLocation.textContent = `Ort: ${nextTournament.location}`;
    homeTournamentDate.textContent = `Datum: ${nextTournament.date}`;
    homeTournamentState.textContent = `Status: ${nextTournament.statusDetail}`;
    homeTournamentText.textContent = nextTournament.finished
        ? "Dieses Turnier ist abgeschlossen."
        : "Hier wird automatisch das nächste aktive Turnier aus deiner zentralen Turnierliste angezeigt.";
}

if (
    typeof tournaments !== "undefined" &&
    homeStatTournaments &&
    homeStatPodiums
) {
    const finishedTournaments = tournaments.filter(t => t.finished);
    const podiums = finishedTournaments.filter(
        t => t.placement === 1 || t.placement === 2 || t.placement === 3
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
    const jerseyPreview = players.slice(0, 3).map(player => player.jerseyName).join(", ");

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
const defaultTournaments = [
    {
        id: 1,
        title: "Ofterdingen",
        date: "14.05.2026",
        location: "Ofterdingen",
        statusDetail: "angemeldet",
        finished: false,
        placement: null
    },
    {
        id: 2,
        title: "Stetten",
        date: "22.05.2026",
        location: "Stetten",
        statusDetail: "angemeldet",
        finished: false,
        placement: null
    },

];

const savedTournamentMeta = JSON.parse(localStorage.getItem("tournamentMeta") || "{}");

const tournaments = defaultTournaments.map((tournament) => {
    const saved = savedTournamentMeta[tournament.id];

    if (!saved) return { ...tournament };

    return {
        ...tournament,
        finished: saved.finished ?? tournament.finished,
        placement: saved.placement ?? tournament.placement
    };
});

function saveTournamentMeta() {
    const meta = {};

    tournaments.forEach((tournament) => {
        meta[tournament.id] = {
            finished: tournament.finished,
            placement: tournament.placement
        };
    });

    localStorage.setItem("tournamentMeta", JSON.stringify(meta));
}
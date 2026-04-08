const defaultTournaments = [
    {
        id: "sommer-cup-moessingen",
        title: "Sommer Cup Mössingen",
        date: "12.07.2026",
        location: "Mössingen",
        statusDetail: "Anmeldung offen",
        finished: false,
        placement: null
    },
    {
        id: "dorfpokal-belsen",
        title: "Dorfpokal Belsen",
        date: "26.07.2026",
        location: "Belsen",
        statusDetail: "Team wird gesammelt",
        finished: false,
        placement: null
    },
    {
        id: "nachtturnier-rottenburg",
        title: "Nachtturnier Rottenburg",
        date: "09.08.2026",
        location: "Rottenburg",
        statusDetail: "Rückmeldungen laufen",
        finished: false,
        placement: null
    }
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
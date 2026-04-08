const turnierListContainer = document.getElementById("turnierList");
const showMoreWrap = document.getElementById("turnierMoreWrap");

if (turnierListContainer && typeof tournaments !== "undefined") {
    turnierListContainer.innerHTML = tournaments.map((tournament, index) => {
        const isHidden = index >= 3 ? "hidden-turnier" : "visible";
        const number = index + 1;

        return `
            <article class="turnier-item ${isHidden}" data-tournament-id="${tournament.id}">
                <button class="turnier-toggle" type="button">
                    <div class="turnier-main">
                        <div>
                            <p class="turnier-status">${tournament.status}</p>
                            <h3>${tournament.title}</h3>
                        </div>
                        <div class="turnier-meta">
                            <span>${tournament.date}</span>
                            <span>${tournament.location}</span>
                        </div>
                    </div>
                    <span class="turnier-arrow">⌄</span>
                </button>

                <div class="turnier-content">
                    <div class="turnier-info-grid">
                        <div>
                            <h4>Infos</h4>
                            <p><strong>Datum:</strong> ${tournament.date}</p>
                            <p><strong>Ort:</strong> ${tournament.location}</p>
                            <p><strong>Status:</strong> ${tournament.statusDetail}</p>
                        </div>

                        <div>
                            <h4>Bereits dabei</h4>
                            <ul class="teilnehmer-liste" data-list>
                                <li><span>Lädt...</span><span>...</span></li>
                            </ul>
                        </div>
                    </div>

                    <form class="turnier-form" data-form>
                        <h4>Für dieses Turnier eintragen</h4>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="name${number}">Name</label>
                                <input type="text" id="name${number}" name="name" placeholder="Dein Name" required>
                            </div>

                            <div class="form-group">
                                <label for="position${number}">Position</label>
                                <select id="position${number}" name="position" required>
                                    <option value="">Bitte wählen</option>
                                    <option value="Torwart">Torwart</option>
                                    <option value="Schütze">Schütze</option>
                                    <option value="Torwart & Schütze">Torwart &amp; Schütze</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary">Eintragen</button>
                    </form>
                </div>
            </article>
        `;
    }).join("");

    if (showMoreWrap) {
        if (tournaments.length <= 3) {
            showMoreWrap.innerHTML = "";
        } else {
            showMoreWrap.innerHTML = `
                <button id="showMoreBtn" class="show-more-btn" type="button">
                    Weitere Turniere anzeigen ⌄
                </button>
            `;

            const showMoreBtn = document.getElementById("showMoreBtn");
            const hiddenTurniere = document.querySelectorAll(".hidden-turnier");

            showMoreBtn.addEventListener("click", () => {
                hiddenTurniere.forEach((turnier) => {
                    turnier.classList.toggle("show");
                });

                const anyHiddenStillClosed = [...hiddenTurniere].some(
                    (turnier) => !turnier.classList.contains("show")
                );

                showMoreBtn.textContent = anyHiddenStillClosed
                    ? "Weitere Turniere anzeigen ⌄"
                    : "Weniger anzeigen ⌃";
            });
        }
    }
}
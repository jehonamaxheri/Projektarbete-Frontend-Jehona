/* API-nyckel till OMDb (används för att hämta filmdata) */
const OMDB_KEY = "f5c2fc99";

/* Hämtar element från HTML för att kunna visa filmer och hantera sökning */
const movieList = document.getElementById("movieList");  /* Behållaren där alla filmkort ska visas */
const searchInput = document.getElementById("searchInput");  /* Sökfältet där användaren skriver text */
const searchBtn = document.getElementById("searchBtn");    /* Sök-knappen som startar sökningen */

/* Aktiverar/inaktiverar sök-knappen beroende på om inputfältet är tomt */
searchInput.addEventListener("input", () => {
  searchBtn.disabled = searchInput.value.trim() === "";
});

/* Kör sökning när man klickar på knappen */
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query !== "") searchMovies(query);
});

/* Kör sökning när man trycker Enter */
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !searchBtn.disabled) {
    searchMovies(searchInput.value.trim());
  }
});


/* Funktion som ger en giltig poster-bild eller ersättningsbild.
   (Används på flera ställen för att undvika upprepad kod.)*/

function getPoster(movie) {
  return movie.Poster !== "N/A"
    ? movie.Poster
    : "https://via.placeholder.com/300x450?text=No+Image";
}

/* Sökfunktion – hämtar resultat från OMDb API baserat på sökord */

async function searchMovies(query) {
  movieList.innerHTML = "";
  setMessage("Searching...");

  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${query}`;
    const response = await fetch(url);
    const data = await response.json();

    /* Om filmer hittas hämtas mer beskrivning för varje film */
    if (data.Response === "True") {
      const details = await Promise.all(
        data.Search.map(movie => fetchMovieDetails(movie.imdbID))
      );
      setMessage("");
      displayMovies(details); /* Visar alla filmer */
    } else {
      setMessage("No movies found", true); /* Visas om API inte hittar något */
    }
  } catch (err) { /* Visas vid nätverksfel */
    setMessage("Error fetching movies", true);
    console.error(err);
  }
}

/* Hämtar detaljer för en specifik film via IMDb-ID (t.ex. handling, betyg osv.) */
async function fetchMovieDetails(imdbID) {
  const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbID}`);
  return await response.json();
}

/* Visar filmerna som kort i rutnätet */
function displayMovies(movies) {
  movieList.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card"); /* Lägger till styling via CSS */

    /* Om affisch saknas → använd en placeholder-bild */
    const poster = getPoster(movie);

    /* HTML-innehållet för filmkortet */
    card.innerHTML = `
      <img class="poster" src="${poster}" alt="Poster för ${movie.Title}" loading="lazy">
      <div class="card-body">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <span class="rating-badge">⭐ ${movie.imdbRating}</span>
      </div>
    `;

    card.addEventListener("click", () => openModal(movie)); /* Öppnar modal med detaljer när man klickar på kortet */
    movieList.appendChild(card);  /* Lägger till kortet i listan */
  });
}

/* Visar meddelanden i filmområdet, t.ex. "No results", "Searching..."*/
function setMessage(msg, isError = false) {
  movieList.innerHTML = `<p style="text-align:center; color:${isError ? 'red':'white'}">${msg}</p>`;
}

/* Öppnar popup-ruta (modal) med mer information om filmen */
function openModal(movie) {
  /* Återanvänder samma poster-funktion här också */
  const poster = getPoster(movie);

  const modalHTML = `
    <div class="modal-bg" id="modalBg">
      <div class="modal" tabindex="0">
        <img class="modal-poster" src="${poster}" alt="Poster för ${movie.Title}">
        <div>
          <h2>${movie.Title}</h2>
          <p><strong>Year:</strong> ${movie.Year}</p>
          <p><strong>Rating:</strong> ⭐ ${movie.imdbRating}</p>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Plot:</strong> ${movie.Plot}</p>
          <button class="close-btn" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  /* Lägger till modalen i slutet av <body> */
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  /* Gör så att Escape stänger modalen */
  document.addEventListener("keydown", escCloseModal);
}

/* Stänger modalen och tar bort den från dokumentet */
function closeModal() {
  const bg = document.getElementById("modalBg");
  if (bg) bg.remove();
  document.removeEventListener("keydown", escCloseModal);
}

/*  Gör så att användaren kan stänga modalen med Escape-knappen.*/
function escCloseModal(e) {
  if (e.key === "Escape") closeModal();
}


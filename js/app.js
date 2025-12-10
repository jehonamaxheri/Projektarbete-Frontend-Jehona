/* Denna app låter användaren söka efter filmer via OMDb API och visa resultaten på ett snyggt rutnät med filmkort.

Vad jag har gjort och varför:
1. Sökfunktion:
   - Lyssnar på inputfältet och aktiverar sökknappen endast när något skrivs.
   - Gör så att Enter-tangenten också startar sökningen.
   - Detta gör användarupplevelsen bättre och förhindrar tomma sökningar.

2. API-anrop (fetch):
   - Hämtar filmdata från OMDb med API-nyckel.
   - Hämtar både grunddata (titel, år, poster) och detaljer (genre, plot, betyg).
   - Jag använder async/await för att hantera asynkrona anrop.
   - Jag har lagt till felhantering för att visa meddelande om något går fel.

3. Dynamisk visning av filmer:
   - Skapar HTML-kort för varje film med poster, titel, år och IMDb-betyg.
   - Klick på kort öppnar en modal med mer detaljerad information.
   - Jag har lagt till hover-effekter och små animationer för bättre användarupplevelse.

4. Modal (popup-ruta):
   - Visar filmens detaljer när man klickar på kortet.
   - Kan stängas genom att klicka på knappen eller trycka ESC.
   - Jag har lagt till overlay (bakgrund) och enkel fade-animation.

5. Snöanimation:
   - Ett canvas-element med animerad snö över hela sidan.
   - Visas när inga filmer är sökta för att göra sidan mer levande.
   - Jag har skapat egna snöflingor med slumpmässig position och rörelse.

6. Enkel och tydlig struktur:
   - All HTML, CSS och JS är uppdelad i logiska sektioner.
   - Kommentarer förklarar varför varje del finns och vad den gör.
   - Responsiv design är inkluderad så sidan fungerar även på mobil.

Syftet med dessa lösningar är att:
- Visa att jag kan använda fetch för att hämta data från ett API.
- Dynamiskt visa resultat på sidan.
- Skapa interaktivitet med modaler och hover-effekter.
- Göra sidan användarvänlig, estetiskt tilltalande och responsiv.

*/

/* Min OMBD API - nyckel */
const OMDB_KEY = "f5c2fc99";

const movieList = document.getElementById("movieList"); // Där filmerna ska visas
const searchInput = document.getElementById("searchInput"); // Sökfältet
const searchBtn = document.getElementById("searchBtn");   // Sök-knappen

// Aktivera/avaktivera sökknappen beroende på om inputfältet är tomt
searchInput.addEventListener("input", () => {
  searchBtn.disabled = searchInput.value.trim() === "";

  // Om inget skrivs och inga filmer finns visas snö
  if (searchBtn.disabled && movieList.children.length === 0) {
    toggleSnow(true);
  }
});

// När man klickar på sök-knappen
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query !== "") searchMovies(query);
});

// När man trycker Enter i sökfältet
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !searchBtn.disabled) {
    searchMovies(searchInput.value.trim());
  }
});

// Körs när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
  toggleSnow(true);
});


//(Hjälpfunktion) Returnerar filmens poster, eller en placeholder om ingen bild finns
function getPoster(movie) {
  return movie.Poster !== "N/A"
    ? movie.Poster
    : "https://via.placeholder.com/300x450?text=No+Image";
}
// HUVUDFUNKTION FÖR ATT SÖKA FILMER
async function searchMovies(query) {
  toggleSnow(false);
  movieList.innerHTML = "";
  setMessage("Searching...");
  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === "True") {
      // Hämta detaljer för varje film
      const details = await Promise.all(
        data.Search.map(movie => fetchMovieDetails(movie.imdbID))
      );
      setMessage("");   // Ta bort meddelande
      displayMovies(details); // Visa filmer på sidan
    } else {
      setMessage("No movies found", true);
      toggleSnow(true);
    }
  } catch (err) {
    setMessage("Error fetching movies", true);
    console.error(err);
    toggleSnow(true);
  }
}

async function fetchMovieDetails(imdbID) {
  const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbID}`);
  return await response.json();
}
// HÄMTA FILMDETALJER
function displayMovies(movies) {
  movieList.innerHTML = "";
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    const poster = getPoster(movie);
    card.innerHTML = `
      <img class="poster" src="${poster}" alt="Poster för ${movie.Title}" loading="lazy">
      <div class="card-body">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <span class="rating-badge">⭐ ${movie.imdbRating}</span>
      </div>
    `;
    // När man klickar på ett kort öppnas modalen
    card.addEventListener("click", () => openModal(movie));
    movieList.appendChild(card);
  });
}

function setMessage(msg, isError = false) {
  movieList.innerHTML = `<p style="text-align:center; color:${isError ? 'red':'white'}">${msg}</p>`;
}

function openModal(movie) {
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
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.addEventListener("keydown", escCloseModal);
}

function closeModal() {
  const bg = document.getElementById("modalBg");
  if (bg) bg.remove();
  document.removeEventListener("keydown", escCloseModal);
}

function escCloseModal(e) {
  if (e.key === "Escape") closeModal();
}

// SNÖ
function toggleSnow(show) {
  const canvas = document.getElementById('snowCanvas');
  canvas.style.display = show ? 'block' : 'none';
}

(function () {
  const canvas = document.getElementById('snowCanvas');
  if (!canvas || !document.body.classList.contains('snow-page')) return;

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const flakes = [];
  const numFlakes = 120;

  // Skapar alla snöflingor med slumpmässiga positioner
  for (let i = 0; i < numFlakes; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 1,
      speed: Math.random() * 1.5 + 0.5,
      angle: Math.random() * Math.PI * 2,
      swing: Math.random() * 1.5
    });
  }

  function drawFlakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    for (let f of flakes) {
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    }
    ctx.fill();
    updateFlakes();
    requestAnimationFrame(drawFlakes);
  }

  function updateFlakes() {
    for (let f of flakes) {
      f.y += f.speed;
      f.x += Math.sin(f.angle) * f.swing;
      f.angle += 0.01;
      if (f.y > canvas.height) {
        f.y = 0;
        f.x = Math.random() * canvas.width;
        f.angle = Math.random() * Math.PI * 2;
      }
      if (f.x > canvas.width) f.x = 0;
      if (f.x < 0) f.x = canvas.width;
    }
  }

  drawFlakes();
})();


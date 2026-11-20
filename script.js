
// =====================================
// MUTHIN PUKAL - MAIN SCRIPT
// =====================================

const SUPABASE_URL = "https://bnvmdtpplavypgzvpaga.supabase.co";
const SUPABASE_KEY = "sb_publishable_iX79SzzZ0dW-Kd1VUYthaA_mSfWuYX8";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let selectedCategory = null;
let showOnlyFavourites = false;


// =====================================
// FAVOURITE STORAGE
// =====================================

function getFavourites() {
    try {
        return JSON.parse(localStorage.getItem("muthinFavourites")) || [];
    } catch (error) {
        return [];
    }
}

function saveFavourites(favourites) {
    localStorage.setItem("muthinFavourites", JSON.stringify(favourites));
}

function getSongKey(card) {
    return (
        (card.dataset.category || "") +
        "::" +
        (card.querySelector("h3")?.innerText || "").trim()
    );
}

function toggleFavourite(button) {
    const card = button.closest(".song-card");
    if (!card) return;

    const key = getSongKey(card);
    let favourites = getFavourites();

    if (favourites.includes(key)) {
        favourites = favourites.filter(item => item !== key);
    } else {
        favourites.push(key);
    }

    saveFavourites(favourites);
    updateFavouriteIcon(card);
    searchSongs();
}

function updateFavouriteIcon(card) {
    const button = card.querySelector(".mp-favourite-btn");
    if (!button) return;

    const saved = getFavourites().includes(getSongKey(card));

    button.innerHTML = saved
        ? '<i class="fa-solid fa-heart"></i> Favourite'
        : '<i class="fa-regular fa-heart"></i> Favourite';
}


// =====================================
// SONG ACTION BUTTONS
// =====================================

function addSongActions(card) {
    if (card.dataset.actionsAdded === "true") return;

    card.dataset.actionsAdded = "true";

    const toolbar = document.createElement("div");
    toolbar.className = "mp-song-actions";

    // Favourite
    const favouriteButton = document.createElement("button");
    favouriteButton.className = "mp-action-btn mp-favourite-btn";

    favouriteButton.onclick = function () {
        toggleFavourite(this);
    };

    toolbar.appendChild(favouriteButton);
    updateFavouriteIcon(card);

    // Save PDF
    const pdfButton = document.createElement("button");
    pdfButton.className = "mp-action-btn";
    pdfButton.innerHTML =
        '<i class="fa-regular fa-file-pdf"></i> Save PDF';

    pdfButton.onclick = function () {
        saveSongPDF(card);
    };

    toolbar.appendChild(pdfButton);

    // Share
    const shareButton = document.createElement("button");
    shareButton.className = "mp-action-btn";
    shareButton.innerHTML =
        '<i class="fa-solid fa-share-nodes"></i> Share';

    shareButton.onclick = function () {
        shareSong(card);
    };

    toolbar.appendChild(shareButton);

    // Copy Lyrics
    const copyButton = document.createElement("button");
    copyButton.className = "mp-action-btn";
    copyButton.innerHTML =
        '<i class="fa-regular fa-copy"></i> Copy Lyrics';

    copyButton.onclick = function () {
        copyLyrics(this);
    };

    toolbar.appendChild(copyButton);

    card.appendChild(toolbar);
}


// =====================================
// ENHANCE ALL SONG CARDS
// =====================================

function enhanceSongCards() {
    document.querySelectorAll(".song-card").forEach(card => {
        addSongActions(card);
    });
}


// =====================================
// CATEGORY FILTER
// =====================================

function filterCategory(category) {
    selectedCategory = category;

    document.querySelectorAll(".categories button").forEach(button => {
        button.classList.remove("active");

        if (
            button.getAttribute("onclick") ===
            `filterCategory('${category}')`
        ) {
            button.classList.add("active");
        }
    });

    const songsSection = document.querySelector(".songs");

    if (songsSection) {
        songsSection.style.display = "block";
    }

    const songList = document.getElementById("song-list");

    if (songList) {
        songList.classList.add("show");
    }

    searchSongs();

    const songs = document.getElementById("songs");

    if (songs) {
        songs.scrollIntoView({ behavior: "smooth" });
    }
}


// =====================================
// SEARCH AND FAVOURITE FILTER
// =====================================

function searchSongs() {
    const searchInput = document.getElementById("search");

    const searchValue = searchInput
        ? searchInput.value.toLowerCase()
        : "";

    const favourites = getFavourites();

    document.querySelectorAll("#song-list .song-card").forEach(song => {
        const categoryMatch =
            selectedCategory === null ||
            selectedCategory === "all" ||
            song.dataset.category === selectedCategory;

        const searchMatch =
            song.textContent.toLowerCase().includes(searchValue);

        const favouriteMatch =
            !showOnlyFavourites ||
            favourites.includes(getSongKey(song));

        song.style.display =
            categoryMatch && searchMatch && favouriteMatch
                ? "block"
                : "none";
    });
}


// =====================================
// FAVOURITE FILTER BUTTON
// =====================================

function setupFavouriteFilter() {
    const search = document.getElementById("search");

    if (!search || document.getElementById("mp-favourite-filter")) {
        return;
    }

    const button = document.createElement("button");

    button.id = "mp-favourite-filter";
    button.innerHTML =
        '<i class="fa-solid fa-heart"></i> Show Favourite Songs';

    button.style.display = "block";
    button.style.margin = "0 auto 25px";
    button.style.padding = "12px 22px";
    button.style.borderRadius = "25px";
    button.style.border = "1px solid #d4af37";
    button.style.background = "#073d30";
    button.style.color = "white";
    button.style.cursor = "pointer";

    button.onclick = function () {
        showOnlyFavourites = !showOnlyFavourites;

        button.innerHTML = showOnlyFavourites
            ? '<i class="fa-solid fa-music"></i> Show All Songs'
            : '<i class="fa-solid fa-heart"></i> Show Favourite Songs';

        searchSongs();
    };

    search.insertAdjacentElement("afterend", button);
}


// =====================================
// SHOW LYRICS
// =====================================

function showLyrics(button, language) {
    const card = button.closest(".song-card");

    if (!card) return;

    card.querySelectorAll(".lyrics-content").forEach(item => {
        item.style.display = "none";
    });

    const selectedLyrics = card.querySelector(
        ".lyrics-content." + language
    );

    if (selectedLyrics) {
        selectedLyrics.style.display = "block";
    }
}


// =====================================
// COPY LYRICS
// =====================================

async function copyLyrics(button) {
    const card = button.closest(".song-card");

    if (!card) return;

    const visibleLyrics = [
        ...card.querySelectorAll(".lyrics-content")
    ].find(item => getComputedStyle(item).display !== "none");

    if (!visibleLyrics) {
        alert("Please select a lyrics language first.");
        return;
    }

    try {
        await navigator.clipboard.writeText(visibleLyrics.innerText);

        const oldHTML = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';

        setTimeout(() => {
            button.innerHTML = oldHTML;
        }, 2000);

    } catch (error) {
        alert("Copy failed. Please try again.");
    }
}


// =====================================
// SAVE SONG AS PREMIUM PDF
// =====================================

function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


function saveSongPDF(card) {

    const title =
        card.querySelector("h3")?.innerText || "Song";

    const visibleLyrics = [
        ...card.querySelectorAll(".lyrics-content")
    ].find(item => getComputedStyle(item).display !== "none");

    if (!visibleLyrics) {
        alert("Please select a lyrics language first.");
        return;
    }

    const lyrics = visibleLyrics.innerText;

    const language = [
        "malayalam",
        "kannada",
        "arabic",
        "urdu"
    ].find(lang => visibleLyrics.classList.contains(lang))
        || "malayalam";

    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
        alert("Please allow pop-ups in your browser.");
        return;
    }

    // Language-specific fonts
    const fontSettings = {
        malayalam: {
            family: "'Anek Malayalam', sans-serif",
            size: "23px",
            line: "2.1",
            direction: "ltr"
        },

        kannada: {
            family: "'Noto Sans Kannada', sans-serif",
            size: "22px",
            line: "2.1",
            direction: "ltr"
        },

        arabic: {
            family: "'Amiri', serif",
            size: "30px",
            line: "2.4",
            direction: "rtl"
        },

        urdu: {
            family: "'Noto Nastaliq Urdu', serif",
            size: "28px",
            line: "2.7",
            direction: "rtl"
        }
    };

    const font = fontSettings[language];

    const googleFonts = `
        <link href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@400;500;600;700&family=Amiri:wght@400;700&family=Noto+Sans+Kannada:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
    `;

    pdfWindow.document.open();

    pdfWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ml">

        <head>

            <meta charset="UTF-8">

            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">

            <title>${escapeHTML(title)} - Muthin Pukal</title>

            ${googleFonts}

            <style>

                * {
                    box-sizing: border-box;
                }

                @page {
                    size: A4;
                    margin: 18mm;
                }

                html, body {
                    margin: 0;
                    padding: 0;
                    background: white;
                }

                body {
                    color: #173e2e;
                    font-family: 'Anek Malayalam', sans-serif;
                    position: relative;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                /* WATERMARK */

                .watermark {
                    position: fixed;
                    top: 42%;
                    left: 0;
                    width: 100%;
                    text-align: center;

                    font-family: 'Anek Malayalam', sans-serif;
                    font-size: 65px;
                    font-weight: 700;

                    color: #b99a4b;
                    opacity: 0.11;

                    transform: rotate(-30deg);

                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 0;
                }

                /* MAIN CONTENT */

                .content {
                    position: relative;
                    z-index: 1;
                }

                /* HEADER */

                .pdf-header {
                    text-align: center;
                    padding-bottom: 18px;
                    border-bottom: 2px solid #c5a45d;
                    margin-bottom: 30px;
                }

                .brand {
                    font-family: 'Anek Malayalam', sans-serif;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #987b3e;
                    margin-bottom: 12px;
                }

                h1 {
                    color: #07513b;
                    font-family: 'Anek Malayalam', sans-serif;
                    font-size: 30px;
                    font-weight: 700;
                    margin: 0;
                    line-height: 1.7;
                }

                .arabic-subtitle {
                    font-family: 'Amiri', serif;
                    font-size: 22px;
                    color: #a18343;
                    margin-top: 8px;
                }

                /* LYRICS */

                .lyrics {
                    color: #173e2e;
                    font-family: ${font.family};
                    font-size: ${font.size};
                    line-height: ${font.line};
                    direction: ${font.direction};
                    text-align: ${language === "arabic" || language === "urdu" ? "right" : "left"};

                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                    word-break: normal;

                    margin-top: 25px;
                }

                /* FOOTER */

                .footer {
                    margin-top: 45px;
                    padding-top: 15px;
                    border-top: 1px solid #d4af37;

                    text-align: center;
                    color: #987b3e;

                    font-family: 'Anek Malayalam', sans-serif;
                    font-size: 13px;
                    line-height: 2;
                }

                .footer-brand {
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #07513b;
                }

                /* PRINT SETTINGS */

                @media print {

                    body {
                        background: white;
                    }

                    .watermark {
                        position: fixed;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .content {
                        position: relative;
                    }

                }

            </style>

        </head>

        <body>

            <div class="watermark">
                മുത്തിൻ പുകൾ
            </div>

            <div class="content">

                <header class="pdf-header">

                    <div class="brand">
                        MUTHIN PUKAL
                    </div>

                    <h1>${escapeHTML(title)}</h1>

                    <div class="arabic-subtitle">
                        مَدْحُ خَيْرِ الْأَنَامِ
                    </div>

                </header>

                <main>

                    <div class="lyrics">${escapeHTML(lyrics)}</div>

                </main>

                <footer class="footer">

                    <div class="footer-brand">
                        മുത്തിൻ പുകൾ
                    </div>

                    Knowledge • Faith • Guidance

                    <br>

                    https://muthin-pukal.vercel.app/

                </footer>

            </div>

            <script>

                window.onload = async function() {

                    try {
                        await document.fonts.ready;
                    } catch (error) {
                        console.log("Font loading issue", error);
                    }

                    setTimeout(function() {
                        window.print();
                    }, 700);

                };

            <\/script>

        </body>

        </html>
    `);

    pdfWindow.document.close();
}


// =====================================
// SHARE SONG
// =====================================

async function shareSong(card) {
    const title = card.querySelector("h3")?.innerText || "Song";

    const visibleLyrics = [
        ...card.querySelectorAll(".lyrics-content")
    ].find(item => getComputedStyle(item).display !== "none");

    const lyrics = visibleLyrics ? visibleLyrics.innerText : "";

    const shareText =
        title + "\n\n" +
        lyrics + "\n\n" +
        "Read more at Muthin Pukal:\n" +
        "https://muthin-pukal.vercel.app/";

    try {
        if (navigator.share) {
            await navigator.share({
                title: title,
                text: shareText,
                url: "https://muthin-pukal.vercel.app/"
            });
        } else {
            await navigator.clipboard.writeText(shareText);
            alert("Song details copied! You can share them now.");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            alert("Sharing was not successful. Please try again.");
        }
    }
}


// =====================================
// MALAYALAM LYRICS
// =====================================

function showMalayalam(button) {
    showLyrics(button, "malayalam");
}


// =====================================
// MALAYALAM TO KANNADA BASIC CONVERSION
// =====================================

function convertToKannada(button) {
    const card = button.closest(".song-card");

    const malayalam = card.querySelector(".lyrics-content.malayalam");
    const kannada = card.querySelector(".lyrics-content.kannada");

    if (!malayalam || !kannada) return;

    const converted = malayalam.innerText
        .replace(/അ/g, "ಅ")
        .replace(/ആ/g, "ಆ")
        .replace(/ഇ/g, "ಇ")
        .replace(/ഈ/g, "ಈ")
        .replace(/ഉ/g, "ಉ")
        .replace(/ഊ/g, "ಊ")
        .replace(/എ/g, "ಎ")
        .replace(/ഏ/g, "ಏ")
        .replace(/ഐ/g, "ಐ")
        .replace(/ഒ/g, "ಒ")
        .replace(/ഓ/g, "ಓ")
        .replace(/ഔ/g, "ಔ")
        .replace(/ക/g, "ಕ")
        .replace(/ഖ/g, "ಖ")
        .replace(/ഗ/g, "ಗ")
        .replace(/ഘ/g, "ಘ")
        .replace(/ങ/g, "ಙ")
        .replace(/ച/g, "ಚ")
        .replace(/ജ/g, "ಜ")
        .replace(/ഞ/g, "ಞ")
        .replace(/ട/g, "ಟ")
        .replace(/ഡ/g, "ಡ")
        .replace(/ണ/g, "ಣ")
        .replace(/ത/g, "ತ")
        .replace(/ദ/g, "ದ")
        .replace(/ന/g, "ನ")
        .replace(/പ/g, "ಪ")
        .replace(/ബ/g, "ಬ")
        .replace(/മ/g, "ಮ")
        .replace(/യ/g, "ಯ")
        .replace(/ര/g, "ರ")
        .replace(/ല/g, "ಲ")
        .replace(/വ/g, "ವ")
        .replace(/ശ/g, "ಶ")
        .replace(/സ/g, "ಸ")
        .replace(/ഹ/g, "ಹ");

    kannada.innerText = converted;
    showLyrics(button, "kannada");
}


// =====================================
// AUTOMATIC SETUP
// =====================================

function setupMuthinPukal() {

    enhanceSongCards();
    setupFavouriteFilter();

    const search = document.getElementById("search");

    if (search) {
        search.addEventListener("input", searchSongs);
    }

    const songList = document.getElementById("song-list");

    if (songList) {

        const observer = new MutationObserver(() => {
            enhanceSongCards();
            searchSongs();
        });

        observer.observe(songList, {
            childList: true,
            subtree: true
        });

    }
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        setupMuthinPukal
    );

} else {

    setupMuthinPukal();

}


// =====================================
// MUTHIN PUKAL SPLASH SCREEN
// =====================================

function hideMPSplash() {

    const splash = document.getElementById("splash");

    if (splash) {

        setTimeout(() => {
            splash.classList.add("hide");
        }, 800);

    }

}

if (document.readyState === "complete") {

    hideMPSplash();

} else {

    window.addEventListener("load", hideMPSplash);

}

// Fallback
setTimeout(hideMPSplash, 5000);

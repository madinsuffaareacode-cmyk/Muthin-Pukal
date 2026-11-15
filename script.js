
// =====================================
// MUTHIN PUKAL - SUPABASE CONNECTION
// =====================================

const SUPABASE_URL = "https://bnvmdtpplavypgzvpaga.supabase.co";

const SUPABASE_KEY = "sb_publishable_iX79SzzZ0dW-Kd1VUYthaA_mSfWuYX8";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Default category
let selectedCategory = null;


// =====================================
// CATEGORY FILTER
// =====================================

function filterCategory(category) {

    selectedCategory = category;

    document.querySelectorAll('.categories button').forEach(button => {

        button.classList.remove('active');

        if (
            button.getAttribute('onclick') ===
            `filterCategory('${category}')`
        ) {
            button.classList.add('active');
        }

    });

    const songsSection = document.querySelector('.songs');

    if (songsSection) {
        songsSection.style.display = 'block';
    }

    document.getElementById('song-list').classList.add('show');

    searchSongs();

    const songs = document.getElementById('songs');

    if (songs) {
        songs.scrollIntoView({ behavior: 'smooth' });
    }
}


// =====================================
// SEARCH SONGS
// =====================================

function searchSongs() {

    const searchInput = document.getElementById('search');

    const searchValue = searchInput
        ? searchInput.value.toLowerCase()
        : '';

    const songs = document.querySelectorAll(
        '#song-list .song-card'
    );

    songs.forEach(song => {

        const categoryMatch =
            selectedCategory === null ||
            selectedCategory === 'all' ||
            song.dataset.category === selectedCategory;

        const searchMatch =
            song.textContent.toLowerCase().includes(searchValue);

        song.style.display =
            categoryMatch && searchMatch ? 'block' : 'none';

    });
}


// =====================================
// SHOW LYRICS
// =====================================

function showLyrics(button, language) {

    const card = button.closest('.song-card');

    card.querySelectorAll('.lyrics-content').forEach(item => {
        item.style.display = 'none';
    });

    const selectedLyrics = card.querySelector(
        '.lyrics-content.' + language
    );

    if (selectedLyrics) {
        selectedLyrics.style.display = 'block';
    }
}


// =====================================
// COPY LYRICS
// =====================================

function copyLyrics(button) {

    const card = button.closest('.song-card');

    const visibleLyrics = [
        ...card.querySelectorAll('.lyrics-content')
    ].find(item => getComputedStyle(item).display !== 'none');

    if (!visibleLyrics) return;

    navigator.clipboard.writeText(visibleLyrics.innerText)
        .then(() => {

            button.innerText = 'Copied!';

            setTimeout(() => {
                button.innerText = 'Copy Lyrics';
            }, 2000);

        })
        .catch(() => {
            button.innerText = 'Copy failed';
        });
}


// =====================================
// MALAYALAM LYRICS
// =====================================

function showMalayalam(button) {
    showLyrics(button, 'malayalam');
}


// =====================================
// MALAYALAM TO KANNADA BASIC CONVERSION
// =====================================

function convertToKannada(button) {

    const card = button.closest('.song-card');

    const malayalam = card.querySelector(
        '.lyrics-content.malayalam'
    );

    const kannada = card.querySelector(
        '.lyrics-content.kannada'
    );

    if (!malayalam || !kannada) return;

    const converted = malayalam.innerText
        .replace(/അ/g, 'ಅ')
        .replace(/ആ/g, 'ಆ')
        .replace(/ഇ/g, 'ಇ')
        .replace(/ഈ/g, 'ಈ')
        .replace(/ഉ/g, 'ಉ')
        .replace(/ഊ/g, 'ಊ')
        .replace(/എ/g, 'ಎ')
        .replace(/ഏ/g, 'ಏ')
        .replace(/ഐ/g, 'ಐ')
        .replace(/ഒ/g, 'ಒ')
        .replace(/ഓ/g, 'ಓ')
        .replace(/ഔ/g, 'ಔ')
        .replace(/ക/g, 'ಕ')
        .replace(/ഖ/g, 'ಖ')
        .replace(/ഗ/g, 'ಗ')
        .replace(/ഘ/g, 'ಘ')
        .replace(/ങ/g, 'ಙ')
        .replace(/ച/g, 'ಚ')
        .replace(/ജ/g, 'ಜ')
        .replace(/ഞ/g, 'ಞ')
        .replace(/ട/g, 'ಟ')
        .replace(/ഡ/g, 'ಡ')
        .replace(/ണ/g, 'ಣ')
        .replace(/ത/g, 'ತ')
        .replace(/ദ/g, 'ದ')
        .replace(/ന/g, 'ನ')
        .replace(/പ/g, 'ಪ')
        .replace(/ബ/g, 'ಬ')
        .replace(/മ/g, 'ಮ')
        .replace(/യ/g, 'ಯ')
        .replace(/ര/g, 'ರ')
        .replace(/ല/g, 'ಲ')
        .replace(/വ/g, 'ವ')
        .replace(/ശ/g, 'ಶ')
        .replace(/സ/g, 'ಸ')
        .replace(/ഹ/g, 'ಹ');

    kannada.innerText = converted;

    showLyrics(button, 'kannada');
}

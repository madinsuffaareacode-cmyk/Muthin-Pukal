
const DB_URL = "https://bnvmdtpplavypgzvpaga.supabase.co";
const DB_KEY = "sb_publishable_iX79SzzZ0dW-Kd1VUYthaA_mSfWuYX8";

const db = window.supabase.createClient(DB_URL, DB_KEY);

const defaultCategories = [
    "malayalam", "kannada", "urdu", "mappila",
    "ap-usthad", "sufi", "arabic", "others"
];

// CREATE CUSTOM CATEGORY BUTTON
function createDynamicCategory(category) {
    const container = document.getElementById("dynamic-categories");

    if (!container || !category) return;
    if (defaultCategories.includes(category)) return;

    const existingButtons = container.querySelectorAll("button[data-category]");

    for (const existing of existingButtons) {
        if (existing.dataset.category === category) return;
    }

    let savedCategories = [];

    try {
        savedCategories = JSON.parse(
            localStorage.getItem("muthinPukalCategories") || "[]"
        );
    } catch (error) {
        savedCategories = [];
    }

    const saved = savedCategories.find(item => item.value === category);

    const categoryName = saved
        ? saved.label
        : category.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());

    const button = document.createElement("button");
    button.className = "category-card dynamic-category-card";
    button.dataset.category = category;

    const icon = document.createElement("span");
    icon.className = "category-icon";
    icon.textContent = "✦";

    const name = document.createElement("span");
    name.textContent = categoryName;

    button.appendChild(icon);
    button.appendChild(name);

    button.addEventListener("click", function () {
        if (typeof filterCategory === "function") {
            filterCategory(category);
        }
    });

    container.appendChild(button);
}


// LOAD SONGS
async function loadDatabaseSongs() {
    const songList = document.getElementById("song-list");

    if (!songList) return;

    try {
        const { data, error } = await db
            .from("songs")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("SUPABASE SONG ERROR:", error.message);
            songList.innerHTML = "<p>Unable to load songs. Please try again.</p>";
            return;
        }

        songList.innerHTML = "";

        if (!data || data.length === 0) {
            songList.innerHTML = "<p>No songs available yet.</p>";
            return;
        }

        // CREATE CUSTOM CATEGORIES
        const categories = [...new Set(
            data.map(song => song.category).filter(Boolean)
        )];

        categories.forEach(createDynamicCategory);

        // DISPLAY SONG CARDS
        data.forEach(song => {
            const card = document.createElement("div");
            card.className = "song-card";
            card.dataset.category = song.category || "";

            const preview = document.createElement("div");
            preview.className = "mp-song-preview";

            const videoId = song.youtube_url
                ? getYouTubeId(song.youtube_url)
                : null;

            // THUMBNAIL
            if (videoId) {
                const image = document.createElement("img");

                image.className = "mp-song-thumbnail";
                image.src = "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";
                image.alt = song.title || "Song";
                image.loading = "lazy";

                preview.appendChild(image);
            } else {
                const placeholder = document.createElement("div");

                placeholder.className = "mp-song-placeholder";
                placeholder.innerHTML = '<i class="fa-solid fa-music"></i>';

                preview.appendChild(placeholder);
            }

            // SONG TITLE
            const title = document.createElement("h3");
            title.className = "mp-song-title";
            title.textContent = song.title || "Untitled Song";

            preview.appendChild(title);

            // OPEN SONG BUTTON
            const openButton = document.createElement("button");
            openButton.className = "mp-open-song";
            openButton.innerHTML =
                '<i class="fa-solid fa-circle-play"></i> Open Song';

            openButton.addEventListener("click", function () {
                window.location.href =
                    "song.html?id=" + encodeURIComponent(song.id);
            });

            preview.appendChild(openButton);
            card.appendChild(preview);

            songList.appendChild(card);
        });

        console.log("Songs loaded successfully:", data.length);

        if (typeof searchSongs === "function") {
            searchSongs();
        }

    } catch (error) {
        console.error("DATABASE ERROR:", error);
        songList.innerHTML = "<p>Something went wrong while loading songs.</p>";
    }
}


// YOUTUBE ID
function getYouTubeId(url) {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.slice(1).split("/")[0];
        }

        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.pathname === "/watch") {
                return parsed.searchParams.get("v");
            }

            const parts = parsed.pathname.split("/");

            if (["embed", "shorts", "live"].includes(parts[1])) {
                return parts[2];
            }
        }
    } catch (error) {
        console.error("Invalid YouTube URL:", url);
    }

    return null;
}


// START
loadDatabaseSongs();

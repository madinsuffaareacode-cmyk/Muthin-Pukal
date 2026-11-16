
const DB_URL = "https://bnvmdtpplavypgzvpaga.supabase.co";
const DB_KEY = "sb_publishable_iX79SzzZ0dW-Kd1VUYthaA_mSfWuYX8";

const db = window.supabase.createClient(DB_URL, DB_KEY);

const defaultCategories = [
    "malayalam",
    "kannada",
    "urdu",
    "mappila",
    "ap-usthad",
    "sufi",
    "arabic",
    "others"
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

    if (!songList) {
        console.log("Song list element not found.");
        return;
    }

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

        // DISPLAY SONGS
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

            // TITLE
            const title = document.createElement("h3");
            title.className = "mp-song-title";
            title.textContent = song.title || "Untitled Song";

            preview.appendChild(title);

            // OPEN BUTTON
            const openButton = document.createElement("button");
            openButton.className = "mp-open-song";
            openButton.innerHTML = '<i class="fa-solid fa-circle-play"></i> Open Song';

            preview.appendChild(openButton);
            card.appendChild(preview);

            // SONG DETAILS
            const details = document.createElement("div");
            details.className = "mp-song-details";
            details.hidden = true;

            const categoryText = document.createElement("p");
            categoryText.textContent = "Category: " + (song.category || "Others");
            details.appendChild(categoryText);

            // LYRICS
            const languages = [
                ["malayalam", "മലയാളം", song.lyrics_malayalam],
                ["kannada", "ಕನ್ನಡ", song.lyrics_kannada],
                ["arabic", "العربية", song.lyrics_arabic],
                ["urdu", "اردو", song.lyrics_urdu]
            ];

            const available = languages.filter(
                item => typeof item[2] === "string" && item[2].trim() !== ""
            );

            if (available.length > 0) {
                const tabs = document.createElement("div");
                tabs.className = "lyrics-tabs";

                const lyricsContainer = document.createElement("div");

                available.forEach((item, index) => {
                    const tab = document.createElement("button");
                    tab.textContent = item[1];

                    const panel = document.createElement("div");
                    panel.className = "mp-lyrics-panel";
                    panel.style.display = index === 0 ? "block" : "none";

                    const copyButton = document.createElement("button");
                    copyButton.className = "mp-copy-lyrics";
                    copyButton.innerHTML =
                        '<i class="fa-solid fa-copy"></i> Copy Lyrics';

                    const lyrics = document.createElement("div");
                    lyrics.className = "lyrics-content " + item[0];
                    lyrics.textContent = item[2];
                    lyrics.style.whiteSpace = "pre-wrap";

                    // COPY LYRICS
                    copyButton.addEventListener("click", async function (event) {
                        event.stopPropagation();

                        try {
                            await navigator.clipboard.writeText(item[2]);

                            copyButton.innerHTML =
                                '<i class="fa-solid fa-check"></i> Copied!';

                        } catch (error) {
                            const textarea = document.createElement("textarea");
                            textarea.value = item[2];
                            textarea.style.position = "fixed";
                            textarea.style.opacity = "0";

                            document.body.appendChild(textarea);
                            textarea.select();

                            const copied = document.execCommand("copy");
                            textarea.remove();

                            copyButton.textContent = copied
                                ? "Copied!"
                                : "Copy failed";
                        }

                        setTimeout(() => {
                            copyButton.innerHTML =
                                '<i class="fa-solid fa-copy"></i> Copy Lyrics';
                        }, 2000);
                    });

                    // LANGUAGE TAB
                    tab.addEventListener("click", function (event) {
                        event.stopPropagation();

                        lyricsContainer.querySelectorAll(".mp-lyrics-panel").forEach(
                            element => element.style.display = "none"
                        );

                        panel.style.display = "block";
                    });

                    panel.appendChild(copyButton);
                    panel.appendChild(lyrics);

                    tabs.appendChild(tab);
                    lyricsContainer.appendChild(panel);
                });

                details.appendChild(tabs);
                details.appendChild(lyricsContainer);
            }

            // AUDIO
            if (song.audio_url) {
                const audio = document.createElement("audio");
                audio.controls = true;
                audio.src = song.audio_url;
                audio.style.width = "100%";

                details.appendChild(audio);
            }

            // YOUTUBE VIDEO
            if (videoId) {
                const heading = document.createElement("h4");
                heading.textContent = "Watch Song on YouTube";

                const iframe = document.createElement("iframe");
                iframe.width = "100%";
                iframe.height = "300";
                iframe.src = "https://www.youtube.com/embed/" + videoId;
                iframe.title = song.title || "Song video";
                iframe.allowFullscreen = true;
                iframe.loading = "lazy";

                details.appendChild(heading);
                details.appendChild(iframe);
            }

            card.appendChild(details);

            // OPEN / CLOSE
            openButton.addEventListener("click", function (event) {
                event.stopPropagation();

                details.hidden = !details.hidden;
                card.classList.toggle("is-open", !details.hidden);

                openButton.innerHTML = details.hidden
                    ? '<i class="fa-solid fa-circle-play"></i> Open Song'
                    : '<i class="fa-solid fa-circle-xmark"></i> Close Song';
            });

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

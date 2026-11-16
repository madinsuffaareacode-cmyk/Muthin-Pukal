
const DB_URL = "https://bnvmdtpplavypgzvpaga.supabase.co";
const DB_KEY = "sb_publishable_iX79SzzZ0dW-Kd1VUYthaA_mSfWuYX8";

const db = window.supabase.createClient(DB_URL, DB_KEY);

async function loadDatabaseSongs() {
    const { data, error } = await db
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Song loading error:", error);
        return;
    }

    const songList = document.getElementById("song-list");
    if (!songList) return;



    data.forEach(song => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.dataset.category = song.category;

        // SONG PREVIEW
        const preview = document.createElement("div");
        preview.className = "mp-song-preview";

        const videoId = song.youtube_url
            ? getYouTubeId(song.youtube_url)
            : null;

        if (videoId) {
            const thumbnail = document.createElement("img");
            thumbnail.className = "mp-song-thumbnail";
            thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            thumbnail.alt = song.title + " thumbnail";
            thumbnail.loading = "lazy";

            thumbnail.onerror = function () {
                this.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
            };

            preview.appendChild(thumbnail);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "mp-song-placeholder";
            placeholder.innerHTML = '<i class="fa-solid fa-music"></i>';
            preview.appendChild(placeholder);
        }

        const title = document.createElement("h3");
        title.className = "mp-song-title";
        title.textContent = song.title;
        preview.appendChild(title);

        const openButton = document.createElement("button");
        openButton.className = "mp-open-song";
        openButton.innerHTML = '<i class="fa-solid fa-circle-play"></i> Open Song';
        preview.appendChild(openButton);

        card.appendChild(preview);

        // SONG DETAILS (HIDDEN INITIALLY)
        const details = document.createElement("div");
        details.className = "mp-song-details";
        details.hidden = true;

        const category = document.createElement("p");
        category.textContent = "Category: " + song.category;
        details.appendChild(category);

        // LYRICS LANGUAGES
        const languages = [
            ["malayalam", "മലയാളം", song.lyrics_malayalam],
            ["kannada", "ಕನ್ನಡ", song.lyrics_kannada],
            ["arabic", "العربية", song.lyrics_arabic],
            ["urdu", "اردو", song.lyrics_urdu]
        ];

        const availableLanguages = languages.filter(
            item => item[2] && item[2].trim() !== ""
        );

        if (availableLanguages.length > 0) {
            const tabs = document.createElement("div");
            tabs.className = "lyrics-tabs";

            availableLanguages.forEach((item, index) => {
                const button = document.createElement("button");
                button.textContent = item[1];

                button.onclick = function () {
                    showLyrics(this, item[0]);
                };

                tabs.appendChild(button);

                const lyrics = document.createElement("div");
                lyrics.className = "lyrics-content " + item[0];
                lyrics.textContent = item[2];
                lyrics.style.whiteSpace = "pre-wrap";
                lyrics.style.display = index === 0 ? "block" : "none";

                details.appendChild(lyrics);
            });

            details.insertBefore(tabs, details.firstChild);
        }

        // AUDIO PLAYER
        if (song.audio_url) {
            const audio = document.createElement("audio");
            audio.controls = true;
            audio.src = song.audio_url;
            audio.style.width = "100%";
            details.appendChild(audio);
        }

        // YOUTUBE VIDEO
        if (videoId) {
            const videoSection = document.createElement("div");
            videoSection.className = "youtube-video";

            const heading = document.createElement("h4");
            heading.textContent = "Watch Song on YouTube";

            const iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "300";
            iframe.src = "https://www.youtube.com/embed/" + videoId;
            iframe.title = song.title;
            iframe.allowFullscreen = true;
            iframe.loading = "lazy";

            videoSection.appendChild(heading);
            videoSection.appendChild(iframe);
            details.appendChild(videoSection);
        }

        card.appendChild(details);

        // OPEN / CLOSE SONG
        function toggleSong() {
            details.hidden = !details.hidden;
            card.classList.toggle("is-open", !details.hidden);

            openButton.innerHTML = details.hidden
                ? '<i class="fa-solid fa-circle-play"></i> Open Song'
                : '<i class="fa-solid fa-circle-xmark"></i> Close Song';
        }

        preview.onclick = toggleSong;

        songList.appendChild(card);
    });

    if (typeof searchSongs === "function") {
        searchSongs();
    }
}

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
        return null;
    }

    return null;
}

loadDatabaseSongs();

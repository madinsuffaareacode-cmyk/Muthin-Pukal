
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

        const title = document.createElement("h3");
        title.textContent = song.title;
        card.appendChild(title);

        const category = document.createElement("p");
        category.textContent = "Category: " + song.category;
        card.appendChild(category);

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

                card.appendChild(lyrics);

            });

            card.insertBefore(tabs, card.children[2]);

            const copyButton = document.createElement("button");
            copyButton.className = "copy-btn";
            copyButton.textContent = "Copy Lyrics";
            copyButton.onclick = function () {
                copyLyrics(this);
            };

            card.appendChild(copyButton);
        }

        if (song.audio_url) {

            const audio = document.createElement("audio");
            audio.controls = true;
            audio.src = song.audio_url;
            audio.style.width = "100%";

            card.appendChild(audio);
        }

        if (song.youtube_url) {

            const videoId = getYouTubeId(song.youtube_url);

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

                videoSection.appendChild(heading);
                videoSection.appendChild(iframe);
                card.appendChild(videoSection);
            }
        }

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
            return parsed.pathname.slice(1);
        }

        if (parsed.hostname.includes("youtube.com")) {

            if (parsed.pathname === "/watch") {
                return parsed.searchParams.get("v");
            }

            const parts = parsed.pathname.split("/");

            if (
                ["embed", "shorts", "live"].includes(parts[1])
            ) {
                return parts[2];
            }
        }

    } catch (error) {
        return null;
    }

    return null;
}

loadDatabaseSongs();

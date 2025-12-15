const contentArea  = document.querySelector('.content-area');
const trackTemplate = document.getElementById('recently-played-track-template');
const artistTemplate = document.getElementById('recently-played-artist-template');
const albumTemplate = document.getElementById('recently-played-album-template');
const tracksButton = document.querySelector("button.tracks-setting");
const artistsButton = document.querySelector("button.artists-setting");
const albumsButton = document.querySelector("button.albums-setting");

function formatLocalTime(isoString) {
    const date = new Date(isoString);
    if (date.getFullYear() === new Date().getFullYear()) {
        return date.toLocaleString(undefined, {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}


async function loadRecentlyPlayed() {
    const response = await fetch('https://api.pugking4.dev/stats/recentlyPlayed?limit=10');
    if (!response.ok) {
        console.error('Request failed', response.status);
        return;
    }

    const data = await response.json();   // array of tracks
    console.log(data);
    for (let i = 0; i < data.length; i++) {
        data[i].time_finished = formatLocalTime(data[i].time_finished);
    }
    return data;
}

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function renderTracks(tracks) {
    contentArea.innerHTML = '';

    tracks.forEach(track => {
        const node = trackTemplate.content.cloneNode(true);
        const card = node.querySelector('.recently-played-track-card');

        card.querySelector('.cover').src = track.track.album.cover;
        card.querySelector('.cover').alt = track.track.name;

        card.querySelector('.played-at').textContent =
            `Played on ${track.time_finished}`;
        card.querySelector('.popularity').textContent =
            `Popularity: ${track.current_popularity}`;
        card.querySelector('.album-title').textContent =
            `From ${track.track.album.album_type} ${track.track.album.name}`;
        card.querySelector('.album-artists').textContent =
            `${capitalizeFirstLetter(track.track.album.album_type)} by ${track.track.album.artists.map(x => x.name).join(", ")}`;
        card.querySelector('.context').textContent =
            `Played from ${track.context_type}`;
        card.querySelector('.device').textContent =
            `on ${track.device.name} (${track.device.type})`;

        card.querySelector('.track-title').textContent = track.track.name;
        card.querySelector('.track-artists').textContent =
            track.track.artists.map(x => x.name).join(", ");

        contentArea.appendChild(node);
    });
}

function renderArtists(data) {
    contentArea.innerHTML = '';
    let existingArtists = [];
    let tracks = data.map(x => x.track);

    tracks.forEach(track => {
        track.artists.forEach(artist => {
            if (existingArtists.includes(artist.id)) {
                return;
            } else {
                existingArtists.push(artist.id);
                let sum = 0;
                let fromTracks = [];
                tracks.forEach(t => {
                    t.artists.forEach(a => {
                        if (a.id === artist.id) {
                            sum++;
                            fromTracks.push(t.name);
                        }
                    })
                })

                artist.times_appeared = sum;
                artist.from_tracks = fromTracks;

                const node = artistTemplate.content.cloneNode(true);
                const card = node.querySelector('.recently-played-artist-card');

                card.querySelector('.cover').src = artist.image;
                card.querySelector('.cover').alt = artist.name;


                let list = card.querySelector('ul.tracks');
                if (artist.from_tracks.length > 1) {
                    card.querySelector('.from-tracks').textContent =
                        `From tracks:`;

                    artist.from_tracks.forEach(t => {
                        let listItem = document.createElement('li');
                        listItem.textContent = t;
                        list.appendChild(listItem);
                    })
                } else {
                    card.querySelector('.from-tracks').textContent =
                        `From track: ${artist.from_tracks[0]}`;
                    list.remove();
                }

                card.querySelector('.popularity').textContent =
                    `Popularity: ${artist.popularity}`;
                card.querySelector('.followers').textContent =
                    `Followers: ${artist.followers}`;
                if (artist.times_appeared > 1) {
                    card.querySelector('.times-appeared').textContent =
                        `Appeared in tracks ${artist.times_appeared} times`;
                } else {
                    card.querySelector('.times-appeared').textContent =
                        `Appeared in tracks ${artist.times_appeared} time`;
                }

                card.querySelector('.last-updated').textContent =
                    `Updated on ${formatLocalTime(artist.updated_at)}`;

                card.querySelector('.artist-name').textContent = artist.name;
                card.querySelector('.genres').textContent = artist.genres ? artist.genres.split(',').join(', ') : '';

                contentArea.appendChild(node);
            }
        })
    });
}

function updateSelectedOption(selectedElement) {
    document.querySelectorAll('.settings-inner button').forEach(btn => btn.classList.remove('selected'));

    // Add 'selected' class to the clicked element
    selectedElement.classList.add('selected');
}

function renderAlbums(data) {
    console.log("WIP");
}

function tracksButtonClickEvent(data) {
    updateSelectedOption(tracksButton);
    renderTracks(data);
}

function artistsButtonClickEvent(data) {
    updateSelectedOption(artistsButton);
    renderArtists(data);
}

function albumsButtonClickEvent(data) {
    updateSelectedOption(albumsButton);
    renderAlbums(data);
}

function assignSettingButtonEvents(data) {
    tracksButton.onclick = () => tracksButtonClickEvent(data);
    artistsButton.onclick = () => artistsButtonClickEvent(data);
    albumsButton.onclick = () => albumsButtonClickEvent(data);
}


(async () => {
    const data = await loadRecentlyPlayed();
    assignSettingButtonEvents(data);
    renderTracks(data);
})();
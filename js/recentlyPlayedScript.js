const contentArea  = document.querySelector('.content');
const mediaCardTemplate = document.getElementById('media-card-template');
const trackDetailsTemplate = document.getElementById('track-media-card-details-template');
const artistDetailsTemplate = document.getElementById('artist-media-card-details-template');
const albumDetailsTemplate = document.getElementById('album-media-card-details-template');
const settingsButtons = document.querySelectorAll(".settings-bar__item");
const limitInput = document.querySelector("#limit");

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

function createMediaCard(primaryText, secondaryText, cover, altCoverText) {
    const fragment = mediaCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.media-card');


    card.querySelector('.media-card__cover').src = cover ?? "images/placeholder.png";
    card.querySelector('.media-card__cover').alt = altCoverText;
    card.querySelector('.media-card__primary-text').textContent = primaryText;
    card.querySelector('.media-card__secondary-text').textContent = secondaryText;

    contentArea.appendChild(fragment);
    return card;
}


function createTrackMediaCard(track) {
    const details = trackDetailsTemplate.content.cloneNode(true);

    let artistsText = track.track.artists.map(x => x.name).join(", ");
    let card = createMediaCard(track.track.name, artistsText, track.track.album.cover, track.track.name);

    details.querySelector('.media-card__line--played-at').textContent =
        `Played on ${track.time_finished}`;
    details.querySelector('.media-card__line--popularity').textContent =
        `Popularity: ${track.current_popularity}`;
    details.querySelector('.media-card__line--album-title').textContent =
        `From ${track.track.album.name}`;
    details.querySelector('.media-card__line--album-artists').textContent =
        `${capitaliseFirstLetter(track.track.album.album_type)} by ${track.track.album.artists.map(x => x.name).join(", ")}`;
    details.querySelector('.media-card__line--context').textContent =
        `Played from ${track.context_type}`;
    details.querySelector('.media-card__line--device').textContent =
        `on ${track.device.name} (${track.device.type})`;

    let cardDetails = card.querySelector(".media-card__details")
    cardDetails.appendChild(details);
    return card;
}

function createArtistMediaCard(track, existingArtists, allTracks) {
    for (let artist of track.artists) {
        if (existingArtists.includes(artist.id)) {
            return;
        } else {
            existingArtists.push(artist.id);
            let sum = 0;
            let fromTracks = [];
            for (let t of allTracks) {
                for (let a of t.artists) {
                    if (a.id === artist.id) {
                        sum++;
                        if (!fromTracks.includes(t.name)) {
                            fromTracks.push(t.name);
                        }
                    }
                }
            }

            artist.times_appeared = sum;
            artist.from_tracks = fromTracks;


            let genresText = artist.genres ? artist.genres.split(',').join(', ') : '';
            const card = createMediaCard(artist.name, genresText, artist.image, artist.name);
            const details = artistDetailsTemplate.content.cloneNode(true);


            let listLabel = details.querySelector(".media-card__from-tracks-label");
            let list = details.querySelector('.media-card__from-tracks-list');
            if (artist.from_tracks.length > 1) {
                listLabel.textContent = `From tracks:`;

                for (let t of artist.from_tracks) {
                    let listItem = document.createElement('li');
                    listItem.classList.add("media-card__from-tracks-item");
                    listItem.textContent = t;
                    list.appendChild(listItem);
                }
            } else {
                listLabel.textContent = `From track: ${artist.from_tracks[0]}`;
                list.remove();
            }

            details.querySelector('.media-card__line--popularity').textContent =
                `Popularity: ${artist.popularity}`;
            details.querySelector('.media-card__line--followers').textContent =
                `Followers: ${artist.followers}`;
            if (artist.times_appeared > 1) {
                details.querySelector('.media-card__line--times-appeared').textContent =
                    `Appeared in tracks ${artist.times_appeared} times`;
            } else {
                details.querySelector('.media-card__line--times-appeared').textContent =
                    `Appeared in tracks ${artist.times_appeared} time`;
            }

            details.querySelector('.media-card__line--last-updated').textContent =
                `Updated on ${formatLocalTime(artist.updated_at)}`;

            let cardDetails = card.querySelector(".media-card__details");
            cardDetails.appendChild(details);
            return card;
        }
    }
}

function createAlbumMediaCard(album, existingAlbums, allTracks) {
    if (!existingAlbums.includes(album.id)) {
        existingAlbums.push(album.id);
        let sum = 0;
        let fromTracks = [];
        for (let t of allTracks) {
            if (t.album.id === album.id) {
                sum++;
                if (!fromTracks.includes(t.name)) {
                    fromTracks.push(t.name);
                }
            }
        }

        album.times_appeared = sum;
        album.from_tracks = fromTracks;

        let artistsText = album.artists.map(a => a.name).join(', ');
        const card = createMediaCard(album.name, artistsText, album.cover, album.name);
        const details = albumDetailsTemplate.content.cloneNode(true);

        let list = details.querySelector('.media-card__from-tracks-list');
        let label = details.querySelector('.media-card__from-tracks-label');
        if (album.from_tracks.length > 1) {
            label.textContent = `From tracks:`;

            for (let t of album.from_tracks) {
                let listItem = document.createElement('li');
                listItem.classList.add("media-card__from-tracks-item");
                listItem.textContent = t;
                list.appendChild(listItem);
            }
        } else {
            label.textContent = `From track: ${album.from_tracks[0]}`;
            list.remove();
        }

        details.querySelector('.media-card__line--album-type').textContent =
            `This album is a ${capitaliseFirstLetter(album.album_type)}`;
        details.querySelector('.media-card__line--release-date').textContent =
            `Released on ${album.release_date}`;
        if (album.times_appeared > 1) {
            details.querySelector('.media-card__line--times-appeared').textContent =
                `Listened to tracks within ${album.times_appeared} times`;
        } else {
            details.querySelector('.media-card__line--times-appeared').textContent =
                `Listened to tracks within 1 time`;
        }

        let cardDetails = card.querySelector(".media-card__details");
        cardDetails.appendChild(details);
        return card;
    }
}

function getSettingsButton(view) {
    for (let btn of settingsButtons) {
        if (btn.dataset.view == view) return btn;
    }
    return "error";
}

async function loadRecentlyPlayed(limit) {
    const response = await fetch(`https://api.pugking4.dev/stats/recently-played?limit=${limit}`);
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

function capitaliseFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function renderTracks(tracks) {
    contentArea.innerHTML = '';

    for (let track of tracks) {
        createTrackMediaCard(track);
    }
}

function renderArtists(data) {
    contentArea.innerHTML = '';
    let existingArtists = [];
    let tracks = data.map(x => x.track);

    for (let track of tracks) {
        createArtistMediaCard(track, existingArtists, tracks);
    }
}

function updateSelectedOption(selectedElement) {
    document.querySelector('.settings-bar__item--active').classList.remove('settings-bar__item--active');
    selectedElement.classList.add('settings-bar__item--active');
}

function renderAlbums(data) {
    contentArea.innerHTML = '';
    let existingAlbums = [];
    let tracks = data.map(x => x.track);
    let albums = tracks.map(x => x.album);

    for (let album of albums) {
        createAlbumMediaCard(album, existingAlbums, tracks);
    }
}

function tracksButtonClickEvent(data) {
    updateSelectedOption(getSettingsButton("tracks"));
    renderTracks(data);
}

function artistsButtonClickEvent(data) {
    updateSelectedOption(getSettingsButton("artists"));
    renderArtists(data);
}

function albumsButtonClickEvent(data) {
    updateSelectedOption(getSettingsButton("albums"));
    renderAlbums(data);
}

function getCurrentSetting() {
    for (let btn of settingsButtons) {
        if (btn.classList.contains("settings-bar__item--active")) return btn.dataset.view;
    }
    return "none"
}

function assignSettingButtonEvents(data) {
    for (let btn of settingsButtons) {
        switch (btn.dataset.view) {
            case "tracks":
                btn.onclick = () => tracksButtonClickEvent(data);
                break;
            case "artists":
                btn.onclick = () => artistsButtonClickEvent(data);
                break;
            case "albums":
                btn.onclick = () => albumsButtonClickEvent(data);
                break;
        }
    }
}

async function limitChangeCommitted() {
    let limit = getLimit();
    const data = await loadRecentlyPlayed(limit);
    assignSettingButtonEvents(data);
    switch (getCurrentSetting()) {
        case "tracks":
            renderTracks(data);
            break;
        case "artists":
            renderArtists(data);
            break;
        case "albums":
            renderAlbums(data);
            break;
    }
}

function assignLimitEvents() {
    limitInput.addEventListener("change", limitChangeCommitted);
}

function getLimit() {
    let limit;
    if (limitInput.checkValidity()) {
        limit = limitInput.value;
    } else {
        limit = 10;
        limitInput.value = 10;
    }
    return limit;
}

(async () => {
    let limit = getLimit();
    const data = await loadRecentlyPlayed(limit);
    assignSettingButtonEvents(data);
    assignLimitEvents();
    renderTracks(data);
})();
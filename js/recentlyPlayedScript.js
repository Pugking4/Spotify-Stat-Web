const contentArea  = document.querySelector('.content-area');
const template = document.getElementById('recently-played-template');

function formatLocalTime(isoString) {
    const date = new Date(isoString);   // parse GMT/UTC
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}


async function loadRecentlyPlayed() {
    const response = await fetch('https://210.5.34.8:8080/stats/recentlyPlayed?limit=10');
    if (!response.ok) {
        console.error('Request failed', response.status);
        return;
    }

    const data = await response.json();   // array of tracks
    console.log(data);
    for (let i = 0; i < data.length; i++) {
        data[i].time_finished = formatLocalTime(data[i].time_finished);
    }
    renderTracks(data);
}

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function renderTracks(tracks) {
    contentArea.innerHTML = '';

    tracks.forEach(track => {
        const node = template.content.cloneNode(true);
        const card = node.querySelector('.recently-played-card');

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

function assignSettingButtonEvents() {

}


loadRecentlyPlayed();

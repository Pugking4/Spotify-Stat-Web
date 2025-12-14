const contentArea  = document.querySelector('.content-area');

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
    const response = await fetch('http://210.5.34.8:8080/stats/recentlyPlayed?limit=10');
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

function renderTracks(tracks) {
    contentArea.innerHTML = '';           // clear existing cards
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'recently-played-card';
        card.innerHTML = `
      <div class="card-top">
    <div class="card-cover">
      <img class="cover" src="${track.track.album.cover}" alt="${track.track.name}">
    </div>
    <div class="card-details">
      <p class="played-at">Played at ${track.time_finished}</p>
      <p class="popularity">Popularity: ${track.current_popularity}</p>
      <p class="album-title">From album ${track.track.album.name}</p>
      <p class="album-artists">Made by ${track.track.album.artists.map(x => x.name)}</p>
      <p class="context">Played from ${track.context_type}</p>
      <p class="device">on ${track.device.name} (${track.device.type})</p>
    </div>
  </div>
  <div class="card-bottom">
    <p class="track-title">${track.track.name}</p>
    <p class="track-artists">${track.track.artists.map(x => x.name)}</p>
  </div>
    `;
        contentArea.appendChild(card);
    });
}

function assignSettingButtonEvents() {

}


loadRecentlyPlayed();

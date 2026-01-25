const contentArea  = document.querySelector('.content');

let data;

// Latency chart
let latencyChart;
const latencySeries = {
    m1: {
        p50: [],
        p95: [],
        p99: []
    },
    m5: {
        p50: [],
        p95: [],
        p99: []
    }

};
const latencyIndexByTime = {
    m1: new Map(),
    m5: new Map()
};

let latencyBucket = 'm1';
const latencyToggle = document.querySelector('.api-stats__bucket-toggle--latency');

// Traffic chart
let trafficChart;
const trafficSeries = {
    m1: {
        success: [],
        clientError: [],
        serverError: []
    },
    m5: {
        success: [],
        clientError: [],
        serverError: []
    }
}
const trafficIndexByTime = {
    m1: new Map(),
    m5: new Map()
};


let trafficBucket = 'm1';
const trafficToggle = document.querySelector('.api-stats__bucket-toggle--traffic');


trafficToggle.addEventListener('click', () => {
    trafficBucket = trafficBucket === 'm1' ? 'm5' : 'm1';
    trafficToggle.dataset.value = trafficBucket === 'm1' ? '1m' : '5m';

    trafficToggle.querySelectorAll('.api-stats__bucket-label').forEach((label, i) => {
        label.classList.toggle(
            'api-stats__bucket-label--active',
            (i === 0 && trafficBucket === 'm1') || (i === 1 && trafficBucket === 'm5')
        );
    });

    reloadTrafficChart();
});

latencyToggle.addEventListener('click', () => {
    latencyBucket = latencyBucket === 'm1' ? 'm5' : 'm1';
    latencyToggle.dataset.value = latencyBucket === 'm1' ? '1m' : '5m';

    latencyToggle.querySelectorAll('.api-stats__bucket-label').forEach((label, i) => {
        label.classList.toggle(
            'api-stats__bucket-label--active',
            (i === 0 && latencyBucket === 'm1') || (i === 1 && latencyBucket === 'm5')
        );
    });

    reloadLatencyChart();
});

function toMsNumber(v) {
    const n = (typeof v === 'string') ? Number(v) : v;
    return Number.isFinite(n) ? n : null;
}

function ensureLatencyChart() {
    if (latencyChart) return;
    const el = contentArea.querySelector('#latencyChart');
    latencyChart = echarts.init(el);

    latencyChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['p50', 'p95', 'p99'] },
        xAxis: { type: 'time' },
        yAxis: { type: 'value', name: '' },
        series: [
            { name: 'p50', type: 'line', showSymbol: false, connectNulls: false, data: [] },
            { name: 'p95', type: 'line', showSymbol: false, connectNulls: false, data: [] },
            { name: 'p99', type: 'line', showSymbol: false, connectNulls: false, data: [] }
        ]
    });
}

function upsertLatencyPoint(timeEndSec, p50, p95, p99) {
    const tMs = timeEndSec * 1000;
    const idx = latencyIndexByTime[latencyBucket].get(timeEndSec);
    const bucket = latencySeries[latencyBucket];

    if (idx === undefined) {
        const newIdx = bucket.p50.length;
        latencyIndexByTime[latencyBucket].set(timeEndSec, newIdx);

        bucket.p50.push([tMs, p50]);
        bucket.p95.push([tMs, p95]);
        bucket.p99.push([tMs, p99]);
    } else {
        bucket.p50[idx] = [tMs, p50];
        bucket.p95[idx] = [tMs, p95];
        bucket.p99[idx] = [tMs, p99];
    }
}

function renderLatencyCard(latencyPayload) {
    ensureLatencyChart();

    const buckets = latencyPayload?.buckets ?? [];
    for (const b of buckets) {
        if (!b?.timeEnd) continue;

        upsertLatencyPoint(
            b.timeEnd,
            roundTo(toMsNumber(b.p50Ms), 2),
            roundTo(toMsNumber(b.p95Ms), 2),
            roundTo(toMsNumber(b.p99Ms), 2)
        );
    }

    const bucket = latencySeries[latencyBucket];

    latencyChart.setOption({
        series: [
            { name: 'p50', data: bucket.p50 },
            { name: 'p95', data: bucket.p95 },
            { name: 'p99', data: bucket.p99 }
        ]
    });
}


function ensureTrafficChart() {
    if (trafficChart) return;
    const el = contentArea.querySelector('#trafficChart');
    trafficChart = echarts.init(el);

    trafficChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['success', 'clientError', 'serverError'] },
        xAxis: { type: 'time' },
        yAxis: { type: 'value', name: '' },
        series: [
            {
                name: 'success',
                type: 'line',
                stack: 'traffic',
                areaStyle: {},
                showSymbol: false,
                data: trafficSeries.success
            },
            {
                name: 'clientError',
                type: 'line',
                stack: 'traffic',
                areaStyle: {},
                showSymbol: false,
                data: trafficSeries.clientError
            },
            {
                name: 'serverError',
                type: 'line',
                stack: 'traffic',
                areaStyle: {},
                showSymbol: false,
                data: trafficSeries.serverError
            }
        ]
    });

}

function upsertTrafficPoint(timeEndSec, success, clientError, serverError) {
    const tMs = timeEndSec * 1000;
    const idx = trafficIndexByTime[trafficBucket].get(timeEndSec);
    const bucket = trafficSeries[trafficBucket];

    if (idx === undefined) {
        const newIdx = bucket.success.length;
        trafficIndexByTime[trafficBucket].set(timeEndSec, newIdx);

        bucket.success.push([tMs, success]);
        bucket.clientError.push([tMs, clientError]);
        bucket.serverError.push([tMs, serverError]);
    } else {
        bucket.success[idx] = [tMs, success];
        bucket.clientError[idx] = [tMs, clientError];
        bucket.serverError[idx] = [tMs, serverError];
    }
}

function renderTrafficCard(trafficPayload) {
    ensureTrafficChart();

    const buckets = trafficPayload?.buckets ?? [];
    for (const b of buckets) {
        if (!b?.timeEnd) continue;

        upsertTrafficPoint(
            b.timeEnd,
            roundTo(toMsNumber(b.success), 0),
            roundTo(toMsNumber(b.clientError), 0),
            roundTo(toMsNumber(b.serverError), 0)
        );
    }

    const bucket = trafficSeries[trafficBucket];

    trafficChart.setOption({
        series: [
            { name: 'success', data: bucket.success },
            { name: 'clientError', data: bucket.clientError },
            { name: 'serverError', data: bucket.serverError }
        ]
    });
}


async function loadAPIStats() {
    const response = await fetch(`https://api.pugking4.dev/stats/api`);
    if (!response.ok) {
        console.error('Request failed', response.status);
        return;
    }

    const data = await response.json();   // array of tracks
    //for (let i = 0; i < data.length; i++) {
    //    data[i].time_finished = formatLocalTime(data[i].time_finished);
    //}
    return data;
}

function roundTo(num, dPlaces) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, dPlaces)) / Math.pow(10, dPlaces)
}

function calculateBestDisplayTimeUnit(s) {
    if (s > 60) {
        s /= 60;
        if (s > 60) {
            s /= 60;
            if (s > 24) {
                s /= 24;
                return `${roundTo(s, 2)} days`;
            } else {
                return `${roundTo(s, 1)} hours`;
            }
        } else {
            return `${roundTo(s, 0)} minutes`;
        }
    } else {
        return `${roundTo(s, 0)} seconds`;
    }
}

function renderCompactCard(version, hostname, uptime_s, totalRequests) {
    const compactCard = contentArea.querySelector(".api-stats__card--compact");
    compactCard.querySelector("#version").textContent = `v${version}`;
    compactCard.querySelector("#hostname").textContent = `\"${hostname}\"`;
    compactCard.querySelector("#totalRequests").textContent = totalRequests;
    compactCard.querySelector("#uptime_s").textContent = calculateBestDisplayTimeUnit(uptime_s);
    compactCard.querySelector("#lastUpdated").textContent = "Just now";
}

function renderUptimeCard(uptimePercentage) {
    contentArea.querySelector("#uptime24h").textContent =
        roundTo(uptimePercentage.d1 ?? 0, 2) + "%";

    contentArea.querySelector("#uptime7d").textContent =
        roundTo(uptimePercentage.d7 ?? 0, 2) + "%";
}

function renderAPIStats(data) {
    renderCompactCard(
        data.version,
        data.hostname,
        data.uptimeSeconds,
        data.totalRequests
    );

    renderLatencyCard(latencyBucket === 'm1' ? data.latency1m : data.latency5m);
    renderUptimeCard(data.uptimePercentage);
    renderTrafficCard(trafficBucket === 'm1' ? data.rollingRequests1m : data.rollingRequests5m);
}


function reloadTrafficChart() {
    renderTrafficCard(
        trafficBucket === 'm1'
            ? data.rollingRequests1m
            : data.rollingRequests5m
    );

    trafficChart.resize();
}

function reloadLatencyChart() {
    renderLatencyCard(
        latencyBucket === 'm1'
            ? data.latency1m
            : data.latency5m
    );

    latencyChart.resize();
}



async function tick() {
    data = await loadAPIStats();
    if (data) renderAPIStats(data);
}

tick();
setInterval(tick, 15_000);

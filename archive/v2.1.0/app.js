/**
 * Application Logic for Series A #1 Evidence Dashboard (v1.1.0)
 * 100% Japan-France Comparative Visualisations
 */

let chartInstances = {};
let renderedTabs = {
    'tab-viewing': false,
    'tab-advertising': false,
    'tab-sources': false
};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    
    // Set global Chart.js defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    }

    // Render Tab 1 initially
    renderTabCharts('tab-viewing');
});

// ----------------------------------------------------
// 1. Tab Navigation & Lazy Rendering
// ----------------------------------------------------
function initTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const activePane = document.getElementById(targetTab);
            if (activePane) {
                activePane.classList.add('active');
                setTimeout(() => {
                    renderTabCharts(targetTab);
                }, 50);
            }
        });
    });
}

function renderTabCharts(tabId) {
    if (typeof DASHBOARD_DATA === 'undefined' || typeof Chart === 'undefined') {
        console.error('DASHBOARD_DATA or Chart.js is not loaded.');
        return;
    }

    const data = DASHBOARD_DATA;

    if (tabId === 'tab-viewing') {
        if (!renderedTabs['tab-viewing']) {
            renderAgeComparisonChart(data, 'all');
            renderYoungCrossoverComparisonChart(data, 'frYoung');
            renderCompositionChart(data, 'stackedMinutes');
            renderNationalViewingComparisonChart(data, 'trend');

            setupAgeComparisonFilter();
            setupYoungCrossoverToggle(data);
            setupCompositionToggle(data);
            setupNationalViewToggle(data);

            renderedTabs['tab-viewing'] = true;
        } else {
            ['ageComparison', 'youngCrossover', 'composition', 'nationalViewing'].forEach(id => {
                if (chartInstances[id]) chartInstances[id].resize();
            });
        }
    } else if (tabId === 'tab-advertising') {
        if (!renderedTabs['tab-advertising']) {
            renderAdCrossoverChart(data);
            renderBvodComparisonChart(data, 'netShare');
            setupBvodToggle(data);
            renderSaturationForecastChart(data, 'baseline');
            setupForecastToggle(data);
            renderedTabs['tab-advertising'] = true;
        } else {
            if (chartInstances.adCrossover) chartInstances.adCrossover.resize();
            if (chartInstances.bvodComparison) chartInstances.bvodComparison.resize();
            if (chartInstances.saturationForecast) chartInstances.saturationForecast.resize();
        }
    }
}

// ----------------------------------------------------
// 3. Tab 1 Charts (100% Japan-France Comparative)
// ----------------------------------------------------

// Chart 1-1: \u65e5\u4ecf\u5e74\u4ee3\u5225\u76f4\u63a5\u5bfe\u6bd4
function renderAgeComparisonChart(data, filter = 'all') {
    const ctx = document.getElementById('chart-age-comparison-fr-jp');
    if (!ctx) return;

    const comp = data.viewingShift.normalizedAgeComparison || {
        years: [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        young: { france: [105, 92, 85, 80, 65, 60, 52], japan: [105.4, 105.4, 89.9, 80.6, 56.5, 46.3, 46.2] },
        middle: { france: [180, 170, 160, 155, 135, 130, 120], japan: [169.8, 167.1, 158.7, 171.2, 147.2, 141.5, 134.7] },
        senior: { france: [255, 260, 255, 265, 255, 250, 242], japan: [250.7, 252.8, 245.9, 257.6, 237.9, 251.7, 227.8] }
    };

    if (chartInstances.ageComparison) {
        chartInstances.ageComparison.destroy();
    }

    const datasets = [
        {
            label: '\u4ecf: \u82e5\u5e74\u5c64 (15-24\u6b73)',
            data: comp.young.france,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2
        },
        {
            label: '\u65e5: \u82e5\u5e74\u5c64 (10-20\u4ee3\u5e73\u5747)',
            data: comp.young.japan,
            borderColor: '#f87171',
            borderDash: [5, 5],
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2
        },
        {
            label: '\u4ecf: \u73fe\u5f79\u5c64 (25-49\u6b73)',
            data: comp.middle.france,
            borderColor: '#f59e0b',
            borderWidth: 2,
            pointRadius: 3.5,
            tension: 0.2
        },
        {
            label: '\u65e5: \u73fe\u5f79\u5c64 (30-50\u4ee3\u5e73\u5747)',
            data: comp.middle.japan,
            borderColor: '#facc15',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 3.5,
            tension: 0.2
        },
        {
            label: '\u4ecf: \u30b7\u30cb\u30a2\u5c64 (50\u6b73\u4ee5\u4e0a)',
            data: comp.senior.france,
            borderColor: '#3b82f6',
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2
        },
        {
            label: '\u65e5: \u30b7\u30cb\u30a2\u5c64 (60\u4ee3)',
            data: comp.senior.japan,
            borderColor: '#60a5fa',
            borderDash: [5, 5],
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2
        }
    ];

    // Apply visibility filter
    datasets.forEach((ds, idx) => {
        if (filter === 'all') {
            ds.hidden = false;
        } else if (filter === 'young') {
            ds.hidden = !(idx === 0 || idx === 1);
        } else if (filter === 'middle') {
            ds.hidden = !(idx === 2 || idx === 3);
        } else if (filter === 'senior') {
            ds.hidden = !(idx === 4 || idx === 5);
        }
    });

    chartInstances.ageComparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: comp.years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    title: { display: true, text: '\u5e73\u65e51\u65e5\u3042\u305f\u308a\u8996\u8074\u6642\u9593\uff08\u5206\uff09' },
                    min: 0,
                    max: 300
                },
                x: {
                    title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21 \uff08\u5b9f\u7dda\uff1a\u30d5\u30e9\u30f3\u30b9 \uff0f \u7834\u7dda\uff1a\u65e5\u672c\uff09' }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: (c) => ` ${c.dataset.label}: ${c.raw} \u5206`
                    }
                }
            }
        }
    });
}

function setupAgeComparisonFilter() {
    const buttons = document.querySelectorAll('#age-comparison-filter .pill-btn');
    const noteEl = document.getElementById('age-card-note');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            const chart = chartInstances.ageComparison;
            if (!chart) return;

            chart.data.datasets.forEach((ds, idx) => {
                if (filter === 'all') ds.hidden = false;
                else if (filter === 'young') ds.hidden = !(idx === 0 || idx === 1);
                else if (filter === 'middle') ds.hidden = !(idx === 2 || idx === 3);
                else if (filter === 'senior') ds.hidden = !(idx === 4 || idx === 5);
            });
            chart.update();

            if (noteEl) {
                if (filter === 'young') {
                    noteEl.innerHTML = '<strong>\u3010\u82e5\u5e74\u5c64\u306e\u7126\u70b9\u3011</strong> 2014\u5e74\u6642\u70b9\u3067\u306f\u65e5\u4ecf\u3068\u3082\u306b\u7d04105\u5206\uff081\u6642\u959345\u5206\uff09\u3067\u3057\u305f\u304c\u30012024\u5e74\u306b\u306f\u4ecf<strong>52\u5206\uff08\u221250%\uff09</strong>\u3001\u65e5<strong>46\u5206\uff08\u221256%\uff09</strong>\u3078\u3068\u3001\u5168\u304f\u540c\u3058\u30b9\u30d4\u30fc\u30c9\u306750\u5206\u524d\u5f8c\u3078\u534a\u6e1b\u6025\u843d\u3057\u3066\u3044\u307e\u3059\u3002';
                } else if (filter === 'middle') {
                    noteEl.innerHTML = '<strong>\u3010\u73fe\u5f79\u5c64\u306e\u7126\u70b9\u3011</strong> \u73fe\u5f79\u4e16\u4ee3\u3082\u65e5\u4ecf\u3068\u3082\u306b170\u5206\u524d\u5f8c\u304b\u3089120\u301c135\u5206\u524d\u5f8c\u3078\u3068\u7de9\u3084\u304b\u306a\u6e1b\u5c11\u30c8\u30ec\u30f3\u30c9\u3092\u8fdb\u3081\u3066\u3044\u307e\u3059\u3002';
                } else if (filter === 'senior') {
                    noteEl.innerHTML = '<strong>\u3010\u30b7\u30cb\u30a2\u5c64\u306e\u7126\u70b9\u3011</strong> \u4ecf\uff08240\u301c265\u5206\uff09\u3001\u65e5\uff08230\u301c255\u5206\uff09\u3068\u3082\u306b\u3001\u9ad8\u9f62\u5c64\u3060\u3051\u306f10\u5e74\u9593\u5727\u5012\u7684\u306a\u8996\u8074\u6642\u9593\u3092\u7dad\u6301\u3057\u3066\u304a\u308a\u3001\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u653e\u9001\u306e\u6700\u5927\u306e\u57fa\u76e4\u3068\u306a\u3063\u3066\u3044\u307e\u3059\u3002';
                } else {
                    noteEl.innerHTML = '<strong>\u3010\u30a8\u30d3\u30c7\u30f3\u30b9\u306e\u7126\u70b9\u3011</strong> \u82e5\u5e74\u5c64\u306f\u4ecf\uff08105\u5206\u279452\u5206\uff09\u3001\u65e5\uff08105\u5206\u279446\u5206\uff09\u3068\u3068\u3082\u306b<strong>50\u5206\u524d\u5f8c\u3078\u534a\u6e1b\u6025\u843d</strong>\u3002\u4e00\u65b9\u3001\u30b7\u30cb\u30a2\u5c64\u306f\u4ecf\uff08240\u301c260\u5206\uff09\u3001\u65e5\uff08230\u301c250\u5206\uff09\u3068\u9ad8\u6c34\u6e96\u3092\u7dad\u6301\u3057\u3066\u304a\u308a\u3001<strong>\u300c\u82e5\u8005\u306e\u30c6\u30ec\u30d3\u96e2\u308c\u3068\u30b7\u30cb\u30a2\u306b\u3088\u308b\u4e0b\u652f\u3048\u300d\u3068\u3044\u3046\u4e16\u4ee3\u9593\u69cb\u9020\u304c\u65e5\u4ecf\u3067\u5b8c\u5168\u306b\u4e00\u81f4</strong>\u3057\u3066\u3044\u307e\u3059\u3002';
                }
            }
        });
    });
}

// Chart 1-2: \u65e5\u4ecf\u82e5\u5e74\u9006\u8ee2\u5bfe\u6bd4
function renderYoungCrossoverComparisonChart(data, target = 'frYoung') {
    const ctx = document.getElementById('chart-crossover-young-fr-jp');
    if (!ctx) return;

    const cross = data.viewingShift.youngCrossoverComparison || {
        years: [2014, 2016, 2018, 2020, 2022, 2024],
        franceYoung: { linearTV: [105, 92, 85, 80, 65, 52], netVideo: [18, 38, 92, 135, 148, 158] },
        japanTeens: { linearTV: [91.8, 91.0, 72.3, 73.1, 48.0, 39.7], netVideo: [19.2, 38.6, 61.5, 161.0, 111.4, 147.1] },
        japanTwenties: { linearTV: [118.9, 119.8, 107.5, 88.0, 64.9, 52.6], netVideo: [22.8, 45.1, 78.2, 146.8, 128.9, 149.8] }
    };

    if (chartInstances.youngCrossover) {
        chartInstances.youngCrossover.destroy();
    }

    let datasets = [];
    let yMax = 180;

    if (target === 'frYoung') {
        datasets = [
            {
                label: '\u4ecf 15-24\u6b73: \u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u30c6\u30ec\u30d3 (DEI)',
                data: cross.franceYoung.linearTV,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            },
            {
                label: '\u4ecf 15-24\u6b73: \u975e\u30ea\u30a2\u30eb/\u30cd\u30c3\u30c8\u52d5\u753b',
                data: cross.franceYoung.netVideo,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            }
        ];
    } else if (target === 'jpTeens') {
        datasets = [
            {
                label: '\u65e5 10\u4ee3: \u30c6\u30ec\u30d3(\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0)',
                data: cross.japanTeens.linearTV,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            },
            {
                label: '\u65e5 10\u4ee3: \u30cd\u30c3\u30c8\u52d5\u753b(\u5171\u6709+VOD)',
                data: cross.japanTeens.netVideo,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            }
        ];
    } else if (target === 'jpTwenties') {
        datasets = [
            {
                label: '\u65e5 20\u4ee3: \u30c6\u30ec\u30d3(\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0)',
                data: cross.japanTwenties.linearTV,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            },
            {
                label: '\u65e5 20\u4ee3: \u30cd\u30c3\u30c8\u52d5\u753b(\u5171\u6709+VOD)',
                data: cross.japanTwenties.netVideo,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            }
        ];
    } else {
        // Compare All: Net Videos comparison
        datasets = [
            {
                label: '\u4ecf 15-24\u6b73: \u30cd\u30c3\u30c8\u52d5\u753b(\u26052018\u5e74\u9006\u8ee2)',
                data: cross.franceYoung.netVideo,
                borderColor: '#ef4444',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            },
            {
                label: '\u65e5 10\u4ee3: \u30cd\u30c3\u30c8\u52d5\u753b(\u26052019\u5e74\u9006\u8ee2)',
                data: cross.japanTeens.netVideo,
                borderColor: '#10b981',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            },
            {
                label: '\u65e5 20\u4ee3: \u30cd\u30c3\u30c8\u52d5\u753b(\u26052020\u5e74\u9006\u8ee2)',
                data: cross.japanTwenties.netVideo,
                borderColor: '#f59e0b',
                borderWidth: 3,
                pointRadius: 5,
                tension: 0.2
            }
        ];
    }

    chartInstances.youngCrossover = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cross.years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    title: { display: true, text: '\u5e73\u65e51\u65e5\u3042\u305f\u308a\u5229\u7528\u6642\u9593\uff08\u5206\uff09' },
                    min: 0,
                    max: yMax
                },
                x: {
                    title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21' }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 14, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: (c) => ` ${c.dataset.label}: ${c.raw} \u5206`
                    }
                }
            }
        }
    });
}

function setupYoungCrossoverToggle(data) {
    const buttons = document.querySelectorAll('#crossover-view-toggle .pill-btn');
    const noteEl = document.getElementById('crossover-card-note');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-target');
            renderYoungCrossoverComparisonChart(data, target);

            if (noteEl) {
                if (target === 'frYoung') {
                    noteEl.innerHTML = '<strong>\u3010\u30d5\u30e9\u30f3\u30b9\u82e5\u5e74\u5c64\u306e\u9006\u8ee2\u3011</strong> <strong>2018\u5e74</strong>\u306b\u975e\u30ea\u30a2\u30eb/\u30cd\u30c3\u30c8\u52d5\u753b\uff0892\u5206\uff09\u304c\u30c6\u30ec\u30d3\uff0885\u5206\uff09\u3092\u6b74\u53f2\u7684\u306b\u9006\u8ee2\u30022024\u5e74\u73fe\u5728\u306f\u30cd\u30c3\u30c8\u52d5\u753b\u304c158\u5206\u306b\u9054\u3057\u3001\u30c6\u30ec\u30d3\uff0852\u5206\uff09\u306e<strong>\u7d043.0\u500d</strong>\u306b\u9054\u3057\u3066\u3044\u307e\u3059\u3002';
                } else if (target === 'jpTeens') {
                    noteEl.innerHTML = '<strong>\u3010\u65e5\u672c10\u4ee3\u306e\u9006\u8ee2\u3011</strong> <strong>2019\u5e74</strong>\u306b\u30cd\u30c3\u30c8\u52d5\u753b\uff0884.9\u5206\uff09\u304c\u30c6\u30ec\u30d3\uff0869.0\u5206\uff09\u3092\u9006\u8ee2\u30022024\u5e74\u73fe\u5728\u306f\u30cd\u30c3\u30c8\u52d5\u753b\uff08147.1\u5206\uff09\u304c\u30c6\u30ec\u30d3\uff0839.7\u5206\uff09\u306e<strong>\u7d043.7\u500d</strong>\u306b\u62e1\u5927\u3057\u3066\u3044\u307e\u3059\u3002';
                } else if (target === 'jpTwenties') {
                    noteEl.innerHTML = '<strong>\u3010\u65e5\u672c20\u4ee3\u306e\u9006\u8ee2\u3011</strong> <strong>2020\u5e74\uff08\u30b3\u30ed\u30ca\u798d\uff09</strong>\u306b\u30cd\u30c3\u30c8\u52d5\u753b\uff08146.8\u5206\uff09\u304c\u30c6\u30ec\u30d3\uff0888.0\u5206\uff09\u3092\u9006\u8ee2\u30022024\u5e74\u73fe\u5728\u306f\u30cd\u30c3\u30c8\u52d5\u753b\uff08149.8\u5206\uff09\u304c\u30c6\u30ec\u30d3\uff0852.6\u5206\uff09\u306e<strong>\u7d042.8\u500d</strong>\u3067\u3059\u3002';
                } else {
                    noteEl.innerHTML = '<strong>\u3010\u9006\u8ee2\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3\u5bfe\u6bd4\u3011</strong> \u30d5\u30e9\u30f3\u30b9\u82e5\u5e74\u5c64\u306f<strong>2018\u5e74</strong>\u306b\u9006\u8ee2\u3002\u65e5\u672c\u306f10\u4ee3\u304c<strong>2019\u5e74</strong>\u300120\u4ee3\u304c<strong>2020\u5e74</strong>\u306b\u9006\u8ee2\u3002\u30d5\u30e9\u30f3\u30b9\u304c1\u301c2\u5e74\u5148\u884c\u3057\u3066\u5168\u304f\u540c\u3058\u5730\u6bbb\u5909\u52d5\u3092\u7d4c\u904e\u3057\u3066\u3044\u308b\u3053\u3068\u304c\u660e\u78ba\u306b\u793a\u3055\u308c\u3066\u3044\u307e\u3059\u3002';
                }
            }
        });
    });
}

// Chart 1-3: \u65e5\u4ecf\u7dcf\u52d5\u753b\u8996\u8074\u69cb\u9020\uff08\u5b9f\u6642\u9593\u7a4d\u307f\u4e0a\u3052 vs 100%\u69cb\u6210\u6bd4\uff09
function renderCompositionChart(data, mode = 'stackedMinutes') {
    const ctx = document.getElementById('chart-composition-fr-jp');
    if (!ctx) return;

    const subtitleEl = document.getElementById('composition-chart-subtitle');
    const noteEl = document.getElementById('composition-card-note');

    if (chartInstances.composition) {
        chartInstances.composition.destroy();
    }

    const ts = (data.viewingShift && data.viewingShift.onDemandTimeSeries) || {
        years: [2014, 2016, 2018, 2020, 2022, 2024, 2025],
        france: {
            linearMinutes: [220, 232, 216, 238, 206, 156, 155],
            onDemandMinutes: [15, 31, 48, 89, 102, 98, 99],
            totalMinutes: [235, 263, 264, 327, 308, 254, 254],
            onDemandShare: [6.4, 11.8, 18.2, 27.2, 33.1, 38.6, 39.0]
        },
        japan: {
            linearMinutes: [168.3, 161.4, 156.7, 163.7, 153.2, 154.7, 153.0],
            onDemandMinutes: [7.7, 15.1, 23.0, 39.2, 48.3, 57.4, 57.0],
            totalMinutes: [176.0, 176.5, 179.7, 202.9, 201.5, 212.1, 210.0],
            onDemandShare: [4.4, 8.6, 12.8, 19.3, 24.0, 27.1, 27.1]
        }
    };

    if (mode === 'stackedMinutes') {
        if (subtitleEl) {
            subtitleEl.textContent = '\u56fd\u6c111\u4eba1\u65e5\u3042\u305f\u308a\u7dcf\u52d5\u753b\uff08\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u653e\u9001 \uff0b \u30cd\u30c3\u30c8\u914d\u4fe1\uff09\u306e\u5b9f\u6642\u9593\u63a8\u79fb\uff082014\u20132025\u5e74\u3001\u5358\u4f4d\uff1a\u5206/\u65e5\uff09';
        }
        if (noteEl) {
            noteEl.innerHTML = '<strong>\u3010\u30a8\u30d3\u30c7\u30f3\u30b9\u306e\u7126\u70b9\u3011</strong> \u30d5\u30e9\u30f3\u30b9\u306f\u7dcf\u52d5\u753b\u6642\u9593\uff08250\u301c320\u5206\u53f0\uff09\u306e\u3046\u3061\u3001\u30aa\u30f3\u30c7\u30de\u30f3\u30c9\u304c2014\u5e74\u306e15\u5206\u304b\u30892025\u5e74\u306b\u306f<strong>99\u5206\u3078\u6025\u62e1\u5927</strong>\uff08+84\u5206\uff09\u3002\u65e5\u672c\u3082176\u5206\u304b\u3089212\u5206\u3078\u5897\u52a0\u3057\u3064\u3064\u3001\u30cd\u30c3\u30c8\u52d5\u753b\u304c7.7\u5206\u304b\u3089<strong>57.4\u5206\u30787.5\u500d\u306b\u6025\u4f38</strong>\u3057\u3066\u3044\u307e\u3059\u3002';
        }

        chartInstances.composition = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ts.years,
                datasets: [
                    {
                        label: '\u4ecf: \u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u653e\u9001',
                        data: ts.france.linearMinutes,
                        backgroundColor: '#3b82f6',
                        stack: 'FR',
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                    },
                    {
                        label: '\u4ecf: \u30aa\u30f3\u30c7\u30de\u30f3\u30c9',
                        data: ts.france.onDemandMinutes,
                        backgroundColor: '#ef4444',
                        stack: 'FR',
                        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                    },
                    {
                        label: '\u65e5: \u653e\u9001\u6ce2(\u30ea\u30a2\u30eb+\u9332\u753b)',
                        data: ts.japan.linearMinutes,
                        backgroundColor: '#60a5fa',
                        stack: 'JP',
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                    },
                    {
                        label: '\u65e5: \u30cd\u30c3\u30c8\u52d5\u753b(\u5171\u6709+VOD)',
                        data: ts.japan.onDemandMinutes,
                        backgroundColor: '#10b981',
                        stack: 'JP',
                        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21 \uff08\u5de6\u68d2\uff1a\u30d5\u30e9\u30f3\u30b9 \uff0f \u53f3\u68d2\uff1a\u65e5\u672c\uff09' }
                    },
                    y: {
                        stacked: true,
                        min: 0,
                        max: 360,
                        title: { display: true, text: '\u5e73\u65e51\u65e5\u3042\u305f\u308a\u8996\u8074\u6642\u9593\uff08\u5206\uff09' }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.dataset.label}: ${c.raw} \u5206`,
                            afterBody: (items) => {
                                const idx = items[0].dataIndex;
                                const frTot = ts.france.totalMinutes[idx];
                                const frPct = ts.france.onDemandShare[idx];
                                const jpTot = ts.japan.totalMinutes[idx];
                                const jpPct = ts.japan.onDemandShare[idx];
                                return [
                                    '------------------------',
                                    `\u4ecf \u7dcf\u52d5\u753b: ${frTot} \u5206 (\u30aa\u30f3\u30c7\u30de\u30f3\u30c9: ${frPct}%)`,
                                    `\u65e5 \u7dcf\u52d5\u753b: ${jpTot} \u5206 (\u30aa\u30f3\u30c7\u30de\u30f3\u30c9: ${jpPct}%)`
                                ];
                            }
                        }
                    }
                }
            }
        });
    } else {
        // 100% Stacked Bar Mode
        if (subtitleEl) {
            subtitleEl.textContent = '\u7dcf\u52d5\u753b\u8996\u8074\u6642\u9593\u306b\u5360\u3081\u308b\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u653e\u9001 vs \u30aa\u30f3\u30c7\u30de\u30f3\u30c9\u914d\u4fe1\u306e100%\u69cb\u6210\u6bd4\u63a8\u79fb\uff082014\u20132025\u5e74\u3001\u5358\u4f4d\uff1a%\uff09';
        }
        if (noteEl) {
            noteEl.innerHTML = '<strong>\u3010\u30a8\u30d3\u30c7\u30f3\u30b9\u306e\u7126\u70b9\uff1a100%\u69cb\u6210\u6bd4\u306e\u5909\u5bb9\u3011</strong> 2014\u5e74\u6642\u70b9\u3067\u306f\u65e5\u4ecf\u3068\u3082\u306b\u653e\u9001\u6ce2\u304c<strong>93\u301c95%</strong>\u3092\u5360\u3081\u3066\u3044\u307e\u3057\u305f\u304c\u30012025\u5e74\u306b\u306f\u30d5\u30e9\u30f3\u30b9\u3067\u30aa\u30f3\u30c7\u30de\u30f3\u30c9\u6bd4\u7387\u304c<strong>39.0%</strong>\u306b\u9054\u3057\u3001\u653e\u9001\u6ce2\u304c61.0%\u307e\u3067\u5f8c\u9000\u3002\u65e5\u672c\u3082\u30cd\u30c3\u30c8\u52d5\u753b\u6bd4\u7387\u304c4.4%\u304b\u3089<strong>27.1%</strong>\u3078\u3068\u62e1\u5927\u3057\u3066\u304a\u308a\u3001<strong>\u30d5\u30e9\u30f3\u30b9\u306e2020\u5e74\u306e\u69cb\u6210\u6bd4\uff08\u30aa\u30f3\u30c7\u30de\u30f3\u30c927.2%\uff09\u306b\u65e5\u672c\u304c2024\u5e74\uff0827.1%\uff09\u306b\u5230\u9054\u3057\u305f</strong>\u3068\u3044\u30464\u5e74\u5dee\u306e\u69cb\u9020\u63a8\u79fb\u304c100%\u6bd4\u8f03\u3067\u9bae\u660e\u306b\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002';
        }

        const frLinearShare = ts.france.onDemandShare.map(s => parseFloat((100 - s).toFixed(1)));
        const jpLinearShare = ts.japan.onDemandShare.map(s => parseFloat((100 - s).toFixed(1)));

        chartInstances.composition = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ts.years,
                datasets: [
                    {
                        label: '\u4ecf: \u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u653e\u9001\u6bd4\u7387',
                        data: frLinearShare,
                        backgroundColor: '#3b82f6',
                        stack: 'FR',
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                    },
                    {
                        label: '\u4ecf: \u30aa\u30f3\u30c7\u30de\u30f3\u30c9\u6bd4\u7387',
                        data: ts.france.onDemandShare,
                        backgroundColor: '#ef4444',
                        stack: 'FR',
                        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                    },
                    {
                        label: '\u65e5: \u653e\u9001\u6ce2\u6bd4\u7387',
                        data: jpLinearShare,
                        backgroundColor: '#60a5fa',
                        stack: 'JP',
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                    },
                    {
                        label: '\u65e5: \u30cd\u30c3\u30c8\u52d5\u753b\u6bd4\u7387',
                        data: ts.japan.onDemandShare,
                        backgroundColor: '#10b981',
                        stack: 'JP',
                        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21 \uff08\u5de6\u68d2\uff1a\u30d5\u30e9\u30f3\u30b9 \uff0f \u53f3\u68d2\uff1a\u65e5\u672c\uff09' }
                    },
                    y: {
                        stacked: true,
                        min: 0,
                        max: 100,
                        title: { display: true, text: '\u7dcf\u52d5\u753b\u306b\u5360\u3081\u308b\u5272\u5408\uff08%\uff09' },
                        ticks: { callback: v => `${v}%` }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: (c) => {
                                const idx = c.dataIndex;
                                let mins = '';
                                if (c.datasetIndex === 0) mins = ` (\u7d04${ts.france.linearMinutes[idx]}\u5206)`;
                                else if (c.datasetIndex === 1) mins = ` (\u7d04${ts.france.onDemandMinutes[idx]}\u5206)`;
                                else if (c.datasetIndex === 2) mins = ` (\u7d04${ts.japan.linearMinutes[idx]}\u5206)`;
                                else if (c.datasetIndex === 3) mins = ` (\u7d04${ts.japan.onDemandMinutes[idx]}\u5206)`;
                                return ` ${c.dataset.label}: ${c.raw}%${mins}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function setupCompositionToggle(data) {
    const buttons = document.querySelectorAll('#composition-view-toggle .pill-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.getAttribute('data-comp');
            renderCompositionChart(data, mode);
        });
    });
}

// Chart 1-4: \u65e5\u4ecf\u30c6\u30ec\u30d3\u7dcf\u91cf\u5bfe\u6bd4
function renderNationalViewingComparisonChart(data, mode = 'trend') {
    const ctx = document.getElementById('chart-national-viewing-fr-jp');
    if (!ctx) return;

    const nat = data.viewingShift.nationalAverageComparison || {
        years: [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        franceDEI: [220, 232, 216, 238, 206, 199, 192],
        japanAverage: [168.3, 161.4, 156.7, 163.7, 153.2, 153.7, 154.7],
        gapMinutes: [51.7, 70.6, 59.3, 74.3, 52.8, 45.3, 37.3]
    };

    if (chartInstances.nationalViewing) {
        chartInstances.nationalViewing.destroy();
    }

    const subtitleEl = document.getElementById('national-chart-subtitle');
    const noteEl = document.getElementById('national-card-note');

    if (mode === 'trend') {
        if (subtitleEl) {
            subtitleEl.textContent = '\u30d5\u30e9\u30f3\u30b9DEI\uff084\u6b73\u4ee5\u4e0a\uff09 vs \u65e5\u672c\u5e73\u65e5\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\uff0813\u301c79\u6b73\uff09\u306e\u5168\u4f53\u5e73\u5747\u63a8\u79fb\uff082014\u301c2024\u5e74\u3001\u5358\u4f4d\uff1a\u5206/\u65e5\uff09';
        }
        if (noteEl) {
            noteEl.innerHTML = '<strong>\u3010\u30a8\u30d3\u30c7\u30f3\u30b9\u306e\u7126\u70b9\uff1a\u5168\u4f53\u63a8\u79fb\u5bfe\u6bd4\u3011</strong> \u30d5\u30e9\u30f3\u30b9\u56fd\u6c11\u5168\u4f53\uff08DEI\uff09\u306f2014\u5e74\u306e220\u5206\u304b\u3089192\u5206\u3078\u6e1b\u5c11\uff08\u221228\u5206\uff09\u3002\u65e5\u672c\uff08\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u5168\u5e74\u4ee3\uff09\u306f168\u5206\u304b\u3089155\u5206\u3078\u6e1b\u5c11\uff08\u221213\u5206\uff09\u3002\u5143\u3005\u30c6\u30ec\u30d3\u8996\u8074\u91cf\u304c\u65e5\u672c\u3088\u308a\u7d0450\u301c70\u5206\u9577\u304b\u3063\u305f\u30d5\u30e9\u30f3\u30b9\u3067\u3082\u3001\u914d\u4fe1\u666e\u53ca\u306b\u4f34\u3044\u7740\u5b9f\u306a\u6e1b\u5c11\u30c8\u30ec\u30f3\u30c9\u304c\u5b9a\u7740\u3057\u3066\u3044\u307e\u3059\u3002';
        }

        chartInstances.nationalViewing = new Chart(ctx, {
            type: 'line',
            data: {
                labels: nat.years,
                datasets: [
                    {
                        label: '\u4ecf DEI: \u56fd\u6c111\u4eba1\u65e5\u5e73\u5747\u30c6\u30ec\u30d3\u8996\u8074\u6642\u9593 (4\u6b73\u4ee5\u4e0a)',
                        data: nat.franceDEI,
                        borderColor: '#60a5fa',
                        backgroundColor: 'rgba(96, 165, 250, 0.15)',
                        fill: true,
                        tension: 0.2,
                        borderWidth: 3,
                        pointRadius: 5
                    },
                    {
                        label: '\u65e5 \u5e73\u65e5\u30c6\u30ec\u30d3\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u8996\u8074\u6642\u9593 (\u5168\u5e74\u4ee3\u5e73\u5747)',
                        data: nat.japanAverage,
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
                        fill: true,
                        tension: 0.2,
                        borderWidth: 3,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: { display: true, text: '1\u65e5\u5e73\u5747\u8996\u8074\u6642\u9593\uff08\u5206\uff09' },
                        min: 0,
                        max: 260
                    },
                    x: { title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21' } }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (c) => {
                                const val = c.raw;
                                const h = Math.floor(val / 60);
                                const m = Math.round(val % 60);
                                return ` ${c.dataset.label}: ${val} \u5206 (${h}\u6642\u9593${m}\u5206)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // Index Mode: Line Chart (2014 = 100)
        if (subtitleEl) {
            subtitleEl.textContent = '\u65e5\u4ecf\u306e\u8abf\u67fb\u6bcd\u4f53\u30fb\u624b\u6cd5\u306e\u9055\u3044\u3092\u6a19\u6e96\u5316\u3057\u305f\u6e1b\u8870\u901f\u5ea6\u306e\u6bd4\u8f03\uff082014\u5e74\uff1d100\u57fa\u6e96\u3001\u5358\u4f4d\uff1a\u30dd\u30a4\u30f3\u30c8\uff09';
        }
        if (noteEl) {
            noteEl.innerHTML = '<strong>\u3010\u30a8\u30d3\u30c7\u30f3\u30b9\u306e\u7126\u70b9\uff1a\u6e1b\u8870\u901f\u5ea6\u306e\u6bd4\u8f03\uff082014\u5e74=100\uff09\u3011</strong> \u8abf\u67fb\u624b\u6cd5\u3084\u6bcd\u96c6\u56e3\u306e\u9055\u3044\u3092\u76f8\u6bba\u3057\u3066\u6e1b\u8870\u30da\u30fc\u30b9\u3092\u6bd4\u8f03\u3059\u308b\u3068\u30012014\u5e74\u6bd4\u3067\u65e5\u672c\u306f<strong>\u22128.1%\uff0891.9\uff09</strong>\u306e\u6e1b\u5c11\u306b\u3068\u3069\u307e\u308b\u4e00\u65b9\u3001\u30d5\u30e9\u30f3\u30b9\u306f<strong>\u221212.7%\uff0887.3\uff09</strong>\u3068\u30d5\u30e9\u30f3\u30b9\u306e\u6e1b\u5c11\u304c\u52a0\u901f\u3002\u7279\u306b\u30b3\u30ed\u30ca\u798d\uff082020\u5e74=108.2\uff09\u304b\u30892024\u5e74\uff0887.3\uff09\u306b\u304b\u3051\u3066\u3001\u30d5\u30e9\u30f3\u30b9\u306f<strong>\u221220.9\u30dd\u30a4\u30f3\u30c8\u3082\u6025\u843d</strong>\u3057\u3066\u304a\u308a\u3001\u5730\u4e0a\u6ce2\u96e2\u308c\u306e\u51c4\u307e\u3058\u3044\u30b9\u30d4\u30fc\u30c9\u304c\u6d6e\u304d\u5f6b\u308a\u306b\u306a\u308a\u307e\u3059\u3002';
        }

        const frIndex = nat.franceIndex || [100.0, 105.5, 98.2, 108.2, 93.6, 90.5, 87.3];
        const jpIndex = nat.japanIndex || [100.0, 95.9, 93.1, 97.3, 91.0, 91.3, 91.9];

        chartInstances.nationalViewing = new Chart(ctx, {
            type: 'line',
            data: {
                labels: nat.years,
                datasets: [
                    {
                        label: '\u4ecf DEI\u6307\u6570 (2014\u5e74=100)',
                        data: frIndex,
                        borderColor: '#60a5fa',
                        backgroundColor: 'rgba(96, 165, 250, 0.1)',
                        tension: 0.2,
                        borderWidth: 3,
                        pointRadius: 5
                    },
                    {
                        label: '\u65e5 \u5e73\u65e5\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u6307\u6570 (2014\u5e74=100)',
                        data: jpIndex,
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.2,
                        borderWidth: 3,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        title: { display: true, text: '2014\u5e74\u57fa\u6e96\u6307\u6570\uff082014\u5e74\uff1d100\uff09' },
                        min: 80,
                        max: 115,
                        ticks: {
                            callback: v => v === 100 ? '100 (\u57fa\u6e96)' : v
                        }
                    },
                    x: { title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21' } }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (c) => {
                                const diff = (c.raw - 100).toFixed(1);
                                const sign = diff > 0 ? '+' : '';
                                return ` ${c.dataset.label}: ${c.raw} (2014\u5e74\u6bd4 ${sign}${diff}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function setupNationalViewToggle(data) {
    const buttons = document.querySelectorAll('#national-view-toggle .pill-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.getAttribute('data-mode');
            renderNationalViewingComparisonChart(data, mode);
        });
    });
}

// ----------------------------------------------------
// 4. Tab 2 Charts
// ----------------------------------------------------

// Helper to calculate dynamic Y max based on visible datasets
function updateAdCrossoverDynamicYScale(chart) {
    let maxVal = 1.0;
    // Datasets 0: UK, 1: FR, 2: US, 3: JP, 4: Baseline
    chart.data.datasets.forEach((ds, idx) => {
        if (idx !== 4) {
            const meta = chart.getDatasetMeta(idx);
            // If visible (not hidden via meta or dataset property)
            const isHidden = (meta && meta.hidden !== null) ? meta.hidden : ds.hidden;
            if (!isHidden) {
                const localMax = Math.max(...ds.data);
                if (localMax > maxVal) maxVal = localMax;
            }
        }
    });

    let dynamicMax;
    if (maxVal <= 1.2) dynamicMax = 1.5;
    else if (maxVal <= 2.0) dynamicMax = 2.5;
    else if (maxVal <= 2.8) dynamicMax = 3.2;
    else if (maxVal <= 4.2) dynamicMax = 4.8;
    else if (maxVal <= 6.0) dynamicMax = 6.8;
    else dynamicMax = Math.ceil(maxVal + 0.8);

    chart.options.scales.y.max = dynamicMax;
}

// Helper to calculate dynamic Y max based on visible datasets
function updateAdCrossoverDynamicYScale(chart) {
    let maxVal = 1.0;
    chart.data.datasets.forEach((ds, idx) => {
        if (idx !== 4 && chart.isDatasetVisible(idx)) {
            const localMax = Math.max(...ds.data);
            if (localMax > maxVal) maxVal = localMax;
        }
    });

    let dynamicMax;
    if (maxVal <= 1.2) dynamicMax = 1.5;
    else if (maxVal <= 2.0) dynamicMax = 2.5;
    else if (maxVal <= 2.8) dynamicMax = 3.2;
    else if (maxVal <= 4.2) dynamicMax = 4.8;
    else if (maxVal <= 6.0) dynamicMax = 6.8;
    else dynamicMax = Math.ceil(maxVal + 0.8);

    chart.options.scales.y.max = dynamicMax;
}

// Helper to calculate dynamic Y max based on visible datasets
function updateAdCrossoverDynamicYScale(chart) {
    let maxVal = 1.0;
    chart.data.datasets.forEach((ds, idx) => {
        if (idx !== 4 && chart.isDatasetVisible(idx)) {
            const localMax = Math.max(...ds.data);
            if (localMax > maxVal) maxVal = localMax;
        }
    });

    let dynamicMax;
    if (maxVal <= 1.2) dynamicMax = 1.5;
    else if (maxVal <= 2.0) dynamicMax = 2.5;
    else if (maxVal <= 2.8) dynamicMax = 3.2;
    else if (maxVal <= 4.2) dynamicMax = 4.8;
    else if (maxVal <= 6.0) dynamicMax = 6.8;
    else dynamicMax = Math.ceil(maxVal + 0.8);

    chart.options.scales.y.max = dynamicMax;
}

// Chart 2-1: 4-Country Time Series Crossover & Multiplier Trend with Dynamic Y Scaling
function renderAdCrossoverChart(data) {
    const ctx = document.getElementById('chart-ad-crossover');
    if (!ctx) return;

    if (chartInstances.adCrossover) {
        chartInstances.adCrossover.destroy();
    }

    const ts = (data.adMarketCrossover && data.adMarketCrossover.timeSeriesRatio) || {
        years: [2011, 2014, 2016, 2017, 2018, 2019, 2020, 2022, 2024, 2025],
        uk: { ratios: [1.15, 1.62, 2.10, 2.45, 2.75, 3.10, 3.60, 5.20, 7.10, 7.76] },
        france: { ratios: [0.65, 0.85, 1.05, 1.25, 1.45, 1.70, 2.10, 2.75, 3.55, 3.83] },
        usa: { ratios: [0.52, 0.74, 0.95, 1.28, 1.55, 1.85, 2.15, 3.10, 3.65, 3.80] },
        japan: { ratios: [0.46, 0.54, 0.67, 0.78, 0.92, 1.13, 1.30, 1.70, 2.18, 2.30] }
    };

    chartInstances.adCrossover = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ts.years,
            datasets: [
                {
                    label: '[\u82f1] \u30a4\u30ae\u30ea\u30b9 (2011\u5e74\u9006\u8ee2\u30fb\u73fe\u57287.76\u500d)',
                    data: ts.uk.ratios,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    pointRadius: 4.5,
                    tension: 0.2
                },
                {
                    label: '[\u4ecf] \u30d5\u30e9\u30f3\u30b9 (2016\u5e74\u9006\u8ee2\u30fb\u73fe\u57283.83\u500d)',
                    data: ts.france.ratios,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    pointRadius: 4.5,
                    tension: 0.2
                },
                {
                    label: '[\u7c73] \u30a2\u30e1\u30ea\u30ab (2017\u5e74\u9006\u8ee2\u30fb\u73fe\u57283.80\u500d)',
                    data: ts.usa.ratios,
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 3,
                    pointRadius: 4.5,
                    tension: 0.2
                },
                {
                    label: '[\u65e5] \u65e5\u672c (2019\u5e74\u9006\u8ee2\u30fb\u73fe\u57282.30\u500d)',
                    data: ts.japan.ratios,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderWidth: 3.5,
                    pointRadius: 5.5,
                    tension: 0.2
                },
                {
                    label: '\u2500\u2500 \u9006\u8ee2\u5883\u754c\u7dda (1.0\u500d: \u30c6\u30ec\u30d3\uff1d\u30c7\u30b8\u30bf\u30eb\u540c\u984d)',
                    data: ts.years.map(() => 1.0),
                    borderColor: 'rgba(255, 255, 255, 0.45)',
                    borderDash: [6, 4],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    title: { display: true, text: '\u30c7\u30b8\u30bf\u30eb\u5e83\u544a \u00f7 \u30c6\u30ec\u30d3\u5e83\u544a\uff08\u500d\u7387\uff09' },
                    min: 0,
                    max: 8.5,
                    ticks: {
                        callback: v => v === 1.0 ? '1.0\u500d (\u9006\u8ee2\u30e9\u30a4\u30f3)' : `${v.toFixed(1)}\u500d`
                    }
                },
                x: {
                    title: { display: true, text: '\u8abf\u67fb\u5e74\u6b21\uff08\u5e74\uff09' }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 },
                        filter: (item) => item.datasetIndex !== 4
                    },
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const currentlyVisible = ci.isDatasetVisible(index);
                        ci.setDatasetVisibility(index, !currentlyVisible);
                        legendItem.hidden = currentlyVisible;

                        // Dynamically update Y max based on visible datasets
                        updateAdCrossoverDynamicYScale(ci);
                        ci.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (c) => {
                            if (c.datasetIndex === 4) return null;
                            return ` ${c.dataset.label}: ${c.raw}\u500d`;
                        }
                    }
                }
            }
        }
    });

    // Initialize dynamic Y scale
    updateAdCrossoverDynamicYScale(chartInstances.adCrossover);
    chartInstances.adCrossover.update();
}


// Helper to calculate dynamic Y max based on visible datasets in Card 2-2
function updateBvodDynamicYScale(chart) {
    let maxVal = 0.5;
    chart.data.datasets.forEach((ds, idx) => {
        if (chart.isDatasetVisible(idx)) {
            const validVals = ds.data.filter(v => v !== null && typeof v === 'number');
            if (validVals.length > 0) {
                const localMax = Math.max(...validVals);
                if (localMax > maxVal) maxVal = localMax;
            }
        }
    });

    let dynamicMax;
    if (maxVal <= 2.5) dynamicMax = 3.0;
    else if (maxVal <= 4.0) dynamicMax = 4.5;
    else if (maxVal <= 5.5) dynamicMax = 6.0;
    else if (maxVal <= 10.0) dynamicMax = 12.0;
    else if (maxVal <= 15.0) dynamicMax = 16.0;
    else dynamicMax = Math.ceil(maxVal * 1.15);

    chart.options.scales.y.max = dynamicMax;
}

// Chart 2-2: 4-Country BVOD Comparison (Net Share vs Time-Since-Crossover vs TV Revenue Share)
function renderBvodComparisonChart(data, mode = 'netShare') {
    const ctx = document.getElementById('chart-bvod-comparison');
    if (!ctx) return;

    if (chartInstances.bvodComparison) {
        chartInstances.bvodComparison.destroy();
    }

    const bvod = (data.adMarketCrossover && data.adMarketCrossover.bvodMarketComparison) || {
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        netAdShare: {
            uk: [2.10, 2.30, 2.42, 2.60, 2.72, 2.80, 2.81, 2.89],
            france: [1.63, 1.78, 1.89, 2.08, 2.35, 2.45, 2.50, 2.58],
            usa: [2.62, 2.82, 3.00, 3.23, 3.38, 3.51, 3.62, 3.70],
            japan: [0.66, 0.81, 0.96, 0.90, 1.16, 1.34, 1.70, 1.99]
        },
        tvRevenueShare: {
            uk: [6.0, 7.7, 9.3, 12.0, 13.9, 15.8, 17.5, 18.3],
            france: [2.5, 3.2, 4.1, 5.4, 6.8, 7.5, 8.4, 9.0],
            usa: [4.0, 5.2, 6.8, 9.0, 10.5, 11.5, 12.8, 13.5],
            japan: [0.60, 0.91, 1.28, 1.31, 1.95, 2.51, 3.51, 4.38]
        },
        timeSinceCrossover: {
            tYears: ["T+0年 (逆転時)", "T+2年", "T+4年", "T+6年 (日本の現在地)", "T+8年", "T+10年", "T+12年", "T+14年"],
            uk: [1.10, 1.50, 1.85, 2.05, 2.30, 2.60, 2.80, 2.89],
            france: [1.35, 1.63, 1.89, 2.35, 2.50, 2.58, null, null],
            usa: [2.40, 2.82, 3.23, 3.51, 3.70, null, null, null],
            japan: [0.81, 0.90, 1.34, 1.99, null, null, null, null]
        }
    };

    const subtitleEl = document.getElementById('bvod-chart-subtitle');
    const noteEl = document.getElementById('bvod-card-note');

    let datasets = [];
    let labels = [];
    let xTitle = '';
    let yTitle = '';

    if (mode === 'netShare') {
        labels = bvod.years;
        xTitle = '調査年次（年）';
        yTitle = 'ネット広告全体に占めるシェア（%）';

        if (subtitleEl) subtitleEl.textContent = 'ネット広告全体に占めるテレビ局配信広告（BVOD）シェア推移 ＆ 欧米飽和天井帯（2.5〜3.8%）';
        if (noteEl) noteEl.innerHTML = '<strong>【エビデンスの焦点：世界共通の2〜3%の壁】</strong> イギリス（2.89%）、フランス（2.58%）、アメリカ（3.70%）と、<strong>どの先進国も2.5〜3.8%のサチレーション天井帯に到達した途端、成長曲線が完全にフラット（水平化）</strong>しています。日本（テレビ由来配信 1.99%）はまさに今この天井帯の直下に突入しており、国内の配信（TVerおよび民放各局）をすべて合算しても、先行国と同様の飽和が待ち受けています。';

        datasets = [
            {
                label: '[英] イギリス BVODシェア',
                data: bvod.netAdShare.uk,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                tension: 0.2
            },
            {
                label: '[仏] フランス BVODシェア',
                data: bvod.netAdShare.france,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                tension: 0.2
            },
            {
                label: '[米] アメリカ CTV/BVODシェア',
                data: bvod.netAdShare.usa,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                tension: 0.2
            },
            {
                label: '[日] 日本 テレビ由来配信（TVer等BVOD）',
                data: bvod.netAdShare.japan,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3.5,
                pointRadius: 5.5,
                tension: 0.2
            },
            {
                label: '── 欧米サチレーション天井上限 (米 3.80%)',
                data: bvod.years.map(() => 3.80),
                borderColor: 'rgba(239, 68, 68, 0.55)',
                borderDash: [5, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false
            },
            {
                label: '░░ 欧米サチレーション天井帯 (2.50%〜3.80%)',
                data: bvod.years.map(() => 2.50),
                borderColor: 'rgba(239, 68, 68, 0.4)',
                borderDash: [5, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: '-1',
                backgroundColor: 'rgba(239, 68, 68, 0.08)'
            }
        ];
    } else if (mode === 'timeSinceCrossover') {
        const tData = bvod.timeSinceCrossover || {
            tYears: ["T+0年 (逆転時)", "T+2年", "T+4年", "T+6年 (日本の現在地)", "T+8年", "T+10年", "T+12年", "T+14年"],
            uk: [1.10, 1.50, 1.85, 2.05, 2.30, 2.60, 2.80, 2.89],
            france: [1.35, 1.63, 1.89, 2.35, 2.50, 2.58, null, null],
            usa: [2.40, 2.82, 3.23, 3.51, 3.70, null, null, null],
            japan: [0.81, 0.90, 1.34, 1.99, null, null, null, null]
        };

        labels = tData.tYears;
        xTitle = 'デジタル逆転年からの経過年数（T+0年＝逆転年）';
        yTitle = 'ネット広告全体に占めるシェア（%）';

        if (subtitleEl) subtitleEl.textContent = 'デジタル逆転からの経過年数（T+0〜T+14年）で標準化したシェア推移 ＆ 欧米サチレーション天井帯（2.5〜3.8%）';
        if (noteEl) noteEl.innerHTML = '<strong>【エビデンスの焦点：先行3カ国が証明する「2.5〜3.8%の赤い天井帯」】</strong> 逆転年次を「T+0年」としてタイムシフトすると、<strong>英（実線）・米（点線）・仏（点線）の全先行国が、T+14年に向かって例外なく「2.50%〜3.80%の赤い天井帯」の中に完全に収束・サチレーション</strong>している事実が浮き彫りになります。日本（テレビ由来配信・緑の実線）は現在「T+6年（1.99%）」で、まさにこの赤い天井帯の真下に到達。国内の民放配信全体を合算しても先行3カ国の誰も突破できなかったこの天井が、直下の「Card 2-3（未来予測）」におけるサチレーション限界の動かぬ論拠となります。';

        datasets = [
            {
                label: '[英] イギリス 実績 (2011年逆転・T+14年で2.89%)',
                data: tData.uk,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                spanGaps: false,
                tension: 0.2
            },
            {
                label: '[仏] フランス 実績 (2016年逆転・T+8年で2.58%)',
                data: tData.france,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                spanGaps: false,
                tension: 0.2
            },
            {
                label: '┄┄ [仏] フランス 予測軌道 (T+8➔T+14年: 2.68%)',
                data: tData.franceForecast || [null, null, null, null, 2.58, 2.62, 2.65, 2.68],
                borderColor: '#ef4444',
                borderDash: [5, 4],
                borderWidth: 2,
                pointRadius: 3.5,
                pointBackgroundColor: '#ef4444',
                spanGaps: true,
                tension: 0.2
            },
            {
                label: '[米] アメリカ 実績 (2017年逆転・T+8年で3.70%)',
                data: tData.usa,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                spanGaps: false,
                tension: 0.2
            },
            {
                label: '┄┄ [米] アメリカ 予測軌道 (T+8➔T+14年: 3.80%)',
                data: tData.usaForecast || [null, null, null, null, 3.70, 3.74, 3.77, 3.80],
                borderColor: '#a855f7',
                borderDash: [5, 4],
                borderWidth: 2,
                pointRadius: 3.5,
                pointBackgroundColor: '#a855f7',
                spanGaps: true,
                tension: 0.2
            },
            {
                label: '[日] 日本 実績 (テレビ由来配信・T+6年 1.99%)',
                data: tData.japan,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                borderWidth: 3.5,
                pointRadius: 6,
                spanGaps: false,
                tension: 0.2
            },
            {
                label: '── 欧米サチレーション天井上限 (米 3.80%)',
                data: labels.map(() => 3.80),
                borderColor: 'rgba(239, 68, 68, 0.55)',
                borderDash: [5, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false
            },
            {
                label: '░░ 欧米サチレーション天井帯 (2.50%〜3.80%)',
                data: labels.map(() => 2.50),
                borderColor: 'rgba(239, 68, 68, 0.4)',
                borderDash: [5, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: '-1',
                backgroundColor: 'rgba(239, 68, 68, 0.08)'
            }
        ];
    } else {
        // Mode 3: tvShare
        labels = bvod.years;
        xTitle = '調査年次（年）';
        yTitle = 'テレビ局広告売上に占めるデジタル比率（%）';

        if (subtitleEl) subtitleEl.textContent = 'テレビ広告費全体（地上波リニア放送 ＋ BVOD配信）に占めるデジタル売上の割合推移（%）';
        if (noteEl) noteEl.innerHTML = '<strong>【エビデンスの焦点：放送局売上のデジタル化格差】</strong> テレビ広告売上に占めるデジタル比率は、イギリスが<strong>18.3%</strong>、アメリカが<strong>13.5%</strong>、フランスが<strong>9.0%</strong>に達しています。欧米の放送局が売上の1〜2割をデジタルシフトさせて延命しているのに対し、<strong>日本はわずか4.38%</strong>にとどまり、地上波リニア放送への依存度が異常に高い構造的危機が浮き彫りになります。';

        datasets = [
            {
                label: '[英] イギリス局 デジタル化率',
                data: bvod.tvRevenueShare.uk,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                tension: 0.2
            },
            {
                label: '[仏] フランス局 デジタル化率',
                data: bvod.tvRevenueShare.france,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                tension: 0.2
            },
            {
                label: '[米] アメリカ局 デジタル化率',
                data: bvod.tvRevenueShare.usa,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 3,
                pointRadius: 4.5,
                tension: 0.2
            },
            {
                label: '[日] 日本民放局 デジタル化率',
                data: bvod.tvRevenueShare.japan,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3.5,
                pointRadius: 5.5,
                tension: 0.2
            }
        ];
    }

    chartInstances.bvodComparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    title: { display: true, text: yTitle },
                    min: 0,
                    ticks: {
                        callback: v => `${v.toFixed(1)}%`
                    }
                },
                x: {
                    title: { display: true, text: xTitle }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 },
                        filter: (item) => !item.text.includes('── 欧米サチレーション天井上限')
                    },
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const currentlyVisible = ci.isDatasetVisible(index);
                        ci.setDatasetVisibility(index, !currentlyVisible);
                        legendItem.hidden = currentlyVisible;

                        updateBvodDynamicYScale(ci);
                        ci.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (c) => {
                            if (c.raw === null || typeof c.raw === 'undefined') return null;
                            if (c.dataset.label.includes('天井')) {
                                return ` ${c.dataset.label}: ${c.raw.toFixed(2)}%`;
                            }
                            return ` ${c.dataset.label}: ${c.raw.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });

    updateBvodDynamicYScale(chartInstances.bvodComparison);
    chartInstances.bvodComparison.update();
}

function setupBvodToggle(data) {
    const buttons = document.querySelectorAll('#bvod-view-toggle .pill-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.getAttribute('data-bvod');
            renderBvodComparisonChart(data, mode);
        });
    });
}

// Chart 2-3: TVer Saturation Forecast vs Linear Ad Loss Gap (2025–2035)
function renderSaturationForecastChart(data, scenarioId = 'baseline') {
    const ctx = document.getElementById('chart-saturation-forecast');
    if (!ctx) return;

    if (chartInstances.saturationForecast) {
        chartInstances.saturationForecast.destroy();
    }

    const sf = (data.adMarketCrossover && data.adMarketCrossover.saturationForecast) || {
        years: [2025, 2028, 2030, 2035],
        linearDecline: {
            westernRate: { lossAmounts: [0, -1323, -2172, -4083] },
            moderateRate: { lossAmounts: [0, -719, -1192, -2450] }
        },
        scenarios: {
            baseline: {
                id: 'baseline',
                targetShare2035: 2.8,
                tverRevenues: [805, 1080, 1300, 1680],
                tverGains: [0, 275, 495, 875],
                netLossWestern: [0, -1048, -1677, -3208],
                fillRateWestern: [0, 20.8, 22.8, 21.4]
            },
            optimistic: {
                id: 'optimistic',
                targetShare2035: 4.0,
                tverRevenues: [805, 1260, 1650, 2400],
                tverGains: [0, 455, 845, 1595],
                netLossWestern: [0, -868, -1327, -2488],
                fillRateWestern: [0, 34.4, 38.9, 39.1]
            }
        }
    };

    const scenario = sf.scenarios[scenarioId] || sf.scenarios.baseline;
    const westernLoss = sf.linearDecline.westernRate.lossAmounts;
    const moderateLoss = sf.linearDecline.moderateRate.lossAmounts;

    // Update KPI Card Displays
    const kpiLinear = document.getElementById('kpi-linear-loss');
    const kpiTverRev = document.getElementById('kpi-tver-revenue');
    const kpiTverGain = document.getElementById('kpi-tver-gain');
    const kpiNetLoss = document.getElementById('kpi-net-loss');
    const kpiFillRate = document.getElementById('kpi-fill-rate');
    const kpiFillDesc = document.getElementById('kpi-fill-desc');
    const noteEl = document.getElementById('forecast-card-note');

    if (kpiLinear) kpiLinear.textContent = '▲4,083 億円';
    if (kpiTverRev) kpiTverRev.textContent = `${scenario.tverRevenues[3].toLocaleString()} 億円`;
    if (kpiTverGain) kpiTverGain.textContent = `2025年比 +${scenario.tverGains[3].toLocaleString()} 億円 増収 (シェア ${scenario.targetShare2035.toFixed(1)}%)`;
    if (kpiNetLoss) kpiNetLoss.textContent = `▲${Math.abs(scenario.netLossWestern[3]).toLocaleString()} 億円`;
    if (kpiFillRate) kpiFillRate.textContent = `${scenario.fillRateWestern[3].toFixed(1)}%`;
    if (kpiFillDesc) {
        kpiFillDesc.textContent = scenarioId === 'optimistic' 
            ? 'アップサイド（シェア4%倍増）でも穴の4割弱しか埋まらない'
            : '配信増収が穴埋めできる割合（わずか21%程度）';
    }

    if (noteEl) {
        if (scenarioId === 'optimistic') {
            noteEl.innerHTML = '<strong>【エビデンスの焦点：アップサイド・ケースの限界】</strong> ネット広告が6兆円へと急伸し、国内BVOD（TVer等）が米国の壁（3.8%）すら超えて<strong>シェア4.0%（売上2,400億円・増収+1,595億円）</strong>に達するという最大のアップサイド・ケースを置いても、欧米並みに地上波が減退した場合（▲4,083億円）、<strong>穴の補完率はわずか39.1%</strong>にとどまります。残りの<strong>▲2,488億円は純減収</strong>となり、テレビ由来配信の成長だけで地上波の縮小を補うことは数学的に不可能です。<br><br><strong>【データ定義注記】</strong> 本予測における配信売上は、電通『日本の広告費』における確定値「テレビメディア関連動画広告費（TVerおよび民放各局配信の合算値＝日本版BVOD）」を基準としています。市場在庫の大半をTVerが牽引している実態を踏まえ、表記上「TVer等」としています。';
        } else {
            noteEl.innerHTML = '<strong>【エビデンスの焦点：ベースケースの冷酷な現実】</strong> 国内BVOD（TVer等）が英仏並み（2.8%）までキャッチアップして<strong>売上1,680億円（増収+875億円）</strong>へ到達しても、欧米並みに地上波が減退した場合（▲4,083億円）、<strong>穴の補完率はわずか21.4%</strong>。毎年<strong>▲3,208億円の巨大な純減赤字</strong>が民放業界全体に残り、制作費とネットワーク維持の破綻が確実となります。<br><br><strong>【データ定義注記】</strong> 本予測における配信売上は、電通『日本の広告費』における確定値「テレビメディア関連動画広告費（TVerおよび民放各局配信の合算値＝日本版BVOD）」を基準としています。市場在庫の大半をTVerが牽引している実態を踏まえ、表記上「TVer等」としています。';
        }
    }

    const yearLabels = ['2025年 (現在)', '2028年', '2030年', '2035年 (予測)'];

    chartInstances.saturationForecast = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearLabels,
            datasets: [
                {
                    label: '地上波広告 減収額（欧米並みシナリオ: 年率▲2.8%減 / ▲25%減）',
                    data: westernLoss,
                    backgroundColor: 'rgba(239, 68, 68, 0.75)',
                    borderColor: '#ef4444',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: '地上波広告 減収額（保守シナリオ: 年率▲1.5%減 / ▲15%減）',
                    data: moderateLoss,
                    backgroundColor: 'rgba(248, 113, 113, 0.3)',
                    borderColor: '#f87171',
                    borderWidth: 1,
                    borderDash: [4, 4],
                    borderRadius: 4,
                    order: 3
                },
                {
                    label: `国内BVOD（TVer等）増収額（${scenario.name}）`,
                    data: scenario.tverGains,
                    backgroundColor: scenarioId === 'optimistic' ? 'rgba(6, 182, 212, 0.85)' : 'rgba(59, 130, 246, 0.8)',
                    borderColor: scenarioId === 'optimistic' ? '#06b6d4' : '#3b82f6',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    order: 2
                },
                {
                    type: 'line',
                    label: '埋まらない純減ギャップ（地上波減収 ＋ 配信増収）',
                    data: scenario.netLossWestern,
                    borderColor: '#ff385c',
                    backgroundColor: 'rgba(255, 56, 92, 0.1)',
                    borderWidth: 3,
                    borderDash: [6, 4],
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#ff385c',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    fill: false,
                    tension: 0.2,
                    order: 1
                },
                {
                    type: 'line',
                    label: 'ゼロ基準線',
                    data: [0, 0, 0, 0],
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                    order: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    title: { display: true, text: '年間増減額（億円 / 2025年水準比）' },
                    min: -4500,
                    max: 2000,
                    ticks: {
                        callback: v => {
                            if (v === 0) return '±0 億円 (基準)';
                            const sign = v > 0 ? '+' : '▲';
                            return `${sign}${Math.abs(v).toLocaleString()} 億円`;
                        }
                    }
                },
                x: {
                    title: { display: true, text: '予測タイムライン' }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 },
                        filter: (item) => item.datasetIndex !== 4
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (c) => {
                            if (c.datasetIndex === 4) return null;
                            const val = c.raw;
                            const sign = val > 0 ? '+' : (val < 0 ? '▲' : '±');
                            return ` ${c.dataset.label}: ${sign}${Math.abs(val).toLocaleString()} 億円`;
                        },
                        afterBody: (items) => {
                            const idx = items[0].dataIndex;
                            if (idx === 0) return ['------------------------', '2025年現行水準（地上波1.63兆円、テレビ由来配信805億円）'];
                            const tverTot = scenario.tverRevenues[idx];
                            const fill = scenario.fillRateWestern[idx];
                            const net = scenario.netLossWestern[idx];
                            return [
                                '------------------------',
                                `国内BVOD（TVer等）予測売上: ${tverTot.toLocaleString()} 億円`,
                                `純減収穴（欧米並み）: ▲${Math.abs(net).toLocaleString()} 億円`,
                                `穴埋め補完率: ${fill.toFixed(1)}%`
                            ];
                        }
                    }
                }
            }
        }
    });
}

function setupForecastToggle(data) {
    const buttons = document.querySelectorAll('#forecast-scenario-toggle .pill-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const scenario = btn.getAttribute('data-forecast-scenario');
            renderSaturationForecastChart(data, scenario);
        });
    });
}


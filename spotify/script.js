let allSpotifyData = [];
let filteredData = [];
const files = [
    'Streaming_History_Audio_2021-2025_6.json',
    'Streaming_History_Audio_2019-2021_5.json',
    'Streaming_History_Audio_2019_4.json',
    'Streaming_History_Audio_2018-2019_3.json',
    'Streaming_History_Audio_2017-2018_2.json',
    'Streaming_History_Audio_2015-2017_1.json',
    'Streaming_History_Audio_2012-2015_0.json'
];

// Add event listener to load data when page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupFilterToggle();
});

function setupDateFilters() {
    const startYearSelect = document.getElementById('startYear');
    const endYearSelect = document.getElementById('endYear');
    const applyButton = document.getElementById('applyFilter');
    const resetButton = document.getElementById('resetFilter');

    // Get unique years from data
    const years = [...new Set(allSpotifyData.map(item => new Date(item.ts).getFullYear()))].sort((a, b) => a - b);
    
    // Clear existing options
    startYearSelect.innerHTML = '';
    endYearSelect.innerHTML = '';
    
    // Populate year selects
    years.forEach(year => {
        const startOption = document.createElement('option');
        startOption.value = year;
        startOption.textContent = year;
        startYearSelect.appendChild(startOption);

        const endOption = document.createElement('option');
        endOption.value = year;
        endOption.textContent = year;
        endYearSelect.appendChild(endOption);
    });

    // Set initial values
    startYearSelect.value = years[0];
    endYearSelect.value = years[years.length - 1];

    applyButton.addEventListener('click', applyDateFilter);
    resetButton.addEventListener('click', resetDateFilter);
}

function setupFilterToggle() {
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    const filterIndicator = document.querySelector('.filter-indicator');
    
    filterToggle.addEventListener('click', () => {
        filterPanel.classList.toggle('open');
    });
    
    // Close filter panel when clicking outside
    document.addEventListener('click', (event) => {
        if (!filterToggle.contains(event.target) && !filterPanel.contains(event.target)) {
            filterPanel.classList.remove('open');
        }
    });
}

function applyDateFilter() {
    const startYear = parseInt(document.getElementById('startYear').value);
    const endYear = parseInt(document.getElementById('endYear').value);
    const filterIndicator = document.querySelector('.filter-indicator');
    
    // Reset filtered data
    filteredData = allSpotifyData.filter(item => {
        const itemYear = new Date(item.ts).getFullYear();
        return itemYear >= startYear && itemYear <= endYear;
    });

    // Update filter indicator
    filterIndicator.classList.add('active');

    // Clear existing charts before updating
    clearCharts();
    
    // Update visualizations with filtered data
    updateVisualizations();
    updateStats();
    
    // Close filter panel
    document.getElementById('filterPanel').classList.remove('open');
}

function clearCharts() {
    // Destroy existing charts
    const chartIds = ['topArtistsChart', 'topTracksChart', 'topAlbumsChart', 'monthlyActivityChart', 'timeOfDayChart'];
    chartIds.forEach(id => {
        const chart = Chart.getChart(document.getElementById(id));
        if (chart) {
            chart.destroy();
        }
    });
}

function resetDateFilter() {
    const startYearSelect = document.getElementById('startYear');
    const endYearSelect = document.getElementById('endYear');
    const filterIndicator = document.querySelector('.filter-indicator');
    
    const years = [...new Set(allSpotifyData.map(item => new Date(item.ts).getFullYear()))].sort((a, b) => a - b);
    
    startYearSelect.value = years[0];
    endYearSelect.value = years[years.length - 1];
    
    // Reset filtered data to all data
    filteredData = [...allSpotifyData];
    
    // Remove filter indicator
    filterIndicator.classList.remove('active');
    
    // Clear existing charts before updating
    clearCharts();
    
    // Update visualizations with all data
    updateVisualizations();
    updateStats();
    
    // Close filter panel
    document.getElementById('filterPanel').classList.remove('open');
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const loadingContent = document.querySelector('.loading-content');
    loadingContent.innerHTML = `
        <div style="color: #ff3b30; margin-bottom: 20px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>
        <div style="color: white; margin-bottom: 15px;">${message}</div>
        <button onclick="window.location.reload()" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s ease;
        ">Try Again</button>
    `;
}

async function loadAllData() {
    showLoading();
    allSpotifyData = [];
    
    try {
        const promises = files.map(file => 
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${file}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle both array and object formats
                    const records = Array.isArray(data) ? data : data.data || [];
                    // Filter out records with less than 30 seconds of play time and exclude podcasts
                    return records.filter(item => 
                        (item.ms_played || 0) >= 30000 && 
                        item.master_metadata_track_name && 
                        !item.episode_name
                    );
                })
                .catch(error => {
                    throw new Error(`Error loading ${file}: ${error.message}`);
                })
        );
        
        const results = await Promise.all(promises);
        allSpotifyData = results.flat();
        filteredData = [...allSpotifyData];
        
        if (allSpotifyData.length === 0) {
            throw new Error('No data was loaded from the files');
        }
        
        setupDateFilters();
        updateVisualizations();
        updateStats();
        hideLoading();
    } catch (error) {
        console.error('Error loading data:', error);
        showError(`Failed to load Spotify data: ${error.message}`);
    }
}

function updateStats() {
    const totalTracks = filteredData.length;
    const uniqueArtists = new Set(filteredData
        .filter(item => item.master_metadata_album_artist_name)
        .map(item => item.master_metadata_album_artist_name)).size;
    const totalPlayTime = filteredData.reduce((sum, item) => sum + (item.ms_played || 0), 0);
    const years = new Set(filteredData.map(item => new Date(item.ts).getFullYear())).size;

    // Calculate most active day
    const dayCounts = {};
    filteredData.forEach(item => {
        const date = new Date(item.ts);
        const dayKey = date.toISOString().split('T')[0];
        dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
    });
    const [mostActiveDay, mostActiveDayCount] = Object.entries(dayCounts)
        .sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    // Calculate unique tracks
    const uniqueTracks = new Set(filteredData
        .filter(item => item.master_metadata_track_name)
        .map(item => item.master_metadata_track_name)).size;

    document.getElementById('totalTracks').textContent = totalTracks.toLocaleString();
    document.getElementById('uniqueArtists').textContent = uniqueArtists.toLocaleString();
    document.getElementById('totalPlayTime').textContent = formatDuration(totalPlayTime);
    document.getElementById('yearsOfData').textContent = years;
    
    // Format the most active day
    const formattedDate = mostActiveDay !== '-' ? new Date(mostActiveDay).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : '-';
    document.getElementById('mostActiveDay').textContent = formattedDate;
    document.getElementById('uniqueTracks').textContent = uniqueTracks.toLocaleString();
}

function formatDuration(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    return `${days} days`;
}

function updateVisualizations() {
    if (!filteredData.length) return;

    // Process data for top artists (music only)
    const artistCounts = {};
    filteredData
        .filter(item => item.master_metadata_album_artist_name)
        .forEach(item => {
            const artist = item.master_metadata_album_artist_name;
            artistCounts[artist] = (artistCounts[artist] || 0) + 1;
        });

    const topArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    // Process data for top tracks (music only)
    const trackCounts = {};
    filteredData
        .filter(item => item.master_metadata_track_name)
        .forEach(item => {
            const track = item.master_metadata_track_name;
            trackCounts[track] = (trackCounts[track] || 0) + 1;
        });

    const topTracks = Object.entries(trackCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    // Process data for top albums (music only)
    const albumCounts = {};
    filteredData
        .filter(item => item.master_metadata_album_album_name)
        .forEach(item => {
            const album = item.master_metadata_album_album_name;
            albumCounts[album] = (albumCounts[album] || 0) + 1;
        });

    const topAlbums = Object.entries(albumCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    // Process monthly listening time
    const monthlyActivity = {};
    filteredData.forEach(item => {
        const date = new Date(item.ts);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyActivity[monthYear] = (monthlyActivity[monthYear] || 0) + (item.ms_played || 0);
    });

    // Convert milliseconds to hours for better readability
    Object.keys(monthlyActivity).forEach(key => {
        monthlyActivity[key] = Math.round(monthlyActivity[key] / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal place
    });

    // Process time of day activity by day of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeOfDayActivity = daysOfWeek.map(() => Array(24).fill(0));
    const dayCounts = Array(7).fill(0); // Count of days for each day of week
    
    // First pass: count total days for each day of week
    const uniqueDays = new Set();
    filteredData.forEach(item => {
        const date = new Date(item.ts);
        const dayKey = date.toISOString().split('T')[0];
        if (!uniqueDays.has(dayKey)) {
            uniqueDays.add(dayKey);
            dayCounts[date.getDay()]++;
        }
    });
    
    // Second pass: accumulate listening time
    filteredData.forEach(item => {
        const date = new Date(item.ts);
        const dayOfWeek = date.getDay();
        const hour = date.getHours();
        // Convert ms_played to minutes and add to the total
        timeOfDayActivity[dayOfWeek][hour] += (item.ms_played || 0) / (1000 * 60);
    });

    // Calculate average daily listening time for each hour
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            if (dayCounts[day] > 0) {
                timeOfDayActivity[day][hour] = Math.round((timeOfDayActivity[day][hour] / dayCounts[day]) * 10) / 10;
            }
        }
    }

    // Calculate overall average across all days
    const averageActivity = Array(24).fill(0);
    for (let hour = 0; hour < 24; hour++) {
        const sum = timeOfDayActivity.reduce((acc, day) => acc + day[hour], 0);
        averageActivity[hour] = Math.round((sum / 7) * 10) / 10;
    }

    // Process yearly top artists
    const yearlyArtists = {};
    filteredData
        .filter(item => item.master_metadata_album_artist_name)
        .forEach(item => {
            const year = new Date(item.ts).getFullYear();
            const artist = item.master_metadata_album_artist_name;
            
            if (!yearlyArtists[year]) {
                yearlyArtists[year] = {};
            }
            yearlyArtists[year][artist] = (yearlyArtists[year][artist] || 0) + 1;
        });

    // Create charts
    createBarChart('topArtistsChart', 'Top 12 Artists', topArtists);
    createBarChart('topTracksChart', 'Top 12 Tracks', topTracks);
    createBarChart('topAlbumsChart', 'Top 12 Albums', topAlbums);
    createLineChart('monthlyActivityChart', 'Monthly Listening Time (Hours)', monthlyActivity);
    createTimeOfDayChart('timeOfDayChart', 'Average Daily Listening Time (Minutes)', timeOfDayActivity, averageActivity);
    createYearlyArtistsList(yearlyArtists);
}

function createBarChart(canvasId, title, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Register the plugin
    const playCountPlugin = {
        id: 'playCount',
        afterDraw(chart) {
            const ctx = chart.ctx;
            ctx.save();
            ctx.font = '12px "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.textAlign = 'left';
            
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];
                    const x = bar.x + 5;
                    const y = bar.y;
                    ctx.fillText(value.toString(), x, y + 4);
                });
            });
            
            ctx.restore();
        }
    };

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item[0]),
            datasets: [{
                label: 'Number of Plays',
                data: data.map(item => item[1]),
                backgroundColor: 'rgba(29, 185, 84, 0.6)',
                borderColor: 'rgba(29, 185, 84, 0.3)',
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 20,
                maxBarThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                axis: 'y',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        },
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.substring(0, 20) + '...' : label;
                        }
                    }
                }
            }
        },
        plugins: [playCountPlugin]
    });
}

function createLineChart(canvasId, title, data) {
    const sortedData = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
    
    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: title,
                data: sortedData.map(item => item[1]),
                borderColor: 'rgba(29, 185, 84, 0.8)',
                backgroundColor: 'rgba(29, 185, 84, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${title}: ${context.raw} hours`;
                        }
                    }
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createTimeOfDayChart(canvasId, title, data, averageData) {
    const hours = Array.from({length: 24}, (_, i) => {
        const hour = i % 12 || 12;
        const period = i < 12 ? 'AM' : 'PM';
        return `${hour} ${period}`;
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Use light variations of Spotify green for individual days
    const colors = [
        'hsla(141, 73%, 85%, 0.8)',
        'hsla(141, 73%, 80%, 0.8)',
        'hsla(141, 73%, 75%, 0.8)',
        'hsla(141, 73%, 70%, 0.8)',
        'hsla(141, 73%, 65%, 0.8)',
        'hsla(141, 73%, 60%, 0.8)',
        'hsla(141, 73%, 55%, 0.8)'
    ];

    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                // Add individual day lines first
                ...daysOfWeek.map((day, index) => ({
                    label: day,
                    data: data[index],
                    borderColor: colors[index],
                    backgroundColor: colors[index].replace('0.8', '0.1'),
                    borderWidth: 1,
                    fill: false,
                    tension: 0.2,
                    order: 1,
                    pointRadius: 2,
                    pointHoverRadius: 3
                })),
                // Add average line last so it appears on top
                {
                    label: 'Average',
                    data: averageData,
                    borderColor: 'hsla(141, 73%, 35%, 0.9)',
                    backgroundColor: 'hsla(141, 73%, 35%, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    order: 0,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} minutes`;
                        }
                    }
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createYearlyArtistsList(yearlyArtists) {
    const container = document.getElementById('yearlyArtistsList');
    container.innerHTML = ''; // Clear container without adding title

    const list = document.createElement('div');
    list.className = 'yearly-artists-list';

    // Sort years in descending order
    const years = Object.keys(yearlyArtists).sort((a, b) => b - a);

    years.forEach(year => {
        const topArtist = Object.entries(yearlyArtists[year])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1)[0];

        if (topArtist) {
            const [artist, count] = topArtist;
            const yearItem = document.createElement('div');
            yearItem.className = 'year-item';
            yearItem.innerHTML = `
                <span class="year">${year}</span>
                <span class="artist-name">${artist}</span>
            `;
            list.appendChild(yearItem);
        }
    });

    container.appendChild(list);
} 
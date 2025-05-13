let allSpotifyData = [];
let filteredData = [];
const files = [
    '2023.json',
    '2023_5.json',
    '2020_4.json',
    '2019_3.json',
    '2018_2.json',
    '2017_1.json',
    '2015_0.json'
];

// Add event listener to load data when page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupDateFilters();
});

function setupDateFilters() {
    const startYearSelect = document.getElementById('startYear');
    const endYearSelect = document.getElementById('endYear');
    const applyButton = document.getElementById('applyFilter');
    const resetButton = document.getElementById('resetFilter');

    // Get unique years from data
    const years = [...new Set(allSpotifyData.map(item => new Date(item.ts).getFullYear()))].sort((a, b) => a - b);
    
    // Populate year selectors
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

function applyDateFilter() {
    const startYear = parseInt(document.getElementById('startYear').value);
    const endYear = parseInt(document.getElementById('endYear').value);
    
    // Reset filtered data
    filteredData = allSpotifyData.filter(item => {
        const itemYear = new Date(item.ts).getFullYear();
        return itemYear >= startYear && itemYear <= endYear;
    });

    // Clear existing charts before updating
    clearCharts();
    
    // Update visualizations with filtered data
    updateVisualizations();
    updateStats();
}

function clearCharts() {
    // Destroy existing charts
    const chartIds = ['topArtistsChart', 'topTracksChart', 'monthlyActivityChart', 'timeOfDayChart'];
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
    
    const years = [...new Set(allSpotifyData.map(item => new Date(item.ts).getFullYear()))].sort((a, b) => a - b);
    
    startYearSelect.value = years[0];
    endYearSelect.value = years[years.length - 1];
    
    // Reset filtered data to all data
    filteredData = [...allSpotifyData];
    
    // Clear existing charts before updating
    clearCharts();
    
    // Update visualizations with all data
    updateVisualizations();
    updateStats();
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

    // Calculate most played artist
    const artistCounts = {};
    filteredData
        .filter(item => item.master_metadata_album_artist_name)
        .forEach(item => {
            const artist = item.master_metadata_album_artist_name;
            artistCounts[artist] = (artistCounts[artist] || 0) + 1;
        });
    const [mostPlayedArtist, mostPlayedArtistCount] = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    // Calculate most played track
    const trackCounts = {};
    filteredData
        .filter(item => item.master_metadata_track_name)
        .forEach(item => {
            const track = item.master_metadata_track_name;
            trackCounts[track] = (trackCounts[track] || 0) + 1;
        });
    const [mostPlayedTrack, mostPlayedTrackCount] = Object.entries(trackCounts)
        .sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    document.getElementById('totalTracks').textContent = totalTracks.toLocaleString();
    document.getElementById('uniqueArtists').textContent = uniqueArtists.toLocaleString();
    document.getElementById('totalPlayTime').textContent = formatDuration(totalPlayTime);
    document.getElementById('yearsOfData').textContent = years;
    document.getElementById('mostPlayedArtist').textContent = mostPlayedArtistCount.toLocaleString();
    document.getElementById('mostPlayedArtistName').textContent = mostPlayedArtist;
    document.getElementById('mostPlayedTrack').textContent = mostPlayedTrackCount.toLocaleString();
    document.getElementById('mostPlayedTrackName').textContent = mostPlayedTrack;
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

    // Process monthly activity
    const monthlyActivity = {};
    filteredData.forEach(item => {
        const date = new Date(item.ts);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyActivity[monthYear] = (monthlyActivity[monthYear] || 0) + 1;
    });

    // Process time of day activity
    const timeOfDayActivity = Array(24).fill(0);
    filteredData.forEach(item => {
        const hour = new Date(item.ts).getHours();
        timeOfDayActivity[hour] += 1;
    });

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
    createBarChart('topArtistsChart', 'Top 30 Artists', topArtists);
    createBarChart('topTracksChart', 'Top 30 Tracks', topTracks);
    createLineChart('monthlyActivityChart', 'Monthly Activity', monthlyActivity);
    createTimeOfDayChart('timeOfDayChart', 'Listening Time Distribution', timeOfDayActivity);
    createYearlyArtistsList(yearlyArtists);
}

function createBarChart(canvasId, title, data) {
    new Chart(document.getElementById(canvasId), {
        type: 'bar',
        data: {
            labels: data.map(item => item[0]),
            datasets: [{
                label: 'Number of Plays',
                data: data.map(item => item[1]),
                backgroundColor: 'rgba(0, 122, 255, 0.6)',
                borderColor: 'rgba(0, 122, 255, 0.3)',
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 20,
                maxBarThickness: 30
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
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
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createLineChart(canvasId, title, data) {
    const sortedData = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
    
    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Number of Plays',
                data: sortedData.map(item => item[1]),
                borderColor: 'rgba(0, 122, 255, 0.8)',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
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

function createTimeOfDayChart(canvasId, title, data) {
    const hours = Array.from({length: 24}, (_, i) => {
        const hour = i % 12 || 12;
        const period = i < 12 ? 'AM' : 'PM';
        return `${hour} ${period}`;
    });

    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Number of Plays',
                data: data,
                borderColor: 'rgba(0, 122, 255, 0.8)',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
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
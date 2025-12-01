/**
 * ShoreSquad - Main Application JavaScript
 * Handles interactivity, API calls, and dynamic content
 */

// ===== STATE & CONFIG =====
const APP_CONFIG = {
    neaWeatherUrl: 'https://api.data.gov.sg/v1/environment/air-temperature',
    neaForecastUrl: 'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast',
    beachLocations: [
        { id: 1, name: 'Marina Bay Beach', lat: 1.2855, lng: 103.8565, region: 'Singapore' },
        { id: 2, name: 'East Coast Beach', lat: 1.3021, lng: 103.9684, region: 'Singapore' },
        { id: 3, name: 'Sentosa Beach', lat: 1.2479, lng: 103.8305, region: 'Singapore' },
        { id: 4, name: 'Changi Beach', lat: 1.4043, lng: 103.9702, region: 'Singapore' },
        { id: 5, name: 'Pasir Ris Beach', lat: 1.3774, lng: 103.9486, region: 'Singapore' }
    ],
    crewLeaderboard: [
        { rank: 1, name: 'Ocean Warriors', members: 24, cleanupCount: 18, trash: '2.5 tons' },
        { rank: 2, name: 'Beach Guardians', members: 19, cleanupCount: 15, trash: '2.1 tons' },
        { rank: 3, name: 'Coral Protectors', members: 16, cleanupCount: 12, trash: '1.8 tons' },
        { rank: 4, name: 'Tide Riders', members: 12, cleanupCount: 8, trash: '1.2 tons' },
        { rank: 5, name: 'Sand Seekers', members: 10, cleanupCount: 6, trash: '0.9 tons' }
    ]
};

// Sample events data
const SAMPLE_EVENTS = [
    {
        id: 1,
        name: 'Marina Cleanup Drive',
        location: 'Marina Bay Beach',
        date: '2025-12-08',
        time: '09:00 AM',
        attendees: 24,
        description: 'Join us for a community beach cleanup at Marina Bay!'
    },
    {
        id: 2,
        name: 'East Coast Eco Sprint',
        location: 'East Coast Beach',
        date: '2025-12-10',
        time: '10:00 AM',
        attendees: 18,
        description: 'Fast-paced cleanup challenge - bring your crew!'
    },
    {
        id: 3,
        name: 'Sentosa Sea Clean',
        location: 'Sentosa Beach',
        date: '2025-12-15',
        time: '14:00 PM',
        attendees: 32,
        description: 'Large-scale cleanup event with prizes!'
    },
    {
        id: 4,
        name: 'Changi Conservation',
        location: 'Changi Beach',
        date: '2025-12-12',
        time: '08:00 AM',
        attendees: 15,
        description: 'Early bird cleanup session with refreshments'
    },
    {
        id: 5,
        name: 'Pasir Ris Youth Squad',
        location: 'Pasir Ris Beach',
        date: '2025-12-20',
        time: '11:00 AM',
        attendees: 28,
        description: 'Youth-focused cleanup and beach games'
    }
];

// ===== DOM ELEMENTS =====
const elements = {
    exploreBttn: document.getElementById('exploreBttn'),
    eventsContainer: document.getElementById('eventsContainer'),
    weatherContainer: document.getElementById('weatherContainer'),
    leaderboard: document.getElementById('leaderboard'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.querySelector('.search-btn'),
    geoBtn: document.getElementById('geoBtn'),
    joinBtn: document.getElementById('joinBtn'),
    nextCleanupBtn: document.getElementById('nextCleanupBtn'),
    eventModal: document.getElementById('eventModal'),
    modalBody: document.getElementById('modalBody'),
    joinEventBtn: document.getElementById('joinEventBtn'),
    closeModal: document.querySelector('.close-modal'),
    menuToggle: document.querySelector('.menu-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-link')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 ShoreSquad app initialized');
    initializeApp();
});

function initializeApp() {
    // Load initial content
    loadEvents(SAMPLE_EVENTS);
    loadWeather(APP_CONFIG.beachLocations[0]);
    loadLeaderboard();
    initializeMap();
    
    // Attach event listeners
    attachEventListeners();
    
    // Progressive enhancement
    enableMobileMenu();
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
    // Button click handlers
    elements.exploreBttn?.addEventListener('click', () => {
        smoothScroll('#events');
    });
    
    elements.joinBtn?.addEventListener('click', () => {
        alert('Welcome to ShoreSquad! Join us on social media to stay connected.');
    });
    
    // Next cleanup button
    elements.nextCleanupBtn?.addEventListener('click', () => {
        alert('🎉 You\'ve registered for the Pasir Ris Youth Squad cleanup!\n\n📍 Location: Street View Asia, Pasir Ris Beach\n📅 Date: Dec 20, 2025 at 11:00 AM\n\nBring gloves, bags, and your friends! ♻️');
    });
    
    // Search functionality
    elements.searchBtn?.addEventListener('click', handleSearch);
    elements.searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Geolocation
    elements.geoBtn?.addEventListener('click', () => {
        alert('📍 NEA Weather API provides real-time data for Singapore. Your location data is used for reference only.\n\nCurrent data: All Singapore beaches');
    });
    
    // Modal handling
    elements.closeModal?.addEventListener('click', closeEventModal);
    elements.eventModal?.addEventListener('click', (e) => {
        if (e.target === elements.eventModal) closeEventModal();
    });
    
    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            elements.navMenu?.classList.remove('active');
            updateActiveNav(link);
        });
    });
}

// ===== MOBILE MENU =====
function enableMobileMenu() {
    elements.menuToggle?.addEventListener('click', () => {
        elements.navMenu?.classList.toggle('active');
    });
}

// ===== EVENTS LOADING =====
function loadEvents(events) {
    elements.eventsContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        elements.eventsContainer.innerHTML = '<p class="loading">No events found. Check back soon!</p>';
        return;
    }
    
    events.forEach(event => {
        const eventCard = createEventCard(event);
        elements.eventsContainer.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.role = 'listitem';
    card.innerHTML = `
        <div class="event-header">
            <h3>${escapeHtml(event.name)}</h3>
        </div>
        <div class="event-body">
            <p><strong>📍 Location:</strong> ${escapeHtml(event.location)}</p>
            <p><strong>📅 Date:</strong> ${formatDate(event.date)}</p>
            <p><strong>⏰ Time:</strong> ${event.time}</p>
            <p><strong>👥 Attendees:</strong> ${event.attendees} people</p>
            <p>${escapeHtml(event.description)}</p>
            <div class="event-action">
                <button class="event-btn-detail" data-event-id="${event.id}">View Details</button>
                <button class="event-btn-join" data-event-id="${event.id}">Join</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.event-btn-detail')?.addEventListener('click', () => {
        openEventModal(event);
    });
    
    card.querySelector('.event-btn-join')?.addEventListener('click', () => {
        handleJoinEvent(event);
    });
    
    return card;
}

function openEventModal(event) {
    elements.modalBody.innerHTML = `
        <p><strong>Beach:</strong> ${escapeHtml(event.location)}</p>
        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Current Attendees:</strong> ${event.attendees}</p>
        <p><strong>Description:</strong> ${escapeHtml(event.description)}</p>
        <p><em>Bring gloves, bags, and your crew! ♻️</em></p>
    `;
    
    elements.joinEventBtn.onclick = () => {
        handleJoinEvent(event);
    };
    
    elements.eventModal.style.display = 'block';
    elements.eventModal.setAttribute('aria-hidden', 'false');
}

function closeEventModal() {
    elements.eventModal.style.display = 'none';
    elements.eventModal.setAttribute('aria-hidden', 'true');
}

// ===== SEARCH FUNCTIONALITY =====
function handleSearch() {
    const query = elements.searchInput.value.toLowerCase().trim();
    
    if (!query) {
        loadEvents(SAMPLE_EVENTS);
        return;
    }
    
    const filtered = SAMPLE_EVENTS.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
    );
    
    loadEvents(filtered);
}

// ===== WEATHER FUNCTIONALITY =====
function loadWeather(location) {
    // Fetch from NEA's 2-hour weather forecast API
    fetch(APP_CONFIG.neaForecastUrl)
        .then(response => response.json())
        .then(data => {
            const forecasts = data.items[0].forecasts;
            const weatherCards = createWeatherForecast(forecasts);
            elements.weatherContainer.innerHTML = '';
            elements.weatherContainer.appendChild(weatherCards);
        })
        .catch(error => {
            console.error('Weather fetch error:', error);
            elements.weatherContainer.innerHTML = '<p class="loading">Unable to load weather forecast. Please try again later.</p>';
        });
}

function createWeatherForecast(forecasts) {
    const container = document.createElement('div');
    container.className = 'weather-forecast-grid';
    
    // Group forecasts by day (8 entries per day, every 30 minutes = 4 hours of data)
    const dailyForecasts = {};
    
    forecasts.forEach((forecast, index) => {
        const forecastTime = new Date(forecast.timestamp);
        const dayKey = forecastTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = [];
        }
        dailyForecasts[dayKey].push(forecast);
    });
    
    // Create cards for each day (show first forecast of each unique day)
    const dayKeys = Object.keys(dailyForecasts).slice(0, 4); // Show up to 4 days
    
    dayKeys.forEach((day, index) => {
        const forecastArray = dailyForecasts[day];
        // Use the most frequent condition for the day
        const forecast = forecastArray[Math.floor(forecastArray.length / 2)];
        
        const card = document.createElement('div');
        card.className = 'weather-forecast-card';
        
        const weatherIcon = getWeatherIconFromCondition(forecast.forecast);
        const forecastTime = new Date(forecast.timestamp);
        const dayName = forecastTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${weatherIcon}</div>
            <div class="forecast-condition">${escapeHtml(forecast.forecast)}</div>
            <div class="forecast-info">
                <p>📍 ${forecastArray.length} readings available</p>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    return container;
}

function getWeatherIconFromCondition(condition) {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('partly cloudy')) return '⛅';
    if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) return '☁️';
    if (conditionLower.includes('rainy') || conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('thundery')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
    if (conditionLower.includes('haze')) return '💨';
    
    return '🌤️';
}

// ===== LEADERBOARD =====
function loadLeaderboard() {
    elements.leaderboard.innerHTML = '';
    
    APP_CONFIG.crewLeaderboard.forEach((crew, index) => {
        const item = document.createElement('li');
        item.className = 'leaderboard-item' + (index < 3 ? ' top-3' : '');
        item.role = 'listitem';
        
        const medals = ['🥇', '🥈', '🥉'];
        const rankDisplay = index < 3 ? `<span class="rank medal">${medals[index]}</span>` : `<span class="rank">#${crew.rank}</span>`;
        
        item.innerHTML = `
            ${rankDisplay}
            <div class="leaderboard-info">
                <h4>${escapeHtml(crew.name)}</h4>
                <p>👥 ${crew.members} members | 🧹 ${crew.cleanupCount} cleanups | ♻️ ${crew.trash} collected</p>
            </div>
            <div class="leaderboard-score">${crew.cleanupCount * 100} pts</div>
        `;
        
        elements.leaderboard.appendChild(item);
    });
}

// ===== MAP INITIALIZATION =====
let map;
function initializeMap() {
    // Create map centered on Singapore
    map = L.map('map').setView([1.3521, 103.8198], 11);
    
    // Add tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles'
    }).addTo(map);
    
    // Add beach location markers
    APP_CONFIG.beachLocations.forEach(beach => {
        const marker = L.circleMarker([beach.lat, beach.lng], {
            radius: 12,
            fillColor: '#0066CC',
            color: 'white',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
            className: 'beach-marker'
        }).addTo(map);
        
        // Add popup with beach info
        marker.bindPopup(`
            <div class="map-popup">
                <h4>🌊 ${escapeHtml(beach.name)}</h4>
                <p><strong>Region:</strong> ${escapeHtml(beach.region)}</p>
                <p><strong>Coordinates:</strong> ${beach.lat.toFixed(4)}, ${beach.lng.toFixed(4)}</p>
                <button class="map-popup-btn" onclick="smoothScroll('#events')">View Events</button>
            </div>
        `).on('click', function() {
            this.openPopup();
        });
    });
    
    // Handle map resize
    window.addEventListener('resize', () => {
        if (map) {
            map.invalidateSize();
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function handleJoinEvent(event) {
    alert(`🎉 Great! You've joined "${event.name}"\n\nEvent Date: ${formatDate(event.date)} at ${event.time}\nLocation: ${event.location}\n\nCheck your email for details!`);
    closeEventModal();
}

function smoothScroll(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateActiveNav(link) {
    elements.navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== PERFORMANCE: Lazy Loading Images (when added) =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== SERVICE WORKER (PWA Support) =====
if ('serviceWorker' in navigator) {
    // Service worker registration would go here for offline support
    console.log('📱 PWA-ready - Service Worker support available');
}

console.log('✅ ShoreSquad app fully loaded and ready!');

/**
 * ShoreSquad - Main Application JavaScript
 * Handles interactivity, API calls, and dynamic content
 */

// ===== STATE & CONFIG =====
const APP_CONFIG = {
    apiWeatherUrl: 'https://api.open-meteo.com/v1/forecast',
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
    
    // Search functionality
    elements.searchBtn?.addEventListener('click', handleSearch);
    elements.searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Geolocation
    elements.geoBtn?.addEventListener('click', handleGeolocation);
    
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
    // Using Open-Meteo API (free, no key needed)
    fetch(`${APP_CONFIG.apiWeatherUrl}?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,weather_code,wind_speed_10m`)
        .then(response => response.json())
        .then(data => {
            const current = data.current;
            const weatherCard = createWeatherCard(location, current);
            elements.weatherContainer.innerHTML = '';
            elements.weatherContainer.appendChild(weatherCard);
        })
        .catch(error => {
            console.error('Weather fetch error:', error);
            elements.weatherContainer.innerHTML = '<p class="loading">Unable to load weather. Please try again later.</p>';
        });
}

function createWeatherCard(location, weatherData) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    
    const weatherIcon = getWeatherIcon(weatherData.weather_code);
    const condition = getWeatherCondition(weatherData.weather_code);
    
    card.innerHTML = `
        <h3>${escapeHtml(location.name)}</h3>
        <div class="weather-icon">${weatherIcon}</div>
        <div class="weather-temp">${Math.round(weatherData.temperature_2m)}°C</div>
        <div class="weather-condition">${condition}</div>
        <p style="margin-top: 1rem; font-size: 0.9rem;">Wind: ${weatherData.wind_speed_10m} m/s</p>
    `;
    
    return card;
}

function getWeatherIcon(code) {
    // WMO Weather interpretation codes
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '⛈️';
    return '🌤️';
}

function getWeatherCondition(code) {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Showers';
    return 'Unknown';
}

// ===== GEOLOCATION =====
function handleGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Load weather for user's location
            loadWeather({ name: 'Your Location', lat: latitude, lng: longitude });
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Could not access your location. Please check permissions.');
        }
    );
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

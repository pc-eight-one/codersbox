---
title: "Weather Dashboard"
description: "A responsive weather application built with Vue.js and the OpenWeather API. Features 7-day forecasts, location search, and real-time weather updates."
publishDate: 2024-12-15
tech: ["Vue.js", "API", "Responsive Design", "JavaScript"]
github: "https://github.com/johndoe/weather-dashboard"
demo: "https://weather-dashboard-demo.netlify.app"
image: "/images/projects/weather-dashboard.jpg"
featured: true
status: "completed"
---

# Weather Dashboard

A modern, responsive weather application that provides comprehensive weather information with an intuitive user interface. Built with Vue.js 3 and powered by the OpenWeather API.

## 🌟 Features

### Current Weather
- **Real-time weather data** for any location worldwide
- **Temperature, humidity, pressure** and wind information
- **Weather conditions** with descriptive icons
- **Feels-like temperature** and visibility data
- **UV index** with safety recommendations

### 7-Day Forecast
- **Extended weather forecast** for the week ahead
- **Daily temperature ranges** (min/max)
- **Precipitation probability** and expected rainfall
- **Weather condition summaries** for each day

### Location Features
- **GPS location detection** for instant local weather
- **City search** with autocomplete suggestions
- **Recent locations** quick access
- **Favorite locations** for easy switching
- **Map integration** showing weather patterns

### User Experience
- **Responsive design** optimized for all devices
- **Dark/light theme** toggle
- **Celsius/Fahrenheit** temperature switching
- **Offline support** with cached data
- **Loading states** and error handling

## 🛠️ Technologies Used

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Composition API** - Modern Vue.js development approach
- **Vue Router** - Client-side routing
- **Pinia** - State management library
- **Vite** - Fast build tool and development server

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **CSS Grid & Flexbox** - Modern layout techniques

### APIs & Services
- **OpenWeather API** - Weather data provider
- **Geolocation API** - Browser location detection
- **LocalStorage API** - Data persistence
- **Service Worker** - Offline functionality

## 🚀 Key Implementation Details

### API Integration
```javascript
// Weather service with error handling and caching
class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
  }

  async getCurrentWeather(lat, lon) {
    const cacheKey = `current-${lat}-${lon}`;
    
    // Check cache first (5 minute TTL)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}
```

### Responsive Components
```vue
<!-- WeatherCard.vue -->
<template>
  <div class="weather-card bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-bold">{{ location.name }}</h2>
        <p class="text-blue-100">{{ formatDate(weather.dt) }}</p>
      </div>
      <div class="text-right">
        <img 
          :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`"
          :alt="weather.weather[0].description"
          class="w-16 h-16"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-4xl font-bold">{{ Math.round(weather.main.temp) }}°</p>
        <p class="text-blue-100 capitalize">{{ weather.weather[0].description }}</p>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>Feels like:</span>
          <span>{{ Math.round(weather.main.feels_like) }}°</span>
        </div>
        <div class="flex justify-between">
          <span>Humidity:</span>
          <span>{{ weather.main.humidity }}%</span>
        </div>
        <div class="flex justify-between">
          <span>Wind:</span>
          <span>{{ Math.round(weather.wind.speed) }} m/s</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### State Management
```javascript
// stores/weather.js
import { defineStore } from 'pinia';
import { WeatherService } from '@/services/weather';

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null,
    forecast: null,
    favorites: JSON.parse(localStorage.getItem('weatherFavorites') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('weatherRecent') || '[]'),
    loading: false,
    error: null,
    units: localStorage.getItem('weatherUnits') || 'metric'
  }),

  getters: {
    temperature: (state) => {
      if (!state.currentWeather) return null;
      return state.units === 'metric' 
        ? `${Math.round(state.currentWeather.main.temp)}°C`
        : `${Math.round((state.currentWeather.main.temp * 9/5) + 32)}°F`;
    },

    isLocationFavorited: (state) => (location) => {
      return state.favorites.some(fav => 
        fav.lat === location.lat && fav.lon === location.lon
      );
    }
  },

  actions: {
    async fetchWeatherByCoords(lat, lon) {
      this.loading = true;
      this.error = null;

      try {
        const weatherService = new WeatherService();
        
        const [currentWeather, forecast] = await Promise.all([
          weatherService.getCurrentWeather(lat, lon),
          weatherService.getForecast(lat, lon)
        ]);

        this.currentWeather = currentWeather;
        this.forecast = forecast;
        
        // Add to recent searches
        this.addToRecent({
          name: currentWeather.name,
          lat,
          lon,
          country: currentWeather.sys.country
        });
        
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching weather:', error);
      } finally {
        this.loading = false;
      }
    },

    toggleFavorite(location) {
      const index = this.favorites.findIndex(fav => 
        fav.lat === location.lat && fav.lon === location.lon
      );

      if (index >= 0) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(location);
      }

      localStorage.setItem('weatherFavorites', JSON.stringify(this.favorites));
    }
  }
});
```

## 📱 Responsive Design

### Mobile-First Approach
- **Touch-friendly interface** with appropriate tap targets
- **Swipe gestures** for forecast navigation
- **Optimized layouts** for portrait and landscape orientations
- **Fast loading** with progressive image loading

### Tablet & Desktop Enhancements
- **Multi-column layouts** for better space utilization
- **Hover effects** and enhanced interactions
- **Keyboard navigation** support
- **Larger data visualizations** when space allows

## 🔧 Performance Optimizations

### Data Management
- **API response caching** to reduce unnecessary requests
- **Debounced search** to prevent excessive API calls
- **Background updates** for favorite locations
- **Error recovery** with retry mechanisms

### Loading Experience
- **Skeleton screens** during data fetching
- **Progressive loading** of forecast data
- **Optimistic updates** for user interactions
- **Offline fallbacks** with cached data

### Code Optimization
- **Lazy loading** of non-critical components
- **Tree shaking** to minimize bundle size
- **Image optimization** with appropriate formats
- **Service worker** for caching and offline support

## 🧪 Testing Strategy

### Unit Testing
```javascript
// tests/components/WeatherCard.test.js
import { mount } from '@vue/test-utils';
import WeatherCard from '@/components/WeatherCard.vue';

describe('WeatherCard', () => {
  const mockWeatherData = {
    name: 'London',
    main: { temp: 22, feels_like: 24, humidity: 65 },
    weather: [{ description: 'partly cloudy', icon: '02d' }],
    wind: { speed: 3.5 },
    dt: 1640995200
  };

  it('displays weather information correctly', () => {
    const wrapper = mount(WeatherCard, {
      props: { weather: mockWeatherData, location: { name: 'London' } }
    });

    expect(wrapper.text()).toContain('London');
    expect(wrapper.text()).toContain('22°');
    expect(wrapper.text()).toContain('partly cloudy');
    expect(wrapper.text()).toContain('65%');
  });

  it('converts temperature units correctly', async () => {
    const wrapper = mount(WeatherCard, {
      props: { weather: mockWeatherData, units: 'imperial' }
    });

    // Should show Fahrenheit when units prop is 'imperial'
    expect(wrapper.text()).toContain('72°'); // 22°C = 72°F
  });
});
```

### Integration Testing
- **API integration tests** with mock responses
- **User flow testing** for complete weather lookup
- **Error handling verification** for network failures
- **Cross-browser compatibility** testing

## 🌍 Accessibility Features

### Screen Reader Support
- **Semantic HTML** structure
- **ARIA labels** for interactive elements
- **Alt text** for weather icons and images
- **Focus management** for keyboard navigation

### Visual Accessibility
- **High contrast** theme option
- **Large text** support
- **Color-blind friendly** color schemes
- **Reduced motion** preferences respected

## 🚀 Deployment & CI/CD

### Build Process
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:unit
    
    - name: Build application
      run: npm run build
      env:
        VITE_WEATHER_API_KEY: ${{ secrets.WEATHER_API_KEY }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=dist
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📈 Lessons Learned

### Technical Insights
- **Vue 3 Composition API** provides better code organization for complex state
- **Pinia** offers excellent TypeScript support and dev tools integration
- **API caching strategies** significantly improve user experience
- **Progressive enhancement** ensures functionality across all devices

### User Experience
- **Weather data visualization** benefits from clear visual hierarchy
- **Location-based features** require careful permission handling
- **Offline support** is crucial for weather applications
- **Loading states** prevent user confusion during data fetching

### Performance
- **Bundle size optimization** is critical for mobile users
- **Image lazy loading** improves initial page load times
- **Service workers** enable reliable offline experiences
- **Error boundaries** prevent complete application failures

## 🔮 Future Enhancements

### Planned Features
- **Weather alerts** and severe weather notifications
- **Historical weather data** and trends
- **Weather maps** with radar and satellite imagery
- **Social sharing** of weather conditions
- **Widget embeds** for other websites

### Technical Improvements
- **PWA conversion** for native app-like experience
- **Push notifications** for weather alerts
- **GraphQL integration** for more efficient data fetching
- **Micro-frontend architecture** for better scalability

This weather dashboard demonstrates modern web development practices while solving a real-world problem. The combination of Vue.js, thoughtful UX design, and robust error handling creates a reliable and enjoyable weather application.
# Weather Patterns Visualization

An interactive Vue.js application that visualizes temperature and rainfall patterns, comparing current weather data with historical data from last year and 5 years ago.

## Features

- **Historical Weather Comparison**: View current weather patterns alongside data from last year and 5 years ago
- **Temperature Visualization**: Interactive line charts showing temperature trends over a 30-day period
- **Rainfall Data**: Bar charts displaying daily rainfall amounts and total precipitation
- **Statistical Analysis**: View average temperatures and total rainfall for each time period
- **Interactive Charts**: Zoom, pan, and hover for detailed information
- **Data Caching**: Local storage caching to improve performance and reduce API calls
- **Responsive Design**: Works on desktop and mobile devices

## Weather Data

This application uses the Open-Meteo Historical Forecast API to retrieve weather data for:

- Current 30-day period
- Same period from last year
- Same period from 5 years ago

The application displays:

- Hourly temperature data as line charts
- Daily rainfall as bar charts
- Average temperatures and total rainfall for each time period

Data is cached locally to improve performance and reduce API calls.

## License

MIT

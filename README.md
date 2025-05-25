<div align="center">
  <img src="public/logo.svg" alt="Is It Supposed To Be This Hot? Logo" width="200">
  
  # is-it-supposed-to-be-this-hot
</div>

The title of the project is a bit of a joke, but kinda not. Sometimes when we randomly get Feburary 90 degree days or monsoon weather in Austin, TX, and I ask myself how normal that is. This project is basically a customized view of historical weather data for my area (hard-coded) because I was tired of trying to find native data sources and visualizations. Most of them just didn't really give me exactly what I was looking for, so here we go.

_Most of this was done by Claude 3.7, so you can judge the code, but ""It wasn't me" - Shaggy - Chase"_

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

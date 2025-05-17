# Temperature Pattern Visualization

A Vue.js application that visualizes temperature patterns by zip code, showing current temperatures alongside historical data, last year's temperatures, 5-year averages, and record highs and lows.

## Features

- **Zip Code Based Weather Data**: Enter any US zip code to view temperature data
- **Interactive Charts**: Visualize temperature patterns with interactive charts
- **Historical Comparison**: Compare current temperatures with historical data
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Vue 3**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Apache ECharts**: Data visualization library
- **Axios**: HTTP client for API requests
- **Vite**: Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd avg-weather
```

2. Install dependencies

```bash
npm install
```

3. Set up OpenWeatherMap API key
   - Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
   - Open `src/services/weatherService.js` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

Create a production build:

```bash
npm run build
```

The build files will be in the `dist` directory.

## Usage

1. Enter a valid 5-digit US zip code in the input field
2. Click the Submit button or press Enter
3. View the temperature visualization chart
4. Interact with the chart to zoom, pan, or hover over data points for more information

## Note About Weather Data

For demonstration purposes, this application uses mock data that simulates realistic weather patterns. In a production environment, you would connect to the OpenWeatherMap API or another weather data provider to fetch real weather data.

## License

MIT

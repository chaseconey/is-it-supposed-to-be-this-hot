## Avg Weather App

This application should be a simple app that helps visualize temperature patterns for a specific zip code. When the user types in their zip code, we will use that to look up weather data. We will then use that raw data to display visualizations.

The datapoints we are interested in getting:

- The hourly forecast from yesterday, today, and the forecast for the next 3 days
  - For each hour, we want the high and low

These data points should be compared to:

- The same dates and data for the previous year
- The same dates average over the last 5 years
- The record high and low (I know for this we won't have hour by hour data, so let's try and find a different way to visualize this)

All of this data should be on a single line chart that plots the lines for each hour over the whole time period.

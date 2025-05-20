# MLB Batting Average Visualization

A web application that visualizes MLB player batting averages for the current season using Chart.js.

## Overview

This project retrieves batting average statistics from the MLB Stats API and creates a 2D visualization of player batting averages. The visualization presents the data in a clean, interactive bar chart format with color-coded bars representing different batting average ranges.

## Features

- Displays static batting average data for MLB players
- Visualizes data in a clean 2D bar chart using Chart.js
- Color-codes players based on batting average tiers with legend
- Shows detailed statistics including league average, best batters, and team representation
- Responsive design that works across different device sizes

## Technologies Used

- HTML5/CSS3
- JavaScript (ES6+)
- Chart.js for data visualization
- MLB Stats API for baseball statistics (with local fallback)

## Getting Started

To run this project locally:

1. Clone the repository
2. Open `index.html` in a web browser
3. The visualization will automatically load with 2025 season data

## Project Structure

- `index.html` - Main HTML file
- `css/styles.css` - Stylesheet
- `js/api.js` - MLB Stats API client with fallback mechanism
- `js/visualization.js` - Chart.js visualization implementation
- `js/app.js` - Main application logic

## Future Enhancements

- Add more seasons of historical batting data
- Implement player search functionality
- Add more statistical categories (OPS, SLG, etc.)
- Include player photos or team logos in the visualization
- Allow comparison between multiple seasons
- Add animations for transition between different datasets

## Limitations

- API rate limits may apply when fetching data
- Fallback to mock data if API is unavailable
- The visualization displays a maximum of 30 data points for clarity
- Only shows qualified batters (enough at-bats to be eligible for batting title)

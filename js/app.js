/**
 * Main application script for MLB Batting Average Visualization
 * Initializes components and handles user interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const visualizer = new BattingVisualizer('visualization-container');
    const fetchButton = document.getElementById('fetch-data');
    const seasonSelect = document.getElementById('season-select');
    const loadingElement = document.getElementById('loading');
    
    /**
     * Toggle the loading indicator
     * @param {boolean} isLoading - Whether data is being loaded
     */
    function toggleLoading(isLoading) {
        if (isLoading) {
            loadingElement.classList.remove('hidden');
            visualizer.showLoading();
        } else {
            loadingElement.classList.add('hidden');
        }
    }
    
    /**
     * Fetch batting statistics and update visualization
     */
    async function fetchAndVisualizeData() {
        const season = seasonSelect.value;
        
        toggleLoading(true);
        
        try {
            // Fetch player batting statistics
            const response = await mlbStatsClient.getPlayerBattingStats(season);
            const data = mlbStatsClient.extractBattingData(response);
            
            // Update visualization with fetched data
            visualizer.updateVisualization(data);
            
            // Log data for debugging
            console.log('Batting Average Data:', data);
            
            // Display stats in the stats-info section
            updateStatsInfo(data);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            
            // Show error in visualization
            visualizer.clearObjects();
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = `Error loading data: ${error.message}`;
            
            const container = document.getElementById('visualization-container');
            container.innerHTML = '';
            container.appendChild(errorMessage);
            
        } finally {
            toggleLoading(false);
        }
    }
    
    /**
     * Update stats information panel with calculated insights
     * @param {Array} data - Batting average data
     */
    function updateStatsInfo(data) {
        const statsInfo = document.getElementById('stats-info');
        
        if (!data || data.length === 0) {
            statsInfo.innerHTML = '<h2>No Batting Data Available</h2>';
            return;
        }
        
        // Calculate some basic statistics
        const avgBattingAvg = data.reduce((sum, item) => sum + item.avg, 0) / data.length;
        const maxAvg = Math.max(...data.map(item => item.avg));
        const minAvg = Math.min(...data.map(item => item.avg));
        
        // Get players with best and worst batting averages
        const bestBatter = data.reduce((prev, current) => 
            (prev.avg > current.avg) ? prev : current);
        
        const worstBatter = data.reduce((prev, current) => 
            (prev.avg < current.avg) ? prev : current);
        
        // Count players in different batting average ranges
        const eliteBatters = data.filter(player => player.avg >= 0.300).length;
        const goodBatters = data.filter(player => player.avg >= 0.280 && player.avg < 0.300).length;
        const avgBatters = data.filter(player => player.avg >= 0.250 && player.avg < 0.280).length;
        
        // Format statistics for display
        statsInfo.innerHTML = `
            <h2>Batting Average Statistics for 2025 Season</h2>
            <p>These statistics show the batting averages of top MLB players for the 2025 season.</p>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>League Average</h3>
                    <p>${avgBattingAvg.toFixed(3)}</p>
                </div>
                <div class="stat-item">
                    <h3>Best Batter</h3>
                    <p>${bestBatter.avg.toFixed(3)} (${bestBatter.name})</p>
                </div>
                <div class="stat-item">
                    <h3>Elite Batters</h3>
                    <p>${eliteBatters} players hitting .300+</p>
                </div>
                <div class="stat-item">
                    <h3>Team Representation</h3>
                    <p>${new Set(data.map(player => player.team)).size} teams have top hitters</p>
                </div>
            </div>
            
            <p class="weirdness-note">
                Fun Fact: Batting average was the primary offensive statistic in baseball for many decades,
                though modern analytics often favor OPS (On-base Plus Slugging) as a better indicator of 
                offensive value. A .300 batting average is still considered an excellent achievement in 
                modern baseball.
            </p>
        `;
        
        // Add some CSS for the stats grid
        if (!document.getElementById('stats-grid-style')) {
            const style = document.createElement('style');
            style.id = 'stats-grid-style';
            style.textContent = `
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                .stat-item {
                    background-color: #f8f8f8;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .stat-item h3 {
                    margin-top: 0;
                    color: #041e42;
                }
                .weirdness-note {
                    background-color: #fffacd;
                    padding: 12px;
                    border-radius: 8px;
                    font-style: italic;
                }
                .error-message {
                    color: #d32f2f;
                    padding: 20px;
                    text-align: center;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Event listeners
    fetchButton.addEventListener('click', fetchAndVisualizeData);
    
    // Auto-fetch data when the page loads
    fetchAndVisualizeData();
});

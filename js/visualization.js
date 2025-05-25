/**
 * MLB Batting Average Visualization using Chart.js
 * Creates and manages 2D visualization of batting statistics
 */

class BattingVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.data = null;
        this.chart = null;
        
        // Create canvas element for Chart.js
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        
        // Team color functions
        this.getTeamColor = (teamName) => {
            const colors = getTeamColors(teamName);
            return colors ? colors.primary : '#666666';
        };
        
        this.getTeamSecondaryColor = (teamName) => {
            const colors = getTeamColors(teamName);
            return colors ? colors.secondary : '#CCCCCC';
        };
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
    
    /**
     * Group players by team
     * @param {Array} data - Player data
     * @returns {Object} - Object with team names as keys and arrays of players as values
     */
    groupPlayersByTeam(data) {
        const teams = {};
        
        data.forEach(player => {
            if (!teams[player.team]) {
                teams[player.team] = [];
            }
            teams[player.team].push(player);
        });
        
        return teams;
    }
    
    /**
     * Update visualization with new data
     * @param {Array} data - Batting average data to visualize
     */
    updateVisualization(data) {
        // Store data reference
        this.data = data;
        
        // Limit to top players for better visualization
        const visData = data.slice(0, 30);
        
        // Sort players by batting average for better visualization
        visData.sort((a, b) => b.avg - a.avg);
        
        // Prepare data for Chart.js
        const labels = visData.map(player => player.name);
        const avgValues = visData.map(player => player.avg);
        const backgroundColors = visData.map(player => this.getTeamColor(player.team));
        const borderColors = visData.map(player => this.getTeamSecondaryColor(player.team));
        
        // Create team-based legend data
        const teams = {};
        visData.forEach(player => {
            teams[player.team] = this.getTeamColor(player.team);
        });
        
        // If we already have a chart, destroy it before creating a new one
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Store the original colors for restoring after hover
        this.originalBackgroundColors = [...backgroundColors];
        this.originalBorderColors = [...borderColors];
        
        // Create the chart
        const ctx = this.canvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Batting Average',
                    data: avgValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'MLB Batting Average (2025)',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        filter: (tooltipItem) => {
                            // Get the team of the hovered player
                            const hoveredIndex = tooltipItem.dataIndex;
                            const hoveredTeam = visData[hoveredIndex].team;
                            
                            // Only show tooltips for players on the same team
                            return visData[tooltipItem.dataIndex].team === hoveredTeam;
                        },
                        callbacks: {
                            title: (tooltipItems) => {
                                if (tooltipItems.length === 0) return '';
                                const playerIndex = tooltipItems[0].dataIndex;
                                const player = visData[playerIndex];
                                const teamName = player.team;
                                
                                // Return the team name as the title
                                return `Team: ${teamName}`;
                            },
                            label: (tooltipItem) => {
                                const playerIndex = tooltipItem.dataIndex;
                                const player = visData[playerIndex];
                                return `${player.name}: ${player.avg.toFixed(3)} AVG (${player.hits}/${player.atBats})`;
                            },
                            afterLabel: (tooltipItem) => {
                                const playerIndex = tooltipItem.dataIndex;
                                const player = visData[playerIndex];
                                return [
                                    `HR: ${player.homeRuns}`,
                                    `RBI: ${player.rbi}`
                                ];
                            }
                        },
                        backgroundColor: (tooltipItem) => {
                            if (tooltipItem.tooltip.dataPoints.length > 0) {
                                const playerIndex = tooltipItem.tooltip.dataPoints[0].dataIndex;
                                return this.getTeamColor(visData[playerIndex].team);
                            }
                            return 'rgba(0, 0, 0, 0.8)';
                        },
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 12,
                        bodyFont: {
                            weight: 'bold'
                        },
                        titleFont: {
                            weight: 'bold',
                            size: 14
                        },
                        bodySpacing: 6,
                        cornerRadius: 6
                    }
                },
                onHover: (event, activeElements) => {
                    // Reset all bars to original colors
                    this.resetBarColors();
                    
                    if (activeElements && activeElements.length > 0) {
                        // Get the hovered bar's index and the player's team
                        const index = activeElements[0].index;
                        const hoveredTeam = visData[index].team;
                        
                        // Highlight bars from the same team, fade others
                        this.highlightTeam(hoveredTeam, visData);
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0.250, // Most MLB averages are above .250
                        max: 0.350, // Few go above .350
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(3);
                            }
                        },
                        title: {
                            display: true,
                            text: 'Batting Average'
                        }
                    },
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 45
                        },
                        title: {
                            display: true,
                            text: 'Player'
                        }
                    }
                }
            }
        });
        
        // Add custom team legend
        this.addTeamLegend(teams);
        
        // Add players table below chart
        this.addPlayerTable(visData);
        
        // Add event listener for when mouse leaves the chart to reset colors
        this.canvas.addEventListener('mouseleave', () => {
            this.resetBarColors();
        });
    }
    
    /**
     * Reset all bar colors to their original state
     */
    resetBarColors() {
        if (this.chart && this.originalBackgroundColors) {
            this.chart.data.datasets[0].backgroundColor = [...this.originalBackgroundColors];
            this.chart.data.datasets[0].borderColor = [...this.originalBorderColors];
            this.chart.update();
        }
    }
    
    /**
     * Highlight bars for a specific team, fade others
     * @param {string} teamToHighlight - Team name to highlight
     * @param {Array} players - Player data
     */
    highlightTeam(teamToHighlight, players) {
        if (!this.chart || !this.originalBackgroundColors) return;
        
        // Create new arrays for the updated colors
        const newBackgroundColors = [...this.originalBackgroundColors];
        const newBorderColors = [...this.originalBorderColors];
        
        // Modify colors based on team
        players.forEach((player, index) => {
            if (player.team !== teamToHighlight) {
                // Fade out other teams
                newBackgroundColors[index] = this.fadeColor(this.originalBackgroundColors[index]);
                newBorderColors[index] = this.fadeColor(this.originalBorderColors[index]);
            } else {
                // Highlight same team (could add a glow or brightness effect here)
                newBackgroundColors[index] = this.originalBackgroundColors[index];
                newBorderColors[index] = this.originalBorderColors[index];
            }
        });
        
        // Update chart colors
        this.chart.data.datasets[0].backgroundColor = newBackgroundColors;
        this.chart.data.datasets[0].borderColor = newBorderColors;
        this.chart.update();
    }
    
    /**
     * Convert a color to a faded version
     * @param {string} color - Original color (hex or rgb)
     * @returns {string} - Faded color with reduced opacity
     */
    fadeColor(color) {
        // If it's a hex color, convert to rgba
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.2)`;
        }
        // If it's already rgb/rgba, modify opacity
        else if (color.startsWith('rgb')) {
            if (color.startsWith('rgba')) {
                // Replace the last opacity value
                return color.replace(/[\d\.]+\)$/, '0.2)');
            } else {
                // Convert rgb to rgba
                return color.replace(')', ', 0.2)').replace('rgb', 'rgba');
            }
        }
        return color; // Return original if format not recognized
    }
    
    /**
     * Add a custom legend showing team colors
     * @param {Object} teams - Object with team names as keys and colors as values
     */
    addTeamLegend(teams) {
        // Check if legend already exists, remove if it does
        const existingLegend = document.getElementById('team-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // Create legend container
        const legendContainer = document.createElement('div');
        legendContainer.id = 'team-legend';
        legendContainer.style.display = 'flex';
        legendContainer.style.flexWrap = 'wrap';
        legendContainer.style.justifyContent = 'center';
        legendContainer.style.margin = '10px 0';
        legendContainer.style.padding = '10px';
        legendContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        legendContainer.style.borderRadius = '5px';
        
        // Add each team to the legend
        Object.keys(teams).sort().forEach(teamName => {
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.margin = '5px 10px';
            
            const colorBox = document.createElement('div');
            colorBox.style.width = '12px';
            colorBox.style.height = '12px';
            colorBox.style.backgroundColor = teams[teamName];
            colorBox.style.marginRight = '5px';
            
            const label = document.createElement('span');
            label.textContent = teamName;
            label.style.fontSize = '0.8em';
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });
        
        // Add legend to the container after the canvas but before the player table
        this.container.insertBefore(legendContainer, document.getElementById('players-table'));
    }
    
    /**
     * Add player table below chart
     * @param {Array} players - All players to display in the table
     */
    addPlayerTable(players) {
        // Check if table already exists, remove if it does
        const existingTable = document.getElementById('players-table');
        if (existingTable) {
            existingTable.remove();
        }
        
        // Create table container and heading
        const tableContainer = document.createElement('div');
        tableContainer.id = 'players-table';
        tableContainer.style.margin = '20px 0';
        tableContainer.style.maxHeight = '250px';
        tableContainer.style.overflowY = 'auto';
        
        const tableHeading = document.createElement('h3');
        tableHeading.textContent = 'Top 30 MLB Batters (2025)';
        tableHeading.style.textAlign = 'center';
        tableHeading.style.marginBottom = '10px';
        
        // Create table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Rank', 'Player', 'Team', 'AVG', 'At Bats', 'Hits', 'HR', 'RBI'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.padding = '8px';
            th.style.backgroundColor = '#f2f2f2';
            th.style.borderBottom = '1px solid #ddd';
            th.style.position = 'sticky';
            th.style.top = '0';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Sort players by batting average for the table view
        const sortedPlayers = [...players].sort((a, b) => b.avg - a.avg);
        
        sortedPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #ddd';
            
            // Add zebra striping
            if (index % 2 === 0) {
                row.style.backgroundColor = '#f9f9f9';
            }
            
            // Get team colors for the row styling
            const teamColors = getTeamColors(player.team);
            
            // Add rank column
            const rankCell = document.createElement('td');
            rankCell.textContent = (index + 1);
            rankCell.style.padding = '8px';
            rankCell.style.textAlign = 'center';
            row.appendChild(rankCell);
            
            // Add player name column
            const nameCell = document.createElement('td');
            nameCell.textContent = player.name;
            nameCell.style.padding = '8px';
            nameCell.style.fontWeight = 'bold';
            row.appendChild(nameCell);
            
            // Add team column with team color
            const teamCell = document.createElement('td');
            teamCell.textContent = player.team;
            teamCell.style.padding = '8px';
            teamCell.style.backgroundColor = teamColors.primary;
            teamCell.style.color = 'white';
            teamCell.style.borderRadius = '4px';
            teamCell.style.textAlign = 'center';
            row.appendChild(teamCell);
            
            // Add batting average column
            const avgCell = document.createElement('td');
            avgCell.textContent = player.avg.toFixed(3);
            avgCell.style.padding = '8px';
            avgCell.style.textAlign = 'center';
            avgCell.style.fontWeight = 'bold';
            row.appendChild(avgCell);
            
            // Add at bats column
            const atBatsCell = document.createElement('td');
            atBatsCell.textContent = player.atBats;
            atBatsCell.style.padding = '8px';
            atBatsCell.style.textAlign = 'center';
            row.appendChild(atBatsCell);
            
            // Add hits column
            const hitsCell = document.createElement('td');
            hitsCell.textContent = player.hits;
            hitsCell.style.padding = '8px';
            hitsCell.style.textAlign = 'center';
            row.appendChild(hitsCell);
            
            // Add home runs column
            const hrCell = document.createElement('td');
            hrCell.textContent = player.homeRuns;
            hrCell.style.padding = '8px';
            hrCell.style.textAlign = 'center';
            row.appendChild(hrCell);
            
            // Add RBI column
            const rbiCell = document.createElement('td');
            rbiCell.textContent = player.rbi;
            rbiCell.style.padding = '8px';
            rbiCell.style.textAlign = 'center';
            row.appendChild(rbiCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Add table to container
        tableContainer.appendChild(tableHeading);
        tableContainer.appendChild(table);
        
        // Add table to visualization container
        this.container.appendChild(tableContainer);
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        // Clear the container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        // Add back the canvas
        this.container.appendChild(this.canvas);
        
        // Show loading message on the canvas
        const ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw loading message
        ctx.fillStyle = '#333333';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading batting statistics...', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    /**
     * Clear visualization
     */
    clearObjects() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Clear any custom legend
        const existingLegend = document.getElementById('custom-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
    }
}

// Export as global variable
window.BattingVisualizer = BattingVisualizer;

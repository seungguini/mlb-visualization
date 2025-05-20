/**
 * MLB Stats module
 * Handles access to MLB player statistics through API
 */

class MlbStatsClient {
    constructor() {
        // MLB Stats API base URL
        this.baseUrl = 'https://statsapi.mlb.com/api';
        this.version = 'v1';
    }

    /**
     * Build full API URL with query parameters
     * @param {string} endpoint - API endpoint path
     * @param {Object} params - Query parameters 
     * @returns {string} - Full URL
     */
    buildUrl(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}/${this.version}/${endpoint}`);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return url.toString();
    }

    /**
     * Fetch data from MLB Stats API
     * @param {string} url - Full API URL
     * @returns {Promise<Object>} - Promise resolving to API response
     */
    async fetchData(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching data from MLB API:', error);
            throw error;
        }
    }

    /**
     * Get qualified hitters' batting stats for a season
     * @param {number} season - MLB season year
     * @returns {Promise<Object>} - Promise resolving to batting statistics
     */
    async getPlayerBattingStats(season) {
        try {
            // Use season passed in, default to 2025 if not provided
            const seasonYear = season || 2025;
            
            // MLB Stats API endpoint for qualified hitters' batting stats
            const url = this.buildUrl('stats', {
                stats: 'season',
                season: seasonYear,
                sportId: 1, // MLB
                group: 'hitting',
                playerPool: 'qualified',
                sort: 'battingAverage',
                order: 'desc',
                limit: 30 // Top 30 batters by average
            });
            
            console.log('Fetching MLB batting stats from: ', url);
            const data = await this.fetchData(url);
            
            // If API call succeeded but no data returned, fall back to mock data
            if (!data || !data.stats || !data.stats[0] || !data.stats[0].splits || data.stats[0].splits.length === 0) {
                console.warn('No data returned from API, using mock data');
                return this.getMockBattingStats(seasonYear);
            }
            
            return data;
            
        } catch (error) {
            console.error('Error getting batting stats, falling back to mock data:', error);
            // Fall back to mock data in case of API errors
            return this.getMockBattingStats(season);
        }
    }

    /**
     * Extract batting statistics from API response
     * @param {Object} data - API response
     * @returns {Array} - Processed batting data for visualization
     */
    extractBattingData(data) {
        try {
            // Try to extract from API response first
            if (data.stats && data.stats.length > 0) {
                const hittingStats = data.stats.find(stat => stat.group?.displayName === 'hitting');
                
                if (hittingStats && hittingStats.splits && hittingStats.splits.length > 0) {
                    return hittingStats.splits.map(split => {
                        const player = split.player || {};
                        const team = split.team || {};
                        const stats = split.stat || {};
                        
                        return {
                            id: player.id,
                            name: player.fullName || player.lastName || player.name || 'Unknown Player',
                            team: team.name || 'Unknown Team',
                            avg: parseFloat(stats.avg || stats.battingAverage || 0),
                            atBats: parseInt(stats.atBats || 0, 10),
                            hits: parseInt(stats.hits || 0, 10),
                            homeRuns: parseInt(stats.homeRuns || 0, 10),
                            rbi: parseInt(stats.rbi || 0, 10)
                        };
                    }).sort((a, b) => b.avg - a.avg);
                }
            }
            
            // If we can't extract from API response, check if it's our mock data
            if (data.playerBattingStats && Array.isArray(data.playerBattingStats)) {
                // Ensure numeric values for the mock data too
                return data.playerBattingStats.map(player => ({
                    ...player,
                    avg: parseFloat(player.avg),
                    atBats: parseInt(player.atBats, 10),
                    hits: parseInt(player.hits, 10),
                    homeRuns: parseInt(player.homeRuns, 10),
                    rbi: parseInt(player.rbi, 10)
                })).sort((a, b) => b.avg - a.avg);
            }
            
            throw new Error('Could not extract batting data from response');
            
        } catch (error) {
            console.error('Error extracting batting average data:', error);
            return [];
        }
    }

    /**
     * Get mock batting statistics for fallback
     * @param {number} season - MLB season year
     * @returns {Promise<Object>} - Promise resolving to mock batting statistics
     */
    getMockBattingStats(season) {
        return Promise.resolve({
            "season": season || 2025,
            "playerBattingStats": [
                {
                    "id": 1,
                    "name": "Luis Arraez",
                    "team": "San Diego Padres",
                    "avg": 0.329,
                    "atBats": 432,
                    "hits": 142,
                    "homeRuns": 8,
                    "rbi": 52
                },
                {
                    "id": 2,
                    "name": "Freddie Freeman",
                    "team": "Los Angeles Dodgers",
                    "avg": 0.318,
                    "atBats": 408,
                    "hits": 130,
                    "homeRuns": 25,
                    "rbi": 82
                },
                {
                    "id": 3,
                    "name": "Vladimir Guerrero Jr.",
                    "team": "Toronto Blue Jays",
                    "avg": 0.317,
                    "atBats": 420,
                    "hits": 133,
                    "homeRuns": 30,
                    "rbi": 93
                },
                {
                    "id": 4,
                    "name": "Bobby Witt Jr.",
                    "team": "Kansas City Royals",
                    "avg": 0.315,
                    "atBats": 425,
                    "hits": 134,
                    "homeRuns": 23,
                    "rbi": 75
                },
                {
                    "id": 5,
                    "name": "Corey Seager",
                    "team": "Texas Rangers",
                    "avg": 0.313,
                    "atBats": 402,
                    "hits": 126,
                    "homeRuns": 32,
                    "rbi": 94
                },
                {
                    "id": 6,
                    "name": "Steven Kwan",
                    "team": "Cleveland Guardians",
                    "avg": 0.310,
                    "atBats": 415,
                    "hits": 129,
                    "homeRuns": 9,
                    "rbi": 48
                },
                {
                    "id": 7,
                    "name": "Mookie Betts",
                    "team": "Los Angeles Dodgers",
                    "avg": 0.307,
                    "atBats": 401,
                    "hits": 123,
                    "homeRuns": 24,
                    "rbi": 82
                },
                {
                    "id": 8,
                    "name": "Juan Soto",
                    "team": "New York Yankees",
                    "avg": 0.305,
                    "atBats": 390,
                    "hits": 119,
                    "homeRuns": 35,
                    "rbi": 99
                },
                {
                    "id": 9,
                    "name": "Gunnar Henderson",
                    "team": "Baltimore Orioles",
                    "avg": 0.304,
                    "atBats": 413,
                    "hits": 126,
                    "homeRuns": 28,
                    "rbi": 86
                },
                {
                    "id": 10,
                    "name": "Yordan Alvarez",
                    "team": "Houston Astros",
                    "avg": 0.302,
                    "atBats": 386,
                    "hits": 117,
                    "homeRuns": 33,
                    "rbi": 97
                },
                {
                    "id": 11,
                    "name": "Shohei Ohtani",
                    "team": "Los Angeles Dodgers",
                    "avg": 0.299,
                    "atBats": 398,
                    "hits": 119,
                    "homeRuns": 40,
                    "rbi": 104
                },
                {
                    "id": 12,
                    "name": "Michael Harris II",
                    "team": "Atlanta Braves",
                    "avg": 0.298,
                    "atBats": 408,
                    "hits": 122,
                    "homeRuns": 18,
                    "rbi": 70
                },
                {
                    "id": 13,
                    "name": "Corbin Carroll",
                    "team": "Arizona Diamondbacks",
                    "avg": 0.297,
                    "atBats": 400,
                    "hits": 119,
                    "homeRuns": 20,
                    "rbi": 66
                },
                {
                    "id": 14,
                    "name": "Francisco Lindor",
                    "team": "New York Mets",
                    "avg": 0.295,
                    "atBats": 418,
                    "hits": 123,
                    "homeRuns": 27,
                    "rbi": 85
                },
                {
                    "id": 15,
                    "name": "Rafael Devers",
                    "team": "Boston Red Sox",
                    "avg": 0.293,
                    "atBats": 412,
                    "hits": 121,
                    "homeRuns": 32,
                    "rbi": 88
                },
                {
                    "id": 16,
                    "name": "Bryce Harper",
                    "team": "Philadelphia Phillies",
                    "avg": 0.292,
                    "atBats": 410,
                    "hits": 120,
                    "homeRuns": 31,
                    "rbi": 92
                },
                {
                    "id": 17,
                    "name": "Kyle Tucker",
                    "team": "Houston Astros",
                    "avg": 0.290,
                    "atBats": 405,
                    "hits": 117,
                    "homeRuns": 29,
                    "rbi": 89
                },
                {
                    "id": 18,
                    "name": "Aaron Judge",
                    "team": "New York Yankees",
                    "avg": 0.289,
                    "atBats": 400,
                    "hits": 116,
                    "homeRuns": 45,
                    "rbi": 107
                },
                {
                    "id": 19,
                    "name": "Elly De La Cruz",
                    "team": "Cincinnati Reds",
                    "avg": 0.287,
                    "atBats": 395,
                    "hits": 113,
                    "homeRuns": 25,
                    "rbi": 72
                },
                {
                    "id": 20,
                    "name": "Julio Rodriguez",
                    "team": "Seattle Mariners",
                    "avg": 0.286,
                    "atBats": 405,
                    "hits": 116,
                    "homeRuns": 26,
                    "rbi": 81
                },
                {
                    "id": 21,
                    "name": "Jackson Holliday",
                    "team": "Baltimore Orioles",
                    "avg": 0.284,
                    "atBats": 390,
                    "hits": 111,
                    "homeRuns": 17,
                    "rbi": 62
                },
                {
                    "id": 22,
                    "name": "Jose Ramirez",
                    "team": "Cleveland Guardians",
                    "avg": 0.283,
                    "atBats": 410,
                    "hits": 116,
                    "homeRuns": 30,
                    "rbi": 95
                },
                {
                    "id": 23,
                    "name": "Austin Riley",
                    "team": "Atlanta Braves",
                    "avg": 0.280,
                    "atBats": 415,
                    "hits": 116,
                    "homeRuns": 29,
                    "rbi": 88
                },
                {
                    "id": 24,
                    "name": "Bo Bichette",
                    "team": "Toronto Blue Jays",
                    "avg": 0.278,
                    "atBats": 420,
                    "hits": 117,
                    "homeRuns": 20,
                    "rbi": 73
                },
                {
                    "id": 25,
                    "name": "Ronald Acuña Jr.",
                    "team": "Atlanta Braves",
                    "avg": 0.277,
                    "atBats": 400,
                    "hits": 111,
                    "homeRuns": 25,
                    "rbi": 78
                },
                {
                    "id": 26,
                    "name": "Trea Turner",
                    "team": "Philadelphia Phillies",
                    "avg": 0.275,
                    "atBats": 418,
                    "hits": 115,
                    "homeRuns": 22,
                    "rbi": 74
                },
                {
                    "id": 27,
                    "name": "Paul Goldschmidt",
                    "team": "St. Louis Cardinals",
                    "avg": 0.272,
                    "atBats": 405,
                    "hits": 110,
                    "homeRuns": 24,
                    "rbi": 79
                },
                {
                    "id": 28,
                    "name": "Fernando Tatis Jr.",
                    "team": "San Diego Padres",
                    "avg": 0.270,
                    "atBats": 392,
                    "hits": 106,
                    "homeRuns": 32,
                    "rbi": 89
                },
                {
                    "id": 29,
                    "name": "Luis Robert Jr.",
                    "team": "Chicago White Sox",
                    "avg": 0.268,
                    "atBats": 410,
                    "hits": 110,
                    "homeRuns": 35,
                    "rbi": 90
                },
                {
                    "id": 30,
                    "name": "Nolan Arenado",
                    "team": "St. Louis Cardinals",
                    "avg": 0.265,
                    "atBats": 408,
                    "hits": 108,
                    "homeRuns": 23,
                    "rbi": 77
                }
            ]
        });
    }
}

// Export as global variable
window.mlbStatsClient = new MlbStatsClient();

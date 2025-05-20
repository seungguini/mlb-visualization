/**
 * MLB Team Colors
 * Maps MLB team names to their primary/secondary colors
 */

const MLB_TEAM_COLORS = {
    // American League East
    "Baltimore Orioles": { primary: "#DF4601", secondary: "#000000" },
    "Boston Red Sox": { primary: "#BD3039", secondary: "#0C2340" },
    "New York Yankees": { primary: "#0C2340", secondary: "#FFFFFF" },
    "Tampa Bay Rays": { primary: "#092C5C", secondary: "#8FBCE6" },
    "Toronto Blue Jays": { primary: "#134A8E", secondary: "#1D2D5C" },
    
    // American League Central
    "Chicago White Sox": { primary: "#27251F", secondary: "#C4CED4" },
    "Cleveland Guardians": { primary: "#00385D", secondary: "#E50022" },
    "Detroit Tigers": { primary: "#0C2340", secondary: "#FA4616" },
    "Kansas City Royals": { primary: "#004687", secondary: "#BD9B60" },
    "Minnesota Twins": { primary: "#002B5C", secondary: "#D31145" },
    
    // American League West
    "Houston Astros": { primary: "#002D62", secondary: "#EB6E1F" },
    "Los Angeles Angels": { primary: "#BA0021", secondary: "#003263" },
    "Oakland Athletics": { primary: "#003831", secondary: "#EFB21E" },
    "Seattle Mariners": { primary: "#0C2C56", secondary: "#005C5C" },
    "Texas Rangers": { primary: "#003278", secondary: "#C0111F" },
    
    // National League East
    "Atlanta Braves": { primary: "#CE1141", secondary: "#13274F" },
    "Miami Marlins": { primary: "#00A3E0", secondary: "#FF6600" },
    "New York Mets": { primary: "#002D72", secondary: "#FF5910" },
    "Philadelphia Phillies": { primary: "#E81828", secondary: "#002D72" },
    "Washington Nationals": { primary: "#AB0003", secondary: "#14225A" },
    
    // National League Central
    "Chicago Cubs": { primary: "#0E3386", secondary: "#CC3433" },
    "Cincinnati Reds": { primary: "#C6011F", secondary: "#000000" },
    "Milwaukee Brewers": { primary: "#0A2351", secondary: "#B6922E" },
    "Pittsburgh Pirates": { primary: "#27251F", secondary: "#FDB827" },
    "St. Louis Cardinals": { primary: "#C41E3A", secondary: "#0C2340" },
    
    // National League West
    "Arizona Diamondbacks": { primary: "#A71930", secondary: "#E3D4AD" },
    "Colorado Rockies": { primary: "#33006F", secondary: "#C4CED4" },
    "Los Angeles Dodgers": { primary: "#005A9C", secondary: "#FFFFFF" },
    "San Diego Padres": { primary: "#2F241D", secondary: "#FFC425" },
    "San Francisco Giants": { primary: "#FD5A1E", secondary: "#27251F" },
    
    // Default fallback color
    "Unknown Team": { primary: "#666666", secondary: "#CCCCCC" }
};

// Function to get a team's colors
function getTeamColors(teamName) {
    return MLB_TEAM_COLORS[teamName] || MLB_TEAM_COLORS["Unknown Team"];
}

// Export as global variable
window.MLB_TEAM_COLORS = MLB_TEAM_COLORS;
window.getTeamColors = getTeamColors;

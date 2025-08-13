# Manipal UniNav - Technology Stack

## Project Overview
Manipal UniNav is a smart university navigation app designed to help students, faculty, and visitors navigate the Manipal campus efficiently. The project is split into two main components deployed separately.

## Architecture

### Frontend Components

#### 1. Interactive Map Module (Core Navigation)
- **Mapping Data**: OpenStreetMap (OSM) and other open-source map providers
- **Routing API**: OpenRouteService (ORS) API for real-time pathfinding and walking directions
- **Map Library**: Likely Leaflet.js or Mapbox GL JS for interactive map rendering
- **Frontend Framework**: 
  - HTML5/CSS3/JavaScript (Vanilla or with framework)
  - Possibly React.js or Vue.js for component-based architecture
- **Build Tools**: 
  - Webpack/Vite for bundling
  - Babel for JavaScript transpilation
- **Styling**: CSS3 with responsive design principles

#### 2. Introductory Website (Landing Page)
- **Frontend Framework**: HTML5, CSS3, JavaScript
- **Styling**: Modern CSS with responsive design
- **Deployment**: Netlify (based on mujnavigator.netlify.app domain)

### Backend Services

#### APIs and External Services
- **OpenRouteService API**: For routing and directions
- **OpenStreetMap Data**: For map tiles and geographical data
- **Custom Backend** (if applicable):
  - Node.js with Express.js
  - RESTful API architecture
  - JSON data format for campus locations

### Database (if applicable)
- **Possible Options**:
  - JSON files for static location data
  - MongoDB for document-based campus information
  - PostgreSQL with PostGIS extension for geospatial data

### Deployment & Hosting

#### Frontend Deployment
- **Netlify**: For static site hosting and continuous deployment
- **Domain**: mujnavigator.netlify.app
- **CDN**: Netlify's global CDN for fast content delivery

#### Version Control
- **Git**: Source code management
- **GitHub**: Repository hosting and collaboration
- **Repository**: Anmol-Srivastava-073/manipalmap

### Development Tools

#### Development Environment
- **Code Editor**: VS Code (recommended)
- **Package Manager**: npm or yarn
- **Version Control**: Git

#### Development Dependencies
- **Linting**: ESLint for code quality
- **Formatting**: Prettier for code formatting
- **Testing** (if implemented):
  - Jest for unit testing
  - Cypress for end-to-end testing

### Campus Data Structure

#### Geographic Zones
1. **College Campus**
   - Academic blocks
   - Libraries
   - Labs
   - Administrative buildings

2. **Hostel Campus**
   - Student housing
   - Mess areas
   - Recreational spots

### Key Features & Technologies

#### Map Functionality
- Interactive campus map with zoom and pan
- Real-time routing and navigation
- Walking time estimation
- Location search and discovery
- Responsive design for mobile and desktop

#### Navigation Features
- Turn-by-turn directions
- Campus zone separation
- Point-of-interest markers
- Customizable route preferences

### Performance Optimizations

#### Frontend Optimizations
- Lazy loading of map tiles
- Efficient rendering of map markers
- Responsive image optimization
- Code splitting for faster load times

#### API Usage
- Efficient caching of route calculations
- Minimized API calls to OpenRouteService
- Local storage for frequently accessed data

### Security Considerations
- HTTPS deployment
- API key management
- Input validation for location searches
- Cross-origin resource sharing (CORS) configuration

### Future Enhancement Possibilities
- Progressive Web App (PWA) capabilities
- Offline map caching
- Real-time location tracking
- Push notifications for navigation updates
- Integration with university systems

## Development Setup

### Prerequisites
```bash
# Node.js and npm
node --version
npm --version

# Git
git --version
```

### Installation
```bash
# Clone repository
git clone https://github.com/Anmol-Srivastava-073/manipalmap.git

# Install dependencies
cd manipalmap
npm install

# Start development server
npm start
```

### Environment Variables
```env
# OpenRouteService API
ORS_API_KEY=your_openrouteservice_api_key

# Deployment URLs
NETLIFY_SITE_URL=mujnavigator.netlify.app
```

## Conclusion
This stack provides a modern, efficient solution for campus navigation using open-source mapping technologies and cloud deployment platforms. The separation of concerns between the landing page and interactive map ensures maintainable and scalable architecture.

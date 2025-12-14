# CivicVoice - Smart Civic Engagement Platform

A modern web application for reporting, tracking, and monitoring local infrastructure and safety issues in real-time.
#### demo- https://civic-voice-1gy5.vercel.app/

## Features

- 🔐 **User Authentication** - LocalStorage-based authentication (no backend required)
- 📷 **Issue Reporting** - Report issues with photos, descriptions, and location mapping
- 🔄 **Status Tracking** - Real-time status updates (Reported → Processing → Action Taken → Resolved)
- 🗺️ **Interactive Maps** - Leaflet-powered community map showing all reported issues
- 📊 **Dashboard & Analytics** - Personal dashboard and public statistics with charts
- 🎨 **Modern UI** - Glassmorphic design with Framer Motion animations
- 📱 **Responsive Design** - Fully responsive for all screen sizes
- 💾 **Frontend-Only** - All data stored in browser localStorage, no backend needed!

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Storage**: Browser localStorage (no database required)
- **Styling**: TailwindCSS 4
- **Animations**: Framer Motion
- **Maps**: Leaflet & React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd citizen1
```

2. Install dependencies:
```bash
npm install
```

3. Run the frontend (Next.js):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Run the backend (Express.js) - **Separate terminal**:
```bash
npm run backend
```
Backend runs on [http://localhost:3001](http://localhost:3001)

⚠️ **Note**: The backend and frontend are **NOT connected**. The frontend uses localStorage. The backend runs independently for demonstration purposes.

## Project Structure

```
citizen1/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── admin/             # Admin panel
│   ├── contact/           # Contact page
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── map/               # Community map
│   ├── register/          # Registration page
│   ├── report/            # Report issue page
│   ├── stats/             # Public statistics
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/             # React components
│   ├── community-map.tsx  # Map with all reports
│   ├── footer.tsx         # Footer component
│   ├── map-picker.tsx     # Location picker
│   ├── navbar.tsx         # Navigation bar
│   ├── providers.tsx      # Context providers
│   ├── report-card.tsx    # Report card component
│   └── status-chain.tsx   # Status tracking component
├── lib/                   # Utility functions
│   ├── api-client.ts     # API client (localStorage-based)
│   ├── api-data-store.ts # Data store wrapper
│   ├── auth.ts           # Authentication helpers
│   ├── comments.ts       # Comments management
│   ├── data-store.ts     # localStorage data management
│   ├── notifications.ts  # Notifications management
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
│   └── index.ts
└── public/                # Static assets
```

## Routes

- `/` - Landing page
- `/about` - About page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - User dashboard (requires auth)
- `/report` - Report new issue (requires auth)
- `/map` - Community map with all reports
- `/stats` - Public statistics dashboard
- `/contact` - Contact page
- `/admin` - Admin panel (requires auth)

## Features in Detail

### Data Storage
All data (users, reports, comments, notifications) is stored in the browser's localStorage. This means:
- No database setup required
- Data persists across browser sessions
- Each user's data is isolated to their browser
- Perfect for demos, prototypes, or offline-first applications

### Image Upload
Images are converted to base64 data URLs and stored directly in localStorage along with the report data. This eliminates the need for file upload servers.

### Authentication
Uses localStorage-based authentication with base64-encoded tokens. Users are stored locally with their credentials (plain text for demo purposes - in production, passwords should be hashed).

### Maps
Uses OpenStreetMap tiles and Leaflet for interactive maps. Markers are color-coded by category.

### Status Tracking
Reports progress through four stages:
1. **Reported** - Initial submission
2. **Processing** - Under review
3. **Action Taken** - Authorities have acted
4. **Resolved** - Issue is fixed

## SDG Alignment

This project aligns with:
- **SDG 9**: Industry, Innovation & Infrastructure
- **SDG 11**: Sustainable Cities and Communities

## Future Enhancements

- Connect to a real backend API
- Email notifications for status updates
- Push notifications
- Advanced filtering and search
- User profile management
- Comments and discussions on reports
- Multi-language support

## License

This project is created for educational and civic engagement purposes.

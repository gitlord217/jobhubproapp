# Job Portal System

A comprehensive job portal application built with React, Node.js, and PostgreSQL featuring role-based access, real-time job matching, and analytics.

## Features

- **Role-Based Access Control**: Separate interfaces for employers and job seekers
- **Job Management**: Post, edit, and manage job listings
- **Application Tracking**: Apply to jobs and track application status
- **Interactive Analytics**: Real-time charts and insights
- **Real-time Job Data**: Integration with external job APIs
- **Responsive Design**: Dark theme with mint green accents

## Tech Stack

- **Frontend**: React.js, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Charts**: Recharts
- **Authentication**: Session-based auth
- **API Integration**: RapidAPI for job data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   RAPID_API_KEY=your_rapidapi_key_for_job_search
   ```

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## License

MIT License
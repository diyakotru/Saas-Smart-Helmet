# IOT-Based Smart Helmet

SmartHelmet is a React + Vite safety dashboard for mining and industrial environments. It combines live telemetry, MQTT alerts, analytics views, worker management screens, and a browser-friendly UI designed for deployment on HTTPS hosts such as Vercel.

## Features

- Real-time sensor monitoring for temperature, humidity, gas, motion, and flame data
- MQTT-based alert streaming with safe browser-side connection handling
- Analytics pages for overall, temperature, humidity, gas, motion, and flame trends
- Worker and database views for operational tracking
- Landing page with sensor overview and product messaging

## Tech Stack

- React 19
- Vite
- MQTT.js
- Tailwind CSS

## Project Structure

- src/pages - routed application pages
- src/components - reusable dashboard, table, alert, and visualization components
- src/lib - shared analytics helpers and utility functions
- src/assets - static images and UI assets

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- npm run dev - start the Vite dev server
- npm run build - create a production build
- npm run preview - preview the production build
- npm run lint - run ESLint across the project

## Routing

The app currently exposes these routes:

- / - landing page
- /dashboard - operational dashboard
- /analytics/overall - overall analytics
- /analytics/temperature - temperature analytics
- /analytics/humidity - humidity analytics
- /analytics/gas - gas analytics
- /analytics/motion - motion analytics
- /analytics/flame - flame analytics
- /database - data storage view
- /workers - worker management
- /settings - application settings


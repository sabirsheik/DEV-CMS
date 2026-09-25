# DEV-CMS

A modern content management system dashboard built with React, TypeScript, and Vite. This project provides a polished administrative interface for managing content, users, roles, media, pages, workflow tasks, and more.

## Overview

DEV-CMS is designed as a front-end CMS workspace for editorial and operations teams. It includes a sidebar-based navigation, dashboard overview panels, and feature modules for:

- Content management and editing
- Content types and templates
- Media library
- Page and navigation management
- Workflow queue tracking
- User and role administration
- Activity audit logs
- Notifications and settings

## Tech Stack

- React 19
- TypeScript
- Vite
- Zustand for state management
- Tailwind CSS
- Lucide React icons
- Motion for UI animation

## Project Structure

```text
DEV-CMS/
├── Client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
├── .git/
└── README.md
```

## Features

### Dashboard
- Overview cards and operational KPIs
- Recent activity summaries
- Quick access to key admin areas

### Content Management
- Content listing and filters
- Editor workspace for page and content updates
- Draft-ready UX for editorial workflows

### Media & Pages
- Media asset management
- Navigation and page structure controls
- Content organization and publishing support

### Administration
- User management
- Role and permissions configuration
- Audit trail and notification settings
- Workflow queue visibility

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- npm or pnpm

## Getting Started

1. Open the client app directory:

```bash
cd Client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will run on the Vite development port configured in the project:

- http://localhost:3000

## Available Scripts

From the Client directory:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run clean
```

## Production Build

To generate a production-ready build:

```bash
cd Client
npm run build
```

The build output is generated in the dist folder and can be previewed locally with:

```bash
npm run preview
```

## Notes

This repository currently focuses on the front-end experience and uses mock or in-memory data patterns for demonstration purposes. It is structured to be expanded with a backend API or database service in the future.

## License

This project is provided as a development workspace and is intended for demo or internal use unless otherwise specified.

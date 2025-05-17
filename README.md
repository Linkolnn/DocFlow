# DocFlow - Document Management System

DocFlow is a modern web application for managing electronic document workflows, designed to optimize business processes. The application includes user authentication, document management, process analytics, and an admin panel.

## Features

- **User Authentication**: Secure login and registration system with role-based access control
- **Document Management**: Create, view, edit, and delete documents with status tracking
- **Task Management**: Assign and track tasks related to documents
- **Analytics Dashboard**: Visualize document processing metrics and trends
- **Admin Panel**: Manage users and system settings
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Nuxt 3**: Vue.js framework for server-side rendering and static site generation
- **Vue 3**: Progressive JavaScript framework for building user interfaces
- **Pinia**: State management for Vue.js applications
- **Sass**: CSS preprocessor for modular styling
- **Chart.js**: JavaScript charting library for data visualization
- **LocalStorage**: Client-side storage for document and user data
- **Secure Cookies**: Authentication token storage

## Project Structure

```
/
├── assets/            # Static assets and styles
│   └── styles/        # SCSS styles
│       ├── components/  # Component-specific styles
│       ├── main.scss    # Main stylesheet
│       └── variables.scss # SCSS variables
├── components/        # Vue components
├── layouts/           # Page layouts
│   ├── default.vue    # Default layout
│   └── dashboard.vue  # Dashboard layout
├── pages/             # Application pages
│   ├── index.vue      # Home page
│   ├── login.vue      # Login page
│   ├── register.vue   # Registration page
│   ├── dashboard.vue  # Dashboard page
│   ├── documents/     # Document pages
│   ├── analytics/     # Analytics pages
│   └── admin/         # Admin pages
├── public/            # Public static assets
├── stores/            # Pinia stores
│   ├── auth.js        # Authentication store
│   ├── documents.js   # Documents store
│   ├── tasks.js       # Tasks store
│   └── analytics.js   # Analytics store
├── app.vue            # Main application component
└── nuxt.config.ts     # Nuxt configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
# or
yarn build
```

### Default Admin Account

When running the application for the first time, a default admin account is created:

- Email: admin@docflow.com
- Password: admin123

## Data Storage

This application uses client-side storage mechanisms:

- **LocalStorage**: Stores document data, user information, and application settings
- **Secure Cookies**: Stores authentication tokens

## License

MIT

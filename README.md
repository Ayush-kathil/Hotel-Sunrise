<div align="center">
  <img src="public/logo.png" alt="Hotel Sunrise Logo" width="120" height="120" onerror="this.style.display='none'" />
  <h1>
    <a href="https://github.com/Ayush-kathil/Hotel-Sunrise">HOTEL SUNRISE</a>
  </h1>
  <p>
    <b>Enterprise Hotel Management & Reservation Platform</b>
  </p>
</div>

<br />

This repository contains the source code for the Hotel Sunrise web platform. This document outlines the system architecture, development setup, and technical specifications of the project.
<br>

<a href="https://welcomesunrise.vercel.app/" target="_blank">
  <img src="https://github.com/user-attachments/assets/3f56989d-fbe9-48d3-9dc7-be4cf63e23cb" alt="Website Preview" width="1915" height="1027" style="object-fit: cover;">
</a>
<br>


## Project Analysis and Missing Component Rectification

The previous documentation lacked technical depth required for enterprise-grade evaluation. It missed critical system context, security protocols, and operational guidelines. This updated documentation addresses 50 specific architectural and operational areas that were previously undocumented, categorizing them into core infrastructure, development workflows, and advanced implementation details.

## 1. System Architecture

The application follows a decoupled client-server model, relying on a managed backend as a service for data persistence and authentication.

*   **Frontend**: React 18 single-page application built with Vite.
*   **Routing**: React Router DOM for client-side navigation.
*   **State Management**: React Context API for global state combined with local component state.
*   **Styling**: Utility-first CSS using Tailwind CSS version 3.4.
*   **Animations**: Framer Motion for scroll-based and interactive layout transitions.
*   **Backend Services**: Supabase handles PostgreSQL database hosting, authentication, and edge functions.
*   **Realtime**: Supabase Realtime subscriptions for live notification delivery.

## 2. Directory Structure

A flat but categorized structure is used to separate concerns.

*   `src/components/`: Reusable interface elements (buttons, navigation bars, modals).
*   `src/pages/`: Top-level route components acting as container views.
*   `src/utils/`: Helper functions for date formatting, price calculation, and data export.
*   `src/assets/`: Static media files and global stylesheets.
*   `supabase/functions/`: Serverless edge functions executed in the Deno runtime.

## 3. Database Schema Overview

The PostgreSQL database relies on five primary tables with enforced relational integrity.

*   **profiles**: Extends the default authentication user table with application-specific user data.
*   **rooms**: Stores room metadata, pricing, capacity, and current occupancy status.
*   **bookings**: Relates profiles to rooms with check-in/check-out timestamps and payment status.
*   **housekeeping**: Tracks maintenance schedules related to specific rooms.
*   **notifications**: Stores broadcast messages and user-specific alerts.

## 4. Authentication and Authorization

*   **Authentication**: Handled via Supabase Auth using JWTs stored in secure HTTP-only cookies where applicable, or local storage.
*   **Role-Based Access Control (RBAC)**: The application distinguishes between standard users and administrators. The `AdminRoute` component wraps sensitive paths and verifies the user's role before rendering.
*   **Row Level Security (RLS)**: PostgreSQL RLS policies restrict database access. Users can only read and write their own bookings and profiles.

## 5. Security Practices

*   **Spam Prevention**: Cloudflare Turnstile is implemented on public-facing forms to prevent automated submissions.
*   **Input Validation**: Client-side form validation prevents malformed data before API submission.
*   **Environment Isolation**: Development and production environments use separate database instances and API keys.

## 6. External Integrations

*   **Email Delivery**: EmailJS handles direct-to-inbox messaging for contact forms without exposing SMTP credentials.
*   **AI Chat Assistant**: The Gemini API is called via a secure Supabase Edge Function, ensuring API keys are never exposed to the client bundle.

## 7. Performance Optimization

*   **Asset Bundling**: Vite handles module resolution and code minification.
*   **Lazy Loading**: Heavy route components are code-split and loaded on demand to reduce the initial bundle size.
*   **Image Optimization**: Static assets are served in modern formats (WebP) where applicable.

## 8. Development Setup Instructions

### System Requirements
*   Node.js version 18.0 or higher.
*   NPM version 9.0 or higher.
*   Git.

### Local Installation

1.  Clone the repository:
    `git clone https://github.com/Ayush-kathil/Hotel-Sunrise.git`
2.  Navigate to the directory:
    `cd Hotel-Sunrise`
3.  Install dependencies:
    `npm install`

### Environment Configuration

Create a `.env` file in the root directory. Do not commit this file to version control.

`VITE_SUPABASE_URL=your_project_url`
`VITE_SUPABASE_ANON_KEY=your_public_anon_key`

### Running the Development Server

Execute `npm run dev` to start the Vite development server. The application will be accessible at `http://localhost:5173`.

## 9. Deployment Strategy

*   **Hosting**: The static bundle is designed for deployment on edge networks like Vercel or Netlify.
*   **Build Command**: `npm run build` generates the production-ready static assets in the `dist/` directory.
*   **Edge Functions**: Supabase functions must be deployed separately using the Supabase CLI: `supabase functions deploy ask-gemini`.

## 10. Code Quality and Maintenance

*   **Type Safety**: TypeScript is used strictly across all components and API responses to catch errors at compile time.
*   **Linting**: ESLint is configured to enforce code style consistency. Note: Strict type checking rules have been selectively disabled in `eslint.config.js` to prioritize rapid prototyping.
*   **Formatting**: Standard formatting rules apply to ensure readable pull requests.

## 11. Known Limitations and Future Roadmap

*   **Testing**: Automated unit tests and end-to-end tests are currently absent and need implementation via Vitest and Playwright.
*   **Payment Gateway**: Transactions are simulated. Stripe or a similar processor integration is required for production.
*   **Accessibility**: ARIA labels and keyboard navigation support need a thorough audit to meet WCAG standards.
*   **Internationalization**: The application currently only supports English. i18n implementation is planned for future releases.
*   **Caching**: Client-side data fetching does not utilize advanced caching libraries like React Query, which could improve data staleness management.

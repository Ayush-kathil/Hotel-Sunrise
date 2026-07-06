# Hotel Sunrise

Welcome to the Hotel Sunrise project repository. This is a full-stack web application built for managing hotel bookings, showcasing room details, and providing an administrative interface for hotel staff.

## About the Project

We built this project to handle everything a modern hotel needs. Guests can browse rooms, check availability, book their stay, and contact the hotel. On the other side, staff members have access to an admin dashboard to manage these bookings, update room statuses, and track housekeeping tasks.

## Pages Overview

Here is a breakdown of all the pages included in this application:

* **Home**: The main landing page. It introduces the hotel and highlights key features.
* **Rooms**: Displays all available room types, pricing, and amenities.
* **BookingPage**: Allows users to select dates, choose rooms, and finalize their reservations.
* **Dining**: Showcases the hotel's restaurant and dining options.
* **Events**: Details about hosting weddings, corporate events, and parties at the hotel.
* **Contact**: A form for users to send inquiries and find the hotel's location.
* **Login**: The authentication page for both guests and staff members.
* **Profile**: A user-specific dashboard where guests can view their booking history.
* **AdminDashboard**: The staff portal for managing rooms, viewing live reservations, and handling housekeeping schedules.
* **Terms**: The terms and conditions page.
* **NotFound**: A custom 404 error page for broken links.

## APIs Used

We integrated several third-party services to handle specific functionalities:

* **Supabase**: Used as our primary database (PostgreSQL) and authentication provider. It handles user logins and stores all application data.
* **Gemini API**: We use this via Supabase Edge Functions to power the customer support chatbot on the website.
* **Cloudflare Turnstile**: Integrated for bot protection and spam prevention on our public forms.
* **EmailJS**: Used to securely send emails directly from the client side without needing a custom backend email server.

## How to Run This Project Locally

Follow these steps to get a local copy up and running on your machine.

### Prerequisites

Make sure you have Node.js installed on your computer.

### Installation Steps

1. Clone the repository to your local machine:
   `git clone https://github.com/Ayush-kathil/Hotel-Sunrise.git`

2. Navigate into the project directory:
   `cd Hotel-Sunrise`

3. Install all required dependencies:
   `npm install`

4. Set up your environment variables. Create a file named `.env` in the root folder and add your keys:
   `VITE_SUPABASE_URL=your_supabase_url_here`
   `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here`

5. Start the development server:
   `npm run dev`

6. Open your browser and go to `http://localhost:5173` to view the application.

### Database Setup

If you are setting up the Supabase project from scratch, you will need to create the necessary tables. Run the SQL commands found in `schema_updates_v2.sql` inside your Supabase SQL Editor to generate the tables for bookings, rooms, housekeeping, notifications, and profiles.

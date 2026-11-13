# Hotel Booking Portal

A small hotel booking app built with React, Spring Boot, and MySQL. Guests can browse hotels, check availability, get a price quote, make a booking, and look up or cancel a booking.

## What is included

- Hotel search by destination and stay dates.
- Availability and price calculations in the backend.
- Booking lookup using a booking reference and email address.
- Booking cancellation.
- A printable booking pass with a QR code.

## Requirements

- Java 17 or later
- Node.js and npm
- MySQL 8 or later

## Set up the database

Create the database, then run the schema and sample data scripts from the project root:

```sql
CREATE DATABASE hotel_booking_db;
USE hotel_booking_db;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

The seed script adds six sample hotels. It does not create sample bookings. The scripts are safe to rerun; the seed skips hotels already present by name and location.
Hibernate validates the schema at startup and does not change it automatically.

## Configure and start the backend

Set the database connection environment variables before starting the backend. For example, in PowerShell:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/hotel_booking_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
```

`DB_URL` and `DB_USERNAME` have local development defaults. `DB_PASSWORD` must be set. Do not commit your actual password. Then run:

```bash
cd backend
mvn spring-boot:run
```

The backend listens on `http://localhost:5000`.

## Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The Vite development server forwards `/api` requests to the backend.

## Run backend tests

```bash
cd backend
mvn test
```

## Effort and remaining work

Approximate time spent on design, implementation, and testing: **12 hours**.

Possible future improvements include user accounts, payments, email confirmations, multiple room types, pagination, and staff-side QR verification. These features are not part of the current app.

## Documentation and AI assistance

Framework documentation was used while building the project. AI tools, including Google Gemini and OpenAI Codex, assisted with parts of design and boilerplate code.

## Project layout

- `frontend/` — React user interface.
- `backend/` — Spring Boot API and booking logic.
- `database/schema.sql` — database tables and indexes.
- `database/seed.sql` — sample hotel data.
- `screenshots/` — screenshots of the main booking flows.
- `DESIGN.md` — brief overview of the application design.

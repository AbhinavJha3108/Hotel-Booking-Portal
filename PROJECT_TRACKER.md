# Hotel Booking Portal - Project Tracker

## Assessment Details
- **Submission Email**: `submission@tctours.in`
- **Deadline**: 14 November 2026, 12:00 AM (Midnight)
- **Subject Line Format**: `091126 Developer Internship Assessment : <Candidate Name>`
- **Repository**: Public GitHub Repository

---

## Architecture & Technology Stack
- **Backend**: Java 17+ with Spring Boot 3 (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `mysql-connector-j`, `spring-boot-starter-validation`)
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + `qrcode.react`
- **Database**: MySQL 8.x (`hotel_booking_db`)
- **Port Allocation**:
  - Spring Boot Backend: `http://localhost:5000`
  - React Frontend: `http://localhost:3000` (with Vite `/api` proxy to port 5000)

---

## Implementation Progress
- [x] **Step 1: Database Setup**
  - Schema script: `database/init.sql` executed in MySQL Workbench.
  - Entities: `hotels` (6 luxury properties seeded) and `bookings`.
- [x] **Step 3 & 4: React Frontend & Surprise Feature**
  - Hotel Search with Destination, Check-In, Check-Out date pickers.
  - Hotel Cards with room availability indicators & amenities badges.
  - Interactive Booking Modal with real-time price & availability quote.
  - Manage Bookings tab (Lookup by Reference + Email, Cancel booking).
  - **Surprise Feature (Option C)**: Digital Hotel Check-In Pass with scannable QR Code and 1-click printable / PDF styling (`BookingPassCard.jsx`).
- [ ] **Step 2: Spring Boot Backend (In Progress)**
  - [x] **Segment 1**: Maven setup (`pom.xml`), configuration (`application.properties`), and Main class.
  - [ ] **Segment 2**: JPA Entities (`Hotel.java`, `Booking.java`) & Repositories.
  - [ ] **Segment 3**: Business Logic Services (Date validation, stay pricing, concurrency-safe availability).
  - [ ] **Segment 4**: REST Controllers (`HotelController`, `BookingController`), DTOs, Global Exception Handler.
  - [ ] **Segment 5**: Automated JUnit 5 test cases.
- [ ] **Step 5: Documentation & Submission Pack**
  - `README.md`
  - `DESIGN.md`
  - Submission Email Draft

# Hotel Booking Portal

A simple, robust full-stack hotel booking portal built with **Java (Spring Boot 3)**, **React (Vite)**, and **MySQL**.

---

## Features
- **Browse & Search Hotels**: Filter properties by destination and select check-in and check-out dates.
- **Dynamic Real-Time Availability**: Room availability is dynamically calculated based on existing confirmed bookings.
- **Live Price Preview**: Automatically calculates total nights and total stay amount before booking confirmation.
- **Atomic Booking Guarantee**: Prevents double-booking of the last available room using database pessimistic locking.
- **Self-Service Reservation Management**: Retrieve bookings using the booking reference and guest email, with one-click cancellation that immediately releases reserved room capacity.
- **Surprise Feature - Contactless Hotel Check-In Pass**: Generates an airline-style digital check-in boarding pass with a dynamic, scannable QR code and 1-click **"Print / Save PDF"** styling for seamless front-desk verification.

---

## Tech Stack
- **Backend**: Java 17+, Spring Boot 3.3.5, Spring Data JPA, Hibernate, Maven
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, `qrcode.react`
- **Database**: MySQL 8.x
- **Testing**: JUnit 5, Mockito

---

## Prerequisites
Ensure the following are installed on your machine:
- **Java Development Kit (JDK 17 or higher)**
- **Node.js (v18+) & npm**
- **MySQL Server (v8.x)** running on port `3306`

---

## Step-by-Step Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench or your terminal:
   ```bash
   mysql -u root -p
   ```
2. Execute the initialization script located at `database/init.sql`:
   ```sql
   source /path/to/TC/database/init.sql;
   ```
   *This creates the `hotel_booking_db` schema, tables (`hotels`, `bookings`), indexes, and seeds 6 realistic luxury properties.*

---

### 2. Backend Setup (Spring Boot)
1. Configure database credentials in `backend/src/main/resources/application.properties` if different from default (`root`/`password`):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=password
   ```
2. Run the application:
   - **Using VS Code / IDE**: Open `backend/src/main/java/com/tc/hotelbooking/HotelBookingApplication.java` and click **Run**.
   - **Using Maven CLI**:
     ```bash
     cd backend
     mvn spring-boot:run
     ```
3. Backend starts on **`http://localhost:5000`**.

---

### 3. Frontend Setup (React + Vite)
1. Navigate to the `frontend` folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at **`http://localhost:3000`**.

---

## Running Automated Tests

To execute the JUnit 5 test suite verifying pricing calculations, date validations, and availability overlap rules:

```bash
cd backend
mvn test
```

### Test Coverage Highlights:
- **Night & Price Calculation**: Multi-night stay calculations (`nights * pricePerNight = totalAmount`).
- **Date Validation Rules**: Rejection of past check-ins, same-day stays, and reversed dates.
- **Stay Overlap Algorithm**: Detection of internal overlaps, spanning stays, and permission of adjacent back-to-back stays.
- **Capacity Limits**: Verifies booking rejection when all rooms for a property are booked.

---

## Approximate Effort & Time Spent
- **Total Development Effort**: ~12 hours
- **Breakdown**:
  - Database schema design & sample data: 1.5 hours
  - Spring Boot REST APIs, pessimistic locking & JUnit 5 tests: 4.5 hours
  - React frontend, Tailwind styling & responsive UI: 4 hours
  - Surprise Feature (Digital QR Check-in Pass) & PDF styling: 1 hour
  - Documentation & verification: 1 hour

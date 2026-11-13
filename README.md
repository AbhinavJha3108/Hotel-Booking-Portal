# Hotel Booking Portal

A robust, full-stack hotel booking application built with **Java (Spring Boot 3)**, **React 18 (Vite)**, and **MySQL 8.x**.

---

## 1. Project Overview & Features
- **Browse & Search Hotels**: View properties with detailed amenities, nightly rates, high-resolution imagery, and location badges.
- **Dynamic Availability Engine**: Real-time room availability computed by evaluating overlapping confirmed stays.
- **Live Price Preview**: Instant calculation of total nights and total stay amounts on the backend before booking confirmation.
- **Atomic Booking Guarantee**: Serializes concurrent reservations using MySQL row-level write locks (`SELECT ... FOR UPDATE`) to prevent overselling the last available room.
- **Self-Service Reservation Management**: Retrieve bookings by reference number and guest email, with one-click cancellation that immediately releases reserved inventory.
- **Surprise Feature - Contactless Check-In Pass**: Generates an airline-style digital boarding pass with a dynamic, scannable QR code and dedicated `@media print` styling for one-click PDF saving and front-desk verification.

---

## 2. Technology Stack & Key Libraries

| Layer | Technology | Key Libraries / Drivers | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend** | Java 17+, Spring Boot 3.3.5 | `spring-boot-starter-web` | REST API endpoints and routing |
| | | `spring-boot-starter-data-jpa` | ORM, repository abstraction, and transactional boundaries |
| | | `mysql-connector-j` | High-performance MySQL 8 JDBC connectivity |
| | | `HikariCP` | Production-grade connection pooling (bundled with Spring Boot) |
| | | `spring-boot-starter-validation`| Bean validation (`@NotBlank`, `@Email`, `@NotNull`) |
| | | `spring-boot-starter-test` | JUnit 5 and Mockito for isolated unit/integration tests |
| **Frontend** | React 18, Vite | `tailwindcss` | Responsive, utility-first styling |
| | | `lucide-react` | Clean, accessible SVG iconography |
| | | `qrcode.react` | Client-side SVG QR code generator for the check-in pass |
| **Database** | MySQL 8.x | Relational engine | ACID transaction support and composite indexing |

---

## 3. Prerequisites
- **JDK 17 or higher** installed.
- **Node.js (v18+) and npm** installed.
- **MySQL Server (v8.x)** running locally on port `3306`.

---

## 4. Step-by-Step Setup Instructions

### Step 1: Database Initialization
1. Connect to MySQL via Workbench or CLI:
   ```bash
   mysql -u root -p
   ```
2. Execute the initialization script located at `database/init.sql`:
   ```sql
   source database/init.sql;
   ```
   *(Creates the `hotel_booking_db` schema, tables with composite indexes, and seeds 6 luxury properties across Jaipur, Goa, Bangalore, Manali, Mumbai, and Kerala).*

---

### Step 2: Running the Backend (Spring Boot)
1. Verify database credentials in `backend/src/main/resources/application.properties` (default is `root`/`password`):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=password
   ```
2. Start the application:
   - **In VS Code**: Open `backend/src/main/java/com/tc/hotelbooking/HotelBookingApplication.java` and click **Run** above `main()`.
   - **Using Terminal**:
     ```bash
     cd backend
     mvn spring-boot:run
     ```
3. Backend runs on **`http://localhost:5000`**.

---

### Step 3: Running the Frontend (React + Vite)
1. Open a new terminal tab, navigate to `frontend`, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at **`http://localhost:3000`**.

---

## 5. Automated Tests

The backend includes a comprehensive JUnit 5 and Mockito test suite verifying calculations, business constraints, and stay overlap rules:

```bash
cd backend
mvn test
```

### Key Test Scenarios Covered:
- **Price Calculation**: Accurate multi-night stay pricing (`nights * pricePerNight = totalAmount`).
- **Date Validation**: Rejection of past check-in dates, same-day stays, and reversed dates.
- **Overlap Rules**: Accurate detection of enclosed and spanning stays; permission of back-to-back stays where check-out matches existing check-in.
- **Capacity Enforcement**: Rejection of bookings when hotel room capacity is exhausted.

---

## 6. Approximate Effort & Time Spent

- **Total Development Effort**: **~12 hours**
- **Breakdown**:
  - Database schema design, composite indexing & sample data seed: **1.5 hours**
  - Spring Boot 3 REST APIs, pessimistic locking (`FOR UPDATE`) & JUnit 5 tests: **4.5 hours**
  - React frontend, Tailwind responsive design & date picker integration: **4 hours**
  - Surprise Feature (Contactless QR Check-In Pass & `@media print` PDF styles): **1 hour**
  - Edge case testing, bug fixing, and design documentation: **1 hour**

---

## 7. Unfinished Items (Future Roadmap)

While all core and surprise requirements are fully implemented, the following items remain open for future iterations:
1. **Interactive Amenities Filter**: The UI displays hotel amenity badges (e.g. Free WiFi, Infinity Pool, Spa); adding multi-select filter checkboxes in the search bar to filter by specific facilities.
2. **Server-Side Pagination**: Currently all available hotels are retrieved directly; adding Spring Data `Pageable` for large-scale hotel catalogs.
3. **Automated Email Dispatch**: Integrating an external email service (e.g., SendGrid or AWS SES) to automatically email the generated check-in pass directly to the guest.
4. **Multiple Room Tiers**: Expanding the single room category per hotel into multiple room types (Standard, Deluxe, Executive Suite).

---

## 8. Documentation & AI Assistance Disclosure

In accordance with assessment guidelines:
- Official documentation for **Spring Boot 3**, **Spring Data JPA**, **Hibernate**, and **Vite** was referenced for framework configuration and database connection pooling.
- **Google Gemini** was utilized as an AI programming assistant for scaffolding boilerplate DTO records, initial configuration templates, and troubleshooting local proxy routing.
- All core business logic—specifically the stay interval overlap query, the `@Lock(LockModeType.PESSIMISTIC_WRITE)` concurrency mechanism, and the pricing engine—was designed, verified, and understood by the candidate, who is prepared to explain every aspect of the architecture during technical interviews.

# Hotel Booking Portal - System Design Document

This document details the architectural decisions, database design, API contracts, concurrency handling, and trade-offs implemented in the Hotel Booking Portal.

---

## 1. Architecture

The system uses a **decoupled, 3-tier client-server architecture**:

```
+--------------------------------------------------------------+
|                React Frontend (SPA on Port 3000)             |
|  - Hotel Catalog, Search Bar & Date Pickers                  |
|  - Real-Time Price Preview & Booking Modal                   |
|  - Contactless Boarding Pass & QR Generator                  |
+------------------------------+-------------------------------+
                               |
                               | REST over HTTP (JSON)
                               v
+--------------------------------------------------------------+
|               Spring Boot 3 Backend (Port 5000)              |
|  - Controller Layer: Request mapping, DTOs & Validation     |
|  - Service Layer: Pricing engine, Date validation, Capacity  |
|  - Data Access Layer: Spring Data JPA & Hibernate            |
+------------------------------+-------------------------------+
                               |
                               | JDBC Connection Pool (HikariCP)
                               v
+--------------------------------------------------------------+
|                     MySQL 8.x Database                       |
|  - Relational Storage: `hotels`, `bookings`                  |
|  - Composite Indexes for sub-millisecond overlap queries     |
|  - Row-Level Locking (`FOR UPDATE`) for concurrency safety    |
+--------------------------------------------------------------+
```

### Communication Flow:
1. **Client-Side SPA**: Developed with React and Vite. In development, Vite's proxy routes `/api/*` requests directly to `http://127.0.0.1:5000`, eliminating cross-origin complications while maintaining clean relative URL paths.
2. **Spring Boot Backend**: Exposes RESTful endpoints conforming to HTTP standards (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
3. **Database Layer**: Spring Data JPA interacts with MySQL through HikariCP connection pooling. All write operations on reservations run inside declarative `@Transactional` boundaries.

---

## 2. Database Design

The relational schema is intentionally normalized into two core entities:

```sql
                     +-----------------------------+
                     |            HOTELS           |
                     +-----------------------------+
                     | id (PK, BIGINT AUTO_INC)    |
                     | name (VARCHAR 150)          |
                     | location (VARCHAR 100)      |
                     | description (TEXT)          |
                     | amenities (VARCHAR 255)     |
                     | price_per_night (DECIMAL)   |
                     | total_rooms (INT)           |
                     | image_url (VARCHAR 500)     |
                     | created_at (TIMESTAMP)      |
                     +--------------+--------------+
                                    | 1
                                    |
                                    | N
                     +--------------v--------------+
                     |           BOOKINGS          |
                     +-----------------------------+
                     | id (PK, BIGINT AUTO_INC)    |
                     | booking_reference (UNIQUE)  |
                     | hotel_id (FK -> hotels.id)  |
                     | guest_name (VARCHAR 150)    |
                     | guest_email (VARCHAR 150)   |
                     | check_in_date (DATE)        |
                     | check_out_date (DATE)       |
                     | total_nights (INT)          |
                     | total_amount (DECIMAL)      |
                     | status (VARCHAR 20)         |
                     | created_at (TIMESTAMP)      |
                     +-----------------------------+
```

### Constraints & Indexes:
1. **Foreign Key**: `bookings.hotel_id` references `hotels.id` with `ON DELETE CASCADE`.
2. **Unique Constraint**: `bookings.booking_reference` enforces globally unique reservation references.
3. **Index on Availability Query**:
   ```sql
   INDEX idx_hotel_availability (hotel_id, status, check_in_date, check_out_date)
   ```
   Ensures that queries filtering by hotel ID, confirmed status, and stay dates do not perform full-table scans.
4. **Index on Reservation Lookup**:
   ```sql
   INDEX idx_booking_lookup (booking_reference, guest_email)
   ```
   Enables instant retrieval during guest lookup and cancellation.

---

## 3. API Design

| Method | Endpoint | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/hotels` | Browse hotels with optional destination filter & date availability | `?location=&checkIn=&checkOut=` | `200 OK` (Array of Hotels with `available_rooms`) |
| `GET` | `/api/hotels/{id}` | View single hotel details & availability | `?checkIn=&checkOut=` | `200 OK` (Hotel Details) |
| `POST` | `/api/bookings/quote` | Calculate stay nights, nightly pricing, and total amount before booking | `{ hotelId, checkInDate, checkOutDate }` | `200 OK` (Quote summary & room availability) |
| `POST` | `/api/bookings` | Create a confirmed room booking | `{ hotelId, guestName, guestEmail, checkInDate, checkOutDate }` | `201 Created` (Booking details + Reference) |
| `GET` | `/api/bookings/{ref}` | Retrieve booking by reference and verified email | `?email=guest@example.com` | `200 OK` (Booking & Hotel pass data) |
| `POST` | `/api/bookings/{ref}/cancel` | Cancel an active booking and release inventory | `{ email: "guest@example.com" }` | `200 OK` (Cancellation Confirmation) |

---

## 4. Booking Logic

### 1. Date Validation Rules
- **Non-Past Check-In**: Check-in must be today or a future date:
  $$\text{checkIn} \ge \text{today}$$
- **Strict Stay Order**: Check-out must occur strictly after check-in:
  $$\text{checkOut} > \text{checkIn}$$
  *(Same-day check-in and check-out is rejected, as hotel stays require at least 1 night).*

### 2. Pricing Engine
Pricing is strictly computed on the backend to prevent client-side price tampering:
$$\text{totalNights} = \text{checkOutDate} - \text{checkInDate}$$
$$\text{totalAmount} = \text{totalNights} \times \text{hotel.pricePerNight}$$

### 3. Date Overlap Algorithm
Two stays $[A_{\text{in}}, A_{\text{out}})$ and $[B_{\text{in}}, B_{\text{out}})$ overlap if and only if:
$$A_{\text{in}} < B_{\text{out}} \quad \text{AND} \quad A_{\text{out}} > B_{\text{in}}$$

**Handling Back-to-Back Stays (Turnaround Days)**:
If Guest A checks out on `2026-12-10` and Guest B checks in on `2026-12-10`, they **do not overlap**:
$$\text{GuestA}_{\text{out}} (10) \not> \text{GuestB}_{\text{in}} (10) \implies \text{No Overlap}$$
The room is available for the next guest on the day of turnaround.

### 4. Cancellation & Inventory Release
Cancellation is handled by updating the booking status:
```sql
UPDATE bookings SET status = 'CANCELLED' WHERE booking_reference = :ref AND guest_email = :email
```
Because the room availability query strictly checks `status = 'CONFIRMED'`, cancelled reservations are omitted from the booked count immediately, restoring hotel inventory.

---

## 5. Design Decisions & Trade-Offs

### 1. Spring Boot 3 + Java 17 vs. Node.js
- **Decision**: Spring Boot 3 with Spring Data JPA.
- **Trade-off**: Spring Boot has slightly more initial setup than a lightweight Node/Express server, but provides enterprise-grade transaction management (`@Transactional`), native connection pooling (HikariCP), strong compile-time type safety, and robust ORM mapping.

### 2. Dynamic Overlap Calculation vs. Daily Inventory Table
- **Alternative Considered**: Maintaining a separate `room_inventory` table with rows for every room for every calendar date (365 rows per room).
- **Decision**: Dynamic calculation using interval overlap queries over confirmed bookings.
- **Trade-off**: The dynamic query avoids storing millions of calendar rows for empty dates and eliminates daily cron jobs to generate inventory. With a composite index on `(hotel_id, status, check_in_date, check_out_date)`, computing overlapping stays takes `< 2ms` for typical hotel capacities.

### 3. Java Records for DTOs
- **Decision**: Used modern Java `record` classes for DTOs (`QuoteRequestDto`, `BookingResponseDto`, etc.).
- **Benefit**: Eliminates boilerplate code (getters, constructors, `equals`, `hashCode`) and ensures immutable data transfer between layers.

---

## 6. Simultaneous Bookings (Concurrency & Race Conditions)

### The Problem:
Suppose a hotel has **1 room remaining**. User A and User B both view the room at the same time and hit "Confirm Booking" at the exact same millisecond. Without synchronization:
1. User A checks capacity: 1 room available.
2. User B checks capacity: 1 room available.
3. User A inserts booking.
4. User B inserts booking.
5. **Result: Overbooking (11 bookings on 10 rooms).**

### Our Implementation:
We serialize booking creation using **Pessimistic Write Locking** inside a database transaction:

```java
@Transactional
public BookingResponseDto createBooking(BookingRequestDto request) {
    // 1. Lock the specific hotel record in MySQL using SELECT ... FOR UPDATE
    Hotel hotel = hotelRepository.findByIdWithLock(request.hotelId())
        .orElseThrow(...);

    // 2. Count active overlapping bookings under the lock
    long activeBookings = bookingRepository.countActiveOverlappingBookings(
        hotel.getId(), request.checkInDate(), request.checkOutDate()
    );

    // 3. Validate capacity
    if (activeBookings >= hotel.getTotalRooms()) {
        throw new InvalidBookingException("Sorry, no rooms are available for the selected dates.");
    }

    // 4. Insert booking and commit transaction (releasing the lock)
    return BookingResponseDto.fromEntity(bookingRepository.save(booking));
}
```

### Alternative Considered (Optimistic Locking):
- Adding a `@Version private Long version;` field on `Hotel`.
- Under optimistic locking, User B's transaction would fail with an `OptimisticLockException` when trying to save.
- **Why Pessimistic Locking was chosen**: In hotel reservations, locking a single hotel row for `< 15ms` during booking insertion ensures deterministic queueing without throwing unexpected retry exceptions to the user.

---

## 7. Surprise Feature: Contactless Hotel Check-In Pass & QR Code

### What it does:
Upon booking confirmation or when retrieving an existing reservation, the portal renders an **interactive, airline-style digital check-in boarding pass**. It features:
- Hotel property name and city destination
- Unique reservation reference badge
- Guest name, contact email, and stay duration
- Total amount breakdown
- **Dynamic Scannable QR Code** encoding reservation verification metadata
- **1-Click "Print / Save PDF"** button with dedicated `@media print` styling

### Why I chose it:
Front-desk friction is a primary pain point in hotel operations. Guests typically fumble through emails searching for reservation numbers while desk agents manually re-type references. A clean, printable digital boarding pass with a scannable QR code allows front-desk staff to verify reservations instantly, even when the guest has no mobile internet access.

### How it was implemented:
- **Client-Side**: Utilizes `qrcode.react` to render an SVG QR matrix encoding the booking reference, guest email, and dates.
- **Print Optimization**: A custom `@media print` stylesheet isolates `#printable-pass` and hides navigation bars and buttons, allowing guests to save clean 1-page PDF passes using standard browser print dialogs.

---

## 8. Limitations and Future Improvements

If given more time, the following enhancements would be added:
1. **Multi-Room Categories**: Supporting multiple room tiers per hotel (e.g., Deluxe Suite vs. Standard Room) with category-specific inventory.
2. **Payment Gateway Integration**: Adding Stripe or Razorpay webhooks to handle payments before finalizing reservation status.
3. **Automated Email Service**: Integrating SendGrid or Amazon SES to email the PDF boarding pass directly to the guest.
4. **JWT Authentication & User Profiles**: Allowing returning guests to view all their past and upcoming stays under a single profile.
5. **Redis Caching**: Caching hotel details and catalog queries to reduce database read load during peak search traffic.

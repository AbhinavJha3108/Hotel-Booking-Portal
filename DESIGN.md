# Hotel Booking Portal — Design

## 1. Architecture

The application has three parts:

- **Frontend:** React displays hotels, search and booking forms, booking details, and a printable pass.
- **Backend:** Spring Boot exposes the REST API and applies the booking rules.
- **Database:** MySQL stores hotel and booking records.

The browser sends JSON requests to the backend. During local development, Vite forwards requests beginning with `/api` to the backend on port 5000.

## 2. Database design

There are two main tables:

- `hotels` stores a property's name, location, description, amenities, nightly price, room count, image URL, and creation time.
- `bookings` stores a unique booking reference, guest details, hotel, stay dates, night count, total price, status, and creation time.

Each booking belongs to one hotel. A hotel can have many bookings. The database enforces a unique booking reference and a foreign key from bookings to hotels. Indexes support availability checks and booking lookup. The SQL scripts are in `database/`.

## 3. API design

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/hotels` | List hotels; can filter by location and stay dates. |
| `GET` | `/api/hotels/{id}` | Get one hotel, optionally with availability for dates. |
| `POST` | `/api/bookings/quote` | Calculate the price and show availability for a stay. |
| `POST` | `/api/bookings` | Create a booking. |
| `GET` | `/api/bookings/{reference}?email=...` | Look up a booking using its reference and email. |
| `POST` | `/api/bookings/{reference}/cancel` | Cancel a booking using the guest email. |

## 4. Booking logic

- Check-in must be today or a later date, and check-out must be after check-in.
- The backend calculates the nights and total using the hotel's nightly price.
- Two stays overlap when one starts before the other ends and ends after the other starts. A check-out and check-in on the same date are allowed.
- Availability counts confirmed bookings that overlap the requested dates. Each booking uses one room; room types and booking multiple rooms are not supported.
- Cancelling changes the status to `CANCELLED`. Cancelled bookings no longer count toward availability.

## 5. Design decisions

- **Spring Boot and JPA:** These provide the API, database mapping, and transaction support in the Java backend. A smaller Node/Express backend would also work, but this project uses Java and Spring.
- **Calculate availability from bookings:** The app counts overlapping confirmed bookings instead of storing a separate inventory record for every date. This keeps the current two-table model simple. A daily inventory model may be a better fit if the app later needs room types or more detailed inventory rules.
- **Calculate prices on the backend:** The client requests a quote, but the server uses the stored nightly price when it creates a booking. This avoids relying on a price submitted by the browser.

## 6. Simultaneous bookings

When a booking is created, the backend starts a transaction and locks that hotel's database row. It then checks overlapping confirmed bookings and saves the new booking if capacity remains. This makes concurrent booking attempts for the same hotel wait their turn, reducing the chance of exceeding the room count. The quote and browse screens are informational; availability is checked again when the booking is submitted.

## 7. Surprise feature: printable booking pass

After a booking is retrieved or confirmed, the frontend can show a printable pass with booking details and a QR code. The QR code contains booking information for convenience. The app does not have a staff verification endpoint, so the QR code is not a separate verification system.

## 8. Limitations and improvements

The current app is a basic booking example. It does not include:

- User accounts or authentication. A booking reference and email are used for lookup and cancellation.
- Payments or automated booking emails.
- Different room categories or a request to book multiple rooms.
- Hotel pagination or amenity filters.
- A backend endpoint for staff to verify a QR code.

Possible next steps are to add authentication, payments, room categories, email confirmations, and staff-side booking verification as the project grows.

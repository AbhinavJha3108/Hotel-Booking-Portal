import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateNights, validateStayDates, datesOverlap } from '../src/utils/dateUtils.js';

describe('Booking Pricing & Night Calculation Rules', () => {
  it('correctly calculates total nights for a multi-day stay', () => {
    const nights = calculateNights('2026-12-01', '2026-12-05');
    assert.equal(nights, 4);
  });

  it('calculates total booking amount based on nights and nightly rate', () => {
    const nights = calculateNights('2026-12-10', '2026-12-13');
    const pricePerNight = 4800.00;
    const total = Number((nights * pricePerNight).toFixed(2));

    assert.equal(nights, 3);
    assert.equal(total, 14400.00);
  });
});

describe('Date Validation Rules', () => {
  it('rejects check-in dates in the past', () => {
    const result = validateStayDates('2020-01-01', '2020-01-05');
    assert.equal(result.valid, false);
    assert.match(result.message, /past/i);
  });

  it('rejects check-out dates equal to or before check-in', () => {
    const sameDay = validateStayDates('2026-12-01', '2026-12-01');
    assert.equal(sameDay.valid, false);
    assert.match(sameDay.message, /strictly after/i);

    const reversed = validateStayDates('2026-12-05', '2026-12-01');
    assert.equal(reversed.valid, false);
    assert.match(reversed.message, /strictly after/i);
  });

  it('accepts valid future stay dates', () => {
    const result = validateStayDates('2026-12-15', '2026-12-20');
    assert.equal(result.valid, true);
  });
});

describe('Stay Overlap Rules', () => {
  // Existing confirmed booking: Dec 10 to Dec 15
  const existingCheckIn = '2026-12-10';
  const existingCheckOut = '2026-12-15';

  it('detects overlap when requested stay falls completely inside existing booking', () => {
    const overlaps = datesOverlap(existingCheckIn, existingCheckOut, '2026-12-11', '2026-12-14');
    assert.equal(overlaps, true);
  });

  it('detects overlap when requested stay spans over existing booking', () => {
    const overlaps = datesOverlap(existingCheckIn, existingCheckOut, '2026-12-08', '2026-12-18');
    assert.equal(overlaps, true);
  });

  it('detects overlap when requested stay starts during existing booking', () => {
    const overlaps = datesOverlap(existingCheckIn, existingCheckOut, '2026-12-12', '2026-12-18');
    assert.equal(overlaps, true);
  });

  it('allows back-to-back stays where check-out matches existing check-in', () => {
    // New guest checking out on Dec 10, existing guest checking in on Dec 10
    const overlaps = datesOverlap(existingCheckIn, existingCheckOut, '2026-12-05', '2026-12-10');
    assert.equal(overlaps, false);
  });

  it('allows back-to-back stays where check-in matches existing check-out', () => {
    // Existing guest leaves Dec 15, new guest arrives Dec 15
    const overlaps = datesOverlap(existingCheckIn, existingCheckOut, '2026-12-15', '2026-12-20');
    assert.equal(overlaps, false);
  });
});

/**
 * Asset booking utilities — conflict detection, utilisation calculation, and calendar helpers.
 */

interface Booking {
  id: string;
  assetId: string;
  startDate: string;
  endDate: string;
  [key: string]: any;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string into a local-midnight Date. */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Count calendar days between two dates (inclusive of both start and end). */
function daysBetweenInclusive(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** True when two date ranges [aStart, aEnd] and [bStart, bEnd] overlap. */
function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

// ── Public API ───────────────────────────────────────────────────────────────────

/**
 * Detect overlapping bookings for a given asset.
 *
 * Returns every *pair* of bookings whose date ranges overlap.
 * Each pair appears only once (no duplicate mirror pairs).
 */
export function detectConflicts(
  assetId: string,
  bookings: Booking[],
): { booking1: Booking; booking2: Booking }[] {
  const assetBookings = bookings.filter((b) => b.assetId === assetId);
  const conflicts: { booking1: Booking; booking2: Booking }[] = [];

  for (let i = 0; i < assetBookings.length; i++) {
    for (let j = i + 1; j < assetBookings.length; j++) {
      const a = assetBookings[i];
      const b = assetBookings[j];
      if (
        rangesOverlap(
          parseDate(a.startDate),
          parseDate(a.endDate),
          parseDate(b.startDate),
          parseDate(b.endDate),
        )
      ) {
        conflicts.push({ booking1: a, booking2: b });
      }
    }
  }

  return conflicts;
}

/**
 * Calculate the utilisation rate for an asset over a given period.
 *
 * Counts unique calendar days that fall inside any booking range AND inside the
 * requested period.  Overlapping bookings do not double-count days.
 *
 * @returns `{ rate, bookedDays, totalDays }` where `rate` is 0–100.
 */
export function calculateUtilisation(
  assetId: string,
  periodStart: string,
  periodEnd: string,
  bookings: Booking[],
): { rate: number; bookedDays: number; totalDays: number } {
  const pStart = parseDate(periodStart);
  const pEnd = parseDate(periodEnd);
  const totalDays = daysBetweenInclusive(pStart, pEnd);

  if (totalDays <= 0) {
    return { rate: 0, bookedDays: 0, totalDays: 0 };
  }

  const assetBookings = bookings.filter((b) => b.assetId === assetId);

  // Build a Set of occupied day offsets (relative to pStart) to avoid double-counting.
  const occupiedDays = new Set<number>();

  for (const booking of assetBookings) {
    const bStart = parseDate(booking.startDate);
    const bEnd = parseDate(booking.endDate);

    // Clamp to period
    const effectiveStart = bStart < pStart ? pStart : bStart;
    const effectiveEnd = bEnd > pEnd ? pEnd : bEnd;

    if (effectiveStart > effectiveEnd) continue;

    const startOffset = Math.round(
      (effectiveStart.getTime() - pStart.getTime()) / 86_400_000,
    );
    const endOffset = Math.round(
      (effectiveEnd.getTime() - pStart.getTime()) / 86_400_000,
    );

    for (let d = startOffset; d <= endOffset; d++) {
      occupiedDays.add(d);
    }
  }

  const bookedDays = occupiedDays.size;
  const rate = Math.round((bookedDays / totalDays) * 100);

  return { rate, bookedDays, totalDays };
}

/**
 * Get all bookings for a specific asset that fall within (or overlap) a given
 * calendar month.  Useful for rendering a monthly calendar view.
 *
 * @param month 0-indexed (0 = January, 11 = December) to match JS Date convention.
 */
export function getBookingsForMonth(
  assetId: string,
  year: number,
  month: number,
  bookings: Booking[],
): Booking[] {
  // First and last day of the target month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0); // last day of month

  return bookings.filter((b) => {
    if (b.assetId !== assetId) return false;
    return rangesOverlap(
      parseDate(b.startDate),
      parseDate(b.endDate),
      monthStart,
      monthEnd,
    );
  });
}

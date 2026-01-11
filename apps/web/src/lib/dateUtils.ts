export const DEFAULT_TIMEZONE = 'America/Bogota';

export const getLocalTimezone = (): string => {
    return localStorage.getItem('app_timezone') || DEFAULT_TIMEZONE;
};

export const setLocalTimezone = (timezone: string) => {
    localStorage.setItem('app_timezone', timezone);
};

/**
 * Returns a Date object representing the current time in the specified timezone
 */
export const getNowInTimezone = (timezone: string = getLocalTimezone()): Date => {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offset = tzDate.getTime() - utcDate.getTime();
    return new Date(now.getTime() + offset);
};

/**
 * Converts a local Date object (user selected) to a UTC ISO string,
 * interpreting the local Date as belonging to the specified timezone.
 * 
 * Example: User selects 2 PM (local browser time, representing Bogota time).
 * We want to send the UTC equivalent of "2 PM Bogota" (7 PM UTC).
 */
export const toUTC = (date: Date, timezone: string = getLocalTimezone()): string => {
    const offsets: Record<string, number> = {
        'America/Bogota': -5,
        'UTC': 0,
        'America/New_York': -5,
        'America/Mexico_City': -6,
        'Europe/Madrid': 1,
    };

    const offsetHours = offsets[timezone] ?? -5;

    // 1. Get the "face value" components of the local date
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ms = date.getMilliseconds();

    // 2. Construct a UTC timestamp matching face values
    const faceValueUtc = Date.UTC(year, month, day, hours, minutes, seconds, ms);

    // 3. Shift by offset to get real UTC
    // 00:00 Bogota (-5) -> 05:00 UTC. 
    // 0 - (-5h) = +5h.
    const offsetMs = offsetHours * 60 * 60 * 1000;
    const finalUtcTimestamp = faceValueUtc - offsetMs;

    return new Date(finalUtcTimestamp).toISOString();
};

/**
 * Returns start and end of day in UTC for a given local date and timezone.
 * Useful for filtering "All events on Jan 11th in Bogota".
 */
export const getUTCRangeForDate = (date: Date, timezone: string = getLocalTimezone()): { start: string, end: string } => {
    // Start of day in Local
    const startLocal = new Date(date);
    startLocal.setHours(0, 0, 0, 0);

    // End of day in Local
    const endLocal = new Date(date);
    endLocal.setHours(23, 59, 59, 999);

    return {
        start: toUTC(startLocal, timezone),
        end: toUTC(endLocal, timezone)
    };
};

/**
 * Formats a date string (from backend) using UTC components.
 * 
 * WHY UTC?
 * The backend stores dates like '2025-11-13' as '2025-11-13T00:00:00Z'.
 * If we format this using the local timezone (e.g., Bogota -5), it becomes '2025-11-12 19:00',
 * effectively showing the wrong day.
 * 
 * By forcing the formatter to use 'UTC', we display exactly '2025-11-13', which is what the user expects.
 * 
 * @param locale Optional locale (defaults to browser's current locale).
 */
export const formatDateUTC = (dateStr: string | Date, locale?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    return new Intl.DateTimeFormat(locale, {
        timeZone: 'UTC', // FORCE UTC to preventing day-shifting
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};



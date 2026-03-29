import { addMinutes, isAfter, isBefore } from 'date-fns';

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
}

export function generateTimeSlots(
    date: Date,
    availability: any[],
    eventDuration: number,
    bufferTime: number,
    timezone: string
): TimeSlot[] {
    // 1. Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();

    // 2. Find the availability rules that match this day
    const dayRules = availability.filter(rule => rule.dayOfWeek === dayOfWeek);

    const slots: TimeSlot[] = [];
    const now = new Date();

    dayRules.forEach(rule => {
        // Parse the start and end times from the database (e.g., "09:00")
        const [startHour, startMin] = rule.startTime.split(':').map(Number);
        const [endHour, endMin] = rule.endTime.split(':').map(Number);

        // Create Date objects for the exact start/end boundaries on the selected date
        let currentSlotStart = new Date(date);
        currentSlotStart.setHours(startHour, startMin, 0, 0);

        const availabilityEnd = new Date(date);
        availabilityEnd.setHours(endHour, endMin, 0, 0);

        // Loop to generate slots until we hit the end of the availability window
        while (true) {
            const currentSlotEnd = addMinutes(currentSlotStart, eventDuration);

            // If this slot extends past the allowed end time, stop generating for this rule
            if (isAfter(currentSlotEnd, availabilityEnd)) {
                break;
            }

            // Only add the slot if it is in the future (prevents booking past times today)
            if (isAfter(currentSlotStart, now)) {
                slots.push({
                    startTime: currentSlotStart,
                    endTime: currentSlotEnd
                });
            }

            // Advance to the next slot, explicitly adding the buffer time!
            currentSlotStart = addMinutes(currentSlotEnd, bufferTime);
        }
    });

    // --- NEW CODE: Cleanup before returning ---

    // 1. Remove exact duplicates (if overlapping database rules exist)
    const uniqueSlots = Array.from(
        new Map(slots.map(slot => [slot.startTime.getTime(), slot])).values()
    );

    // 2. Sort them chronologically from morning to evening
    uniqueSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return uniqueSlots;
}

export function filterBookedSlots(slots: TimeSlot[], existingBookings: any[]): TimeSlot[] {
    return slots.filter(slot => {
        // Check if the current slot overlaps with ANY existing booking
        const isOverlapping = existingBookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);

            // The universal rule for time overlap:
            // (Start A < End B) AND (End A > Start B)
            return (
                isBefore(bookingStart, slot.endTime) &&
                isAfter(bookingEnd, slot.startTime)
            );
        });

        // Only keep the slot if it does NOT overlap
        return !isOverlapping;
    });
}
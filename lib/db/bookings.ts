import prisma from '@/lib/prisma';

export async function getAllBookings(filter?: 'upcoming' | 'past') {
    const now = new Date();

    try {
        return await prisma.booking.findMany({
            where: filter === 'upcoming'
                ? { startTime: { gte: now } }
                : filter === 'past'
                    ? { startTime: { lt: now } }
                    : {},
            // Upcoming bookings show the soonest first. Past bookings show the most recent first.
            orderBy: filter === 'past' ? { startTime: 'desc' } : { startTime: 'asc' },
            include: {
                eventType: true, // We need this to show the title and duration on the dashboard!
            },
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw new Error("Failed to fetch bookings");
    }
}

export async function getBookingById(id: string) {
    try {
        return await prisma.booking.findUnique({
            where: { id },
            include: { eventType: true },
        });
    } catch (error) {
        console.error(`Error fetching booking ${id}:`, error);
        throw new Error("Failed to fetch booking");
    }
}

export async function cancelBooking(id: string) {
    try {
        return await prisma.booking.update({
            where: { id },
            data: { status: "cancelled" },
        });
    } catch (error) {
        console.error(`Error cancelling booking ${id}:`, error);
        throw new Error("Failed to cancel booking");
    }
}
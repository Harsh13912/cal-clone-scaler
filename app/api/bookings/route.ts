import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getAllBookings } from '@/lib/db/bookings';

const bookingSchema = z.object({
    eventTypeId: z.string(),
    bookerName: z.string().min(2, "Name must be at least 2 characters"),
    bookerEmail: z.string().email("Invalid email address"),
    startTime: z.string(),
    endTime: z.string(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') as 'upcoming' | 'past' | undefined;

        const bookings = await getAllBookings(filter);
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Use safeParse instead of parse
        const parsed = bookingSchema.safeParse(body);

        // 2. Check for validation success explicitly
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 });
        }

        // 3. Use strictly typed parsed.data
        const startTime = new Date(parsed.data.startTime);
        const endTime = new Date(parsed.data.endTime);

        // 4. Double-Booking Prevention Check
        const overlappingBooking = await prisma.booking.findFirst({
            where: {
                eventTypeId: parsed.data.eventTypeId,
                status: "confirmed",
                // Universal overlap rule: New start < Old end AND New end > Old start
                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } }
                ]
            }
        });

        if (overlappingBooking) {
            return NextResponse.json(
                { error: "This time slot is no longer available." },
                { status: 409 }
            );
        }

        // 5. Create the Official Booking
        const booking = await prisma.booking.create({
            data: {
                eventTypeId: parsed.data.eventTypeId,
                bookerName: parsed.data.bookerName,
                bookerEmail: parsed.data.bookerEmail,
                startTime,
                endTime,
                status: "confirmed",
            }
        });

        return NextResponse.json(booking, { status: 201 });

    } catch (error) {
        // 6. Clean catch block! No more Zod errors to confuse TypeScript
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
}
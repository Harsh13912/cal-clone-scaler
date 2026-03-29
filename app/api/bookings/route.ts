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
        const validatedData = bookingSchema.parse(body);

        const startTime = new Date(validatedData.startTime);
        const endTime = new Date(validatedData.endTime);

        // 1. Double-Booking Prevention Check
        const overlappingBooking = await prisma.booking.findFirst({
            where: {
                eventTypeId: validatedData.eventTypeId,
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

        // 2. Create the Official Booking
        const booking = await prisma.booking.create({
            data: {
                eventTypeId: validatedData.eventTypeId,
                bookerName: validatedData.bookerName,
                bookerEmail: validatedData.bookerEmail,
                startTime,
                endTime,
                status: "confirmed",
            }
        });

        return NextResponse.json(booking, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
}
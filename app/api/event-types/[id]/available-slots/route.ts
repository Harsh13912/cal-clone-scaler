import { NextResponse } from 'next/server';
import { getEventTypeBySlug } from '@/lib/db/event-types';
import { getAllAvailability } from '@/lib/db/availability';
import prisma from '@/lib/prisma';
import { generateTimeSlots, filterBookedSlots } from '@/lib/time-slots';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function GET(
    request: Request,
    // Changed this line to expect 'id' instead of 'slug' to match the folder name
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Next.js 15 Fix

        // Grab the ?date= query parameter
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        if (!dateParam) {
            return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
        }

        const selectedDate = parseISO(dateParam);

        // Fetch Event Type Details (we pass 'id' here, which contains the actual slug text)
        const eventType = await getEventTypeBySlug(id);
        if (!eventType) {
            return NextResponse.json({ error: "Event type not found" }, { status: 404 });
        }

        // Fetch Weekly Availability Rules
        const availability = await getAllAvailability();

        // Fetch Existing Bookings specifically for this day to prevent double-booking
        const existingBookings = await prisma.booking.findMany({
            where: {
                eventTypeId: eventType.id,
                status: "confirmed",
                startTime: {
                    gte: startOfDay(selectedDate),
                    lte: endOfDay(selectedDate),
                }
            }
        });

        // Generate the base mathematical slots
        const baseSlots = generateTimeSlots(
            selectedDate,
            availability,
            eventType.duration,
            eventType.bufferTime || 0,
            "Asia/Kolkata"
        );

        // Filter out the slots that clash with existing bookings
        const availableSlots = filterBookedSlots(baseSlots, existingBookings);

        // Format nicely for the frontend to consume
        const formattedSlots = availableSlots.map(slot => ({
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString(),
            display: slot.startTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        }));

        return NextResponse.json(formattedSlots);

    } catch (error) {
        console.error("Error fetching available slots:", error);
        return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
    }
}
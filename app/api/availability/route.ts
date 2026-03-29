import { NextResponse } from 'next/server'
import { getAllAvailability, createAvailability } from '@/lib/db/availability'
import { z } from 'zod'

// Zod schema ensures times are formatted correctly and end time is AFTER start time
const availabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:mm format"),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:mm format"),
    timezone: z.string().default("Asia/Kolkata"),
}).refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"]
})

export async function GET() {
    try {
        const availability = await getAllAvailability()
        return NextResponse.json(availability)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Use safeParse instead of parse
        const parsed = availabilitySchema.safeParse(body);

        // 2. Check for success explicitly right here
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })
        }

        // 3. Pass the strictly typed parsed.data to your database
        const newAvailability = await createAvailability(parsed.data)

        return NextResponse.json(newAvailability, { status: 201 })
    } catch (error) {
        // 4. Clean catch block! No more Zod errors to confuse TypeScript
        return NextResponse.json({ error: "Failed to create availability" }, { status: 500 })
    }
}
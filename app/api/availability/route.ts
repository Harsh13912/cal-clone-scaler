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
        const validatedData = availabilitySchema.parse(body)

        const newAvailability = await createAvailability(validatedData)
        return NextResponse.json(newAvailability, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create availability" }, { status: 500 })
    }
}
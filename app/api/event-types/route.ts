import { NextResponse } from 'next/server'
import { getAllEventTypes, createEventType } from '@/lib/db/event-types'
import { z } from 'zod'

const eventTypeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric with hyphens"),
    description: z.string().optional(),
    // FIXED: Now allows any duration greater than 0, just like real Cal.com!
    duration: z.number().int().min(1, "Duration must be at least 1 minute"),
    bufferTime: z.number().optional().default(0),
})

export async function GET() {
    try {
        const eventTypes = await getAllEventTypes()
        return NextResponse.json(eventTypes)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch event types" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Use safeParse instead of parse
        const parsed = eventTypeSchema.safeParse(body)

        // 2. Check for validation success explicitly right here
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 })
        }

        // 3. Pass the strictly typed parsed.data to your database
        const newEventType = await createEventType(parsed.data)

        return NextResponse.json(newEventType, { status: 201 })
    } catch (error) {
        // 4. Clean catch block! No more Zod errors to confuse TypeScript
        return NextResponse.json({ error: "Failed to create event type" }, { status: 500 })
    }
}
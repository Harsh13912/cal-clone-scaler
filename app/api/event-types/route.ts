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
        const validatedData = eventTypeSchema.parse(body)
        const newEventType = await createEventType(validatedData)
        return NextResponse.json(newEventType, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Tell TypeScript this error is specifically a ZodError
            const zodError = error as z.ZodError;
            return NextResponse.json({ error: "Validation failed", details: zodError.errors }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create event type" }, { status: 500 })
    }
}
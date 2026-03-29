import { NextResponse } from 'next/server'
import { getEventTypeById, updateEventType, deleteEventType } from '@/lib/db/event-types'
import { z } from 'zod'

const updateSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug must be URL safe")
        .optional(),
    description: z.string().optional(),
    // FIXED: Now allows any integer duration >= 1 minute (and is optional for partial updates)
    duration: z.number().int().min(1, "Duration must be at least 1 minute").optional(),
    bufferTime: z.number().optional(),
})

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Next.js 15+ requires awaiting params
        const eventType = await getEventTypeById(id)
        if (!eventType) return NextResponse.json({ error: "Event type not found" }, { status: 404 })
        return NextResponse.json(eventType)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch event type" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Next.js 15+ requires awaiting params
        const body = await request.json()

        // 1. Use safeParse instead of parse
        const parsed = updateSchema.safeParse(body)

        // 2. Check for validation success explicitly right here
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 })
        }

        // 3. Pass the strictly typed parsed.data to your database
        const updatedEventType = await updateEventType(id, parsed.data)

        return NextResponse.json(updatedEventType)
    } catch (error) {
        // 4. Clean catch block! No more Zod errors to confuse TypeScript
        return NextResponse.json({ error: "Failed to update event type" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Next.js 15+ requires awaiting params
        const deletedEventType = await deleteEventType(id)
        return NextResponse.json(deletedEventType)
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event type" }, { status: 500 })
    }
}
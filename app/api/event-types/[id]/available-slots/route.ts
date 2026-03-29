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
    duration: z.number().int().min(1, "Duration must be at least 1 minute").optional(),
    bufferTime: z.number().optional(),
})

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const eventType = await getEventTypeById(id)
        if (!eventType) return NextResponse.json({ error: "Event type not found" }, { status: 404 })
        return NextResponse.json(eventType)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch event type" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json()
        const validatedData = updateSchema.parse(body)
        const updatedEventType = await updateEventType(id, validatedData)
        return NextResponse.json(updatedEventType)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update event type" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const deletedEventType = await deleteEventType(id)
        return NextResponse.json(deletedEventType)
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event type" }, { status: 500 })
    }
}
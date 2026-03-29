import { NextResponse } from 'next/server'
import { updateAvailability, deleteAvailability } from '@/lib/db/availability'
import { z } from 'zod'

const updateSchema = z.object({
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Next.js 15 Fix
        const body = await request.json()
        const validatedData = updateSchema.parse(body)

        const updated = await updateAvailability(id, validatedData)
        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Tell TypeScript this error is specifically a ZodError
            const zodError = error as z.ZodError;
            return NextResponse.json({ error: "Validation failed", details: zodError.errors }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // Next.js 15 Fix
        const deleted = await deleteAvailability(id)
        return NextResponse.json(deleted)
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete availability" }, { status: 500 })
    }
}
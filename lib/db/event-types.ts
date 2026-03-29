import prisma from '@/lib/prisma'
import { EventType } from '@prisma/client'

export async function getAllEventTypes() {
    try {
        return await prisma.eventType.findMany({
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error("Error fetching event types:", error)
        throw new Error("Failed to fetch event types")
    }
}

export async function getEventTypeById(id: string) {
    try {
        return await prisma.eventType.findUnique({ where: { id } })
    } catch (error) {
        console.error(`Error fetching event type with id ${id}:`, error)
        throw new Error("Failed to fetch event type")
    }
}

export async function getEventTypeBySlug(slug: string) {
    try {
        return await prisma.eventType.findUnique({ where: { slug } })
    } catch (error) {
        console.error(`Error fetching event type with slug ${slug}:`, error)
        throw new Error("Failed to fetch event type")
    }
}

export async function createEventType(data: {
    title: string
    slug: string
    description?: string
    duration: number
    bufferTime?: number
}) {
    try {
        return await prisma.eventType.create({ data })
    } catch (error) {
        console.error("Error creating event type:", error)
        throw new Error("Failed to create event type")
    }
}

export async function updateEventType(id: string, data: Partial<EventType>) {
    try {
        return await prisma.eventType.update({
            where: { id },
            data,
        })
    } catch (error) {
        console.error(`Error updating event type with id ${id}:`, error)
        throw new Error("Failed to update event type")
    }
}

export async function deleteEventType(id: string) {
    try {
        return await prisma.eventType.delete({ where: { id } })
    } catch (error) {
        console.error(`Error deleting event type with id ${id}:`, error)
        throw new Error("Failed to delete event type")
    }
}
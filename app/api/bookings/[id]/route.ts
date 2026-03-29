import { NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/db/bookings';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Next.js 15 Fix
        const cancelledBooking = await cancelBooking(id);
        return NextResponse.json(cancelledBooking);
    } catch (error) {
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}
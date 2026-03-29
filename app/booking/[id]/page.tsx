'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Check, ChevronLeft, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Booking {
    id: string;
    bookerName: string;
    bookerEmail: string;
    startTime: string;
    endTime: string;
    status: string;
    eventType: {
        title: string;
        duration: number;
        slug: string;
    };
}

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Safely fetch the booking data
        fetch('/api/bookings')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const found = data.find((b: Booking) => b.id === id);
                    if (found) setBooking(found);
                }
            })
            .catch(err => console.error("Failed to fetch booking details", err))
            .finally(() => setIsLoading(false));
    }, [id]);

    // --- RENDERING HELPERS ---
    const formatMeetingDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    const formatMeetingTimeRange = (startStr: string, endStr: string) => {
        const s = new Date(startStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const e = new Date(endStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${s} - ${e}`.toLowerCase();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#111111] flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-zinc-400 gap-4">
                <p>Booking not found or has been canceled.</p>
                <Button variant="outline" onClick={() => router.push('/dashboard/bookings')} className="border-zinc-800 bg-transparent hover:bg-zinc-800 text-white">
                    Back to Bookings
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 font-sans flex flex-col items-center pt-12 pb-12 px-4 selection:bg-zinc-800">

            <div className="w-full max-w-[650px] flex flex-col animate-in fade-in duration-500">

                <button
                    onClick={() => router.push('/dashboard/bookings')}
                    className="flex items-center text-zinc-400 hover:text-white transition-colors mb-6 w-max font-medium text-[14px]"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to bookings
                </button>

                <div className="bg-[#1c1c1c] border border-zinc-800/80 rounded-2xl p-10 flex flex-col shadow-2xl">

                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="h-12 w-12 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center mb-5">
                            <Check className="h-6 w-6" strokeWidth={3} />
                        </div>
                        <h2 className="text-[24px] font-bold text-white tracking-tight mb-2">This meeting is scheduled</h2>
                        <p className="text-[15px] text-zinc-400">We sent an email with a calendar invitation with the details to everyone.</p>
                    </div>

                    <div className="border-t border-zinc-800/80 pt-8 flex flex-col gap-6">

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
                            <span className="text-[15px] font-semibold text-white w-16 shrink-0">What</span>
                            <span className="text-[15px] text-zinc-300 font-medium">
                {booking.eventType.title} between You and {booking.bookerName}
              </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
                            <span className="text-[15px] font-semibold text-white w-16 shrink-0">When</span>
                            <div className="flex flex-col text-[15px] text-zinc-300 font-medium">
                                <span>{formatMeetingDate(booking.startTime)}</span>
                                <span>
                  {formatMeetingTimeRange(booking.startTime, booking.endTime)}
                                    <span className="text-zinc-500 ml-1">(India Standard Time)</span>
                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
                            <span className="text-[15px] font-semibold text-white w-16 shrink-0">Who</span>
                            <div className="flex flex-col gap-4 text-[15px] text-zinc-300 font-medium">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        Admin <Badge variant="secondary" className="bg-[#3b82f6]/20 text-blue-400 hover:bg-[#3b82f6]/20 border-0 text-[10px] px-1.5 py-0 h-[18px]">Host</Badge>
                                    </div>
                                    <span className="text-zinc-500 font-normal">admin@cal.com</span>
                                </div>
                                <div className="flex flex-col">
                                    <span>{booking.bookerName}</span>
                                    <span className="text-zinc-500 font-normal">{booking.bookerEmail}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
                            <span className="text-[15px] font-semibold text-white w-16 shrink-0">Where</span>
                            <span className="text-[15px] text-zinc-300 font-medium flex items-center gap-2 cursor-pointer hover:text-white">
                Cal Video <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              </span>
                        </div>

                    </div>

                    <div className="border-t border-zinc-800/80 mt-10 pt-8 flex flex-col items-center gap-6">
                        <p className="text-[14px] font-medium text-white">
                            Need to make a change? <span className="text-zinc-400 underline decoration-zinc-600 underline-offset-4 cursor-pointer hover:text-white transition-colors ml-1">Reschedule</span> <span className="text-zinc-600 mx-1.5">or</span> <span className="text-zinc-400 underline decoration-zinc-600 underline-offset-4 cursor-pointer hover:text-white transition-colors">Cancel</span>
                        </p>

                        <div className="flex items-center gap-4">
                            <span className="text-[14px] font-semibold text-white mr-2">Add to calendar</span>
                            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">G</Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">O</Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">A</Button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
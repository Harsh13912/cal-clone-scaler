'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    CalendarX2, MoreHorizontal, AlertCircle, X, Video,
    ListFilter, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type TabType = 'upcoming' | 'unconfirmed' | 'recurring' | 'past' | 'canceled';

export default function BookingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cancellation State
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bookings`);
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            } else {
                toast.error("Failed to load bookings");
            }
        } catch (error) {
            toast.error("An error occurred while fetching bookings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;

        setIsCancelling(true);
        try {
            const response = await fetch(`/api/bookings/${bookingToCancel}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Booking cancelled successfully");
                setBookingToCancel(null);
                fetchBookings(); // Refresh list to instantly move it to the Canceled tab
            } else {
                toast.error("Failed to cancel booking");
            }
        } catch (error) {
            toast.error("An error occurred while cancelling");
        } finally {
            setIsCancelling(false);
        }
    };

    const getFilteredBookings = () => {
        const now = new Date();
        switch (activeTab) {
            case 'upcoming':
                return bookings.filter(b => new Date(b.startTime) >= now && b.status === 'confirmed');
            case 'past':
                return bookings.filter(b => new Date(b.startTime) < now && b.status === 'confirmed').sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            case 'canceled':
                return bookings.filter(b => b.status === 'cancelled' || b.status === 'canceled');
            case 'unconfirmed':
            case 'recurring':
                return [];
            default:
                return [];
        }
    };

    const filteredBookings = getFilteredBookings();

    const renderEmptyState = () => {
        const messages = {
            upcoming: { title: "No upcoming bookings", desc: "As soon as someone books a time with you it will show up here." },
            unconfirmed: { title: "No unconfirmed bookings", desc: "Your unconfirmed bookings will show up here." },
            recurring: { title: "No recurring bookings", desc: "Your recurring bookings will show up here." },
            past: { title: "No past bookings", desc: "Your past bookings will show up here." },
            canceled: { title: "No canceled bookings", desc: "Your canceled bookings will show up here." }
        };

        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
                <div className="h-12 w-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-5">
                    <CalendarX2 className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-[16px] font-semibold text-white tracking-tight">{messages[activeTab].title}</h3>
                <p className="text-zinc-400 mt-1.5 text-[14px] max-w-[250px] leading-relaxed">
                    {messages[activeTab].desc}
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-12 font-sans min-h-screen max-w-[1050px] mx-auto pt-4">

            {/* Header Section */}
            <div className="flex flex-col mb-2 px-1">
                <h1 className="text-[24px] font-bold tracking-tight text-white">Bookings</h1>
                <p className="text-zinc-400 text-[14px] mt-1.5 font-normal">
                    See upcoming and past events booked through your event type links.
                </p>
            </div>

            {/* Authentic Cal.com Tabs with Filter Button on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 px-1 gap-4 sm:gap-0">
                <div className="flex space-x-6 overflow-x-auto no-scrollbar">
                    {(['upcoming', 'unconfirmed', 'recurring', 'past', 'canceled'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-[14px] font-medium transition-colors relative capitalize whitespace-nowrap ${
                                activeTab === tab ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-md" />
                            )}
                        </button>
                    ))}
                    <div className="pb-3 pl-2 flex items-center border-l border-zinc-800 ml-2">
                        <button className="flex items-center gap-1.5 text-[14px] font-medium text-zinc-400 hover:text-zinc-300 transition-colors ml-4">
                            <ListFilter className="h-4 w-4" /> Filter
                        </button>
                    </div>
                </div>

                {/* Mock Saved Filters Dropdown */}
                <div className="pb-3 hidden sm:flex">
                    <button className="flex items-center gap-2 text-[14px] font-medium text-zinc-300 bg-transparent border border-zinc-800 px-3 py-1.5 rounded-md hover:bg-zinc-800/50 transition-colors">
                        <ListFilter className="h-3.5 w-3.5" /> Saved filters <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-2">
                {isLoading ? (
                    <div className="space-y-4 mt-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 w-full bg-zinc-800/50 rounded-lg" />
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <div className="border border-zinc-800 rounded-lg bg-transparent flex flex-col overflow-hidden">

                        {/* Subtle "NEXT" Group Header for upcoming */}
                        {activeTab === 'upcoming' && (
                            <div className="bg-zinc-900/40 border-b border-zinc-800 px-5 py-2.5">
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Next</span>
                            </div>
                        )}

                        {filteredBookings.map((booking) => {
                            return (
                                <div
                                    key={booking.id}
                                    onClick={() => router.push(`/booking/${booking.id}`)}
                                    className="group flex flex-col sm:flex-row sm:items-start justify-between px-5 py-5 hover:bg-zinc-900/50 transition-colors border-b border-zinc-800 last:border-b-0 cursor-pointer"
                                >
                                    {/* Left Side: Date, Time, and Video Link */}
                                    <div className="flex flex-col gap-1 w-full sm:w-[35%]">
                    <span className="text-white text-[14.5px] font-medium tracking-tight">
                      {format(new Date(booking.startTime), 'EEE, d MMM')}
                    </span>
                                        <span className="text-zinc-400 text-[13.5px] font-normal">
                      {format(new Date(booking.startTime), 'h:mma').toLowerCase()} - {format(new Date(booking.endTime), 'h:mma').toLowerCase()}
                    </span>

                                        {activeTab !== 'canceled' && (
                                            <div className="flex items-center text-blue-400 text-[13.5px] font-medium mt-1">
                                                <Video className="w-4 h-4 mr-1.5" /> Join Cal Video
                                            </div>
                                        )}
                                        {activeTab === 'canceled' && (
                                            <div className="mt-1">
                                                <Badge variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/10 border-0 font-medium px-2 py-0.5 rounded-[4px] text-[12px]">
                                                    Canceled
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Middle Side: Event Title & Participants */}
                                    <div className="flex flex-col gap-1 mt-3 sm:mt-0 w-full sm:w-[55%]">
                    <span className="text-white text-[14.5px] font-medium tracking-tight truncate">
                      {booking.eventType.title} between You and {booking.bookerName}
                    </span>
                                        <span className="text-zinc-400 text-[13.5px]">
                      You and {booking.bookerName}
                    </span>
                                    </div>

                                    {/* Right Side: Simple Action Dropdown */}
                                    <div className="flex items-start justify-end mt-4 sm:mt-0 w-full sm:w-[10%]">
                                        <div
                                            onClick={(e) => e.stopPropagation()} // Prevents row click when clicking menu
                                            className="flex items-center border border-zinc-800 rounded-md bg-transparent h-8"
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-full w-8 rounded-none text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-48 bg-[#1c1c1c] border-zinc-800 p-1 shadow-xl rounded-xl">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/booking/${booking.id}`)}
                                                        className="text-zinc-300 hover:!bg-zinc-800 hover:!text-white focus:!bg-zinc-800 focus:!text-white cursor-pointer rounded-md my-0.5"
                                                    >
                                                        <span>View Details</span>
                                                    </DropdownMenuItem>

                                                    {(activeTab === 'upcoming' || activeTab === 'unconfirmed') && (
                                                        <>
                                                            <div className="h-px bg-zinc-800 my-1 mx-1" />
                                                            <DropdownMenuItem
                                                                onClick={() => setBookingToCancel(booking.id)}
                                                                className="text-[#f87171] hover:!bg-red-500/10 hover:!text-red-400 focus:!bg-red-500/10 focus:!text-red-400 cursor-pointer rounded-md my-0.5"
                                                            >
                                                                <X className="mr-2.5 h-4 w-4 text-[#f87171]" />
                                                                <span>Cancel Booking</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}

                        {/* Bottom Pagination Bar */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-[#111111]">
                            <div className="flex items-center gap-3">
                                <button className="flex items-center justify-between w-[60px] h-8 px-2.5 border border-zinc-800 rounded-md text-[13px] text-zinc-300 hover:bg-zinc-900/50">
                                    10 <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                                </button>
                                <span className="text-zinc-400 text-[13px]">rows per page</span>
                            </div>

                            <div className="flex items-center gap-4 text-[13px] text-zinc-400">
                                <span>1-{filteredBookings.length} of {filteredBookings.length}</span>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 opacity-50 cursor-not-allowed rounded-md">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 opacity-50 cursor-not-allowed rounded-md">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Global Cancel Confirmation Dialog */}
            <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
                <DialogContent className="bg-[#1c1c1c] border-zinc-800 text-white sm:max-w-[450px] p-0 shadow-2xl rounded-2xl overflow-hidden gap-0 [&>button]:text-zinc-400 [&>button]:hover:text-white">
                    <div className="p-6">
                        <DialogHeader className="flex flex-row items-center gap-4 space-y-0 text-left">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3f1919] flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-500" strokeWidth={2.5} />
                            </div>
                            <DialogTitle className="text-[20px] font-bold tracking-tight">Cancel booking?</DialogTitle>
                        </DialogHeader>

                        <DialogDescription className="text-zinc-400 mt-4 text-[15px] leading-relaxed text-left ml-[60px]">
                            Are you sure you want to cancel this booking? This action cannot be undone, and the time slot will become available for others to book again.
                        </DialogDescription>
                    </div>

                    <div className="bg-[#242424] px-6 py-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                        <Button
                            variant="ghost"
                            onClick={() => setBookingToCancel(null)}
                            className="text-zinc-300 hover:text-white hover:bg-zinc-700 font-medium"
                        >
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelBooking}
                            disabled={isCancelling}
                            className="bg-white text-black hover:bg-zinc-200 font-medium border-0"
                        >
                            {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
'use client';

import React, { useState, useEffect, use } from 'react';
import {
    Clock, Video, Globe, ChevronDown, ChevronLeft, ChevronRight,
    CalendarDays, LayoutGrid, Loader2, Check, Calendar as CalendarIcon, UserPlus, ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type BookingStep = 'calendar' | 'form' | 'success';

export default function PublicBookingPage({ params }: { params: Promise<{ username: string, slug: string }> }) {
    const { username, slug } = use(params);

    const formattedName = username ? username.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Harsh Kumar (13912)";
    const fallbackTitle = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Meeting";

    // --- CORE STATE ---
    const [bookingStep, setBookingStep] = useState<BookingStep>('calendar');
    const [eventData, setEventData] = useState<any>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
    const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
    const [userSchedule, setUserSchedule] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FORM STATE & VALIDATION ---
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    // NEW: Email Regex Validation
    const isEmailValid = guestEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail) : false;

    const durationMinutes = eventData?.duration || 30;
    const displayTitle = eventData?.title || fallbackTitle;
    const description = eventData?.description || "testing";

    const today = new Date(2026, 2, 29);
    today.setHours(0, 0, 0, 0);

    // --- DYNAMIC TIME SLOT GENERATOR ---
    const generateTimeSlots = (date: Date | null, format24h: boolean) => {
        if (!date) return [];

        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayName = dayNames[date.getDay()];

        let daySchedule = userSchedule?.weeklySchedule?.[dayName];
        if (!daySchedule) {
            if (date.getDay() === 0 || date.getDay() === 6) return [];
            daySchedule = { active: true, slots: [{ start: '09:00', end: '17:00' }] };
        }

        if (!daySchedule.active) return [];

        const generatedSlots: string[] = [];

        daySchedule.slots.forEach((slot: { start: string, end: string }) => {
            const [startH, startM] = slot.start.split(':').map(Number);
            const [endH, endM] = slot.end.split(':').map(Number);

            let currentMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;

            while (currentMins + durationMinutes <= endMins) {
                const h = Math.floor(currentMins / 60);
                const m = currentMins % 60;

                if (format24h) {
                    generatedSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                } else {
                    const ampm = h >= 12 ? 'pm' : 'am';
                    const h12 = h % 12 || 12;
                    generatedSlots.push(`${h12}:${m.toString().padStart(2, '0')}${ampm}`);
                }
                currentMins += durationMinutes;
            }
        });

        return generatedSlots;
    };

    const isAvailableDate = (dateObj: Date) => {
        const d = new Date(dateObj);
        d.setHours(0,0,0,0);
        const isPast = d.getTime() < today.getTime();
        if (isPast) return false;
        return generateTimeSlots(d, true).length > 0;
    };

    // --- EFFECTS ---
    useEffect(() => {
        setIsLoading(true);

        const stored = localStorage.getItem('cal-schedules');
        if (stored) {
            const schedules = JSON.parse(stored);
            setUserSchedule(schedules.find((s: any) => s.isDefault) || schedules[0]);
        }

        fetch('/api/event-types')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const match = data.find((e: any) => e.slug === slug);
                    if (match) setEventData(match);
                }
            })
            .catch(err => console.log("Failed to fetch event data", err))
            .finally(() => setIsLoading(false));
    }, [slug]);

    useEffect(() => {
        if (isLoading || selectedDate) return;

        let checkDate = new Date(today);
        for (let i = 0; i < 60; i++) {
            if (isAvailableDate(checkDate)) {
                setSelectedDate(new Date(checkDate));
                setCurrentMonth(new Date(checkDate.getFullYear(), checkDate.getMonth(), 1));
                break;
            }
            checkDate.setDate(checkDate.getDate() + 1);
        }
    }, [isLoading]);

    useEffect(() => {
        if (isLoading) return;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let found = false;
        for (let day = 1; day <= daysInMonth; day++) {
            const checkDate = new Date(year, month, day);
            checkDate.setHours(0,0,0,0);

            if (isAvailableDate(checkDate)) {
                setSelectedDate(checkDate);
                found = true;
                break;
            }
        }
        if (!found) setSelectedDate(null);
    }, [currentMonth.getTime(), isLoading]);

    // --- ACTIONS ---
    const handleTimeSelect = (timeStr: string) => {
        if (!selectedDate) return;

        const start = new Date(selectedDate);
        const isPM = timeStr.toLowerCase().includes('pm');
        const isAM = timeStr.toLowerCase().includes('am');
        const cleanTime = timeStr.replace(/am|pm/i, '').trim();
        let [hours, mins] = cleanTime.split(':').map(Number);

        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;

        start.setHours(hours, mins, 0, 0);

        const end = new Date(start.getTime() + durationMinutes * 60000);

        setSelectedStartTime(start);
        setSelectedEndTime(end);
        setBookingStep('form');
    };

    const handleConfirmBooking = async () => {
        // 1. Validation check
        if (!guestName || !isEmailValid || !selectedStartTime || !selectedEndTime || !eventData) return;

        setIsSubmitting(true);

        try {
            // 2. Send the real POST request to the database
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventTypeId: eventData.id,
                    bookerName: guestName,
                    bookerEmail: guestEmail,
                    startTime: selectedStartTime.toISOString(),
                    endTime: selectedEndTime.toISOString(),
                }),
            });

            if (response.ok) {
                // 3. Move to success screen ONLY if the database saved it successfully!
                setBookingStep('success');
            } else {
                const errorData = await response.json();
                console.error("Booking failed:", errorData);
                alert(errorData.error || "Failed to confirm booking. Please try again.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("A network error occurred. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- CALENDAR GRID GENERATION ---
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalRequiredCells = firstDayOfMonth + daysInMonth;
    const numRows = Math.ceil(totalRequiredCells / 7);
    const totalCellsToRender = numRows * 7;

    const calendarCells = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarCells.push({ day: daysInPrevMonth - i, monthOffset: -1, dateObj: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarCells.push({ day: i, monthOffset: 0, dateObj: new Date(year, month, i) });
    }
    for (let i = 1; i <= totalCellsToRender - calendarCells.length; i++) {
        calendarCells.push({ day: i, monthOffset: 1, dateObj: new Date(year, month + 1, i) });
    }

    const activeTimeSlots = generateTimeSlots(selectedDate, timeFormat === '24h');

    // --- RENDERING HELPERS ---
    const formatMeetingDate = (d: Date) => {
        return d.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatMeetingTimeRange = (start: Date, end: Date) => {
        const s = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const e = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${s} - ${e}`.toLowerCase();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#111111] flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 font-sans flex flex-col items-center pt-6 pb-12 px-4 selection:bg-zinc-800 relative">

            {/* Top Floating Actions (Hidden on Success step) */}
            {bookingStep !== 'success' && (
                <div className="w-full max-w-[1050px] flex justify-end gap-3 mb-6 z-10">
                    <Button className="bg-white text-black hover:bg-zinc-200 border-0 font-medium px-4 h-[36px] shadow-none rounded-md text-[14px]">
                        Need help?
                    </Button>
                    <div className="flex items-center border border-zinc-800 rounded-md bg-[#1c1c1c] h-[36px] p-0.5">
                        <button className="h-full w-10 flex items-center justify-center rounded-sm bg-zinc-800 text-white shadow-sm">
                            <CalendarDays className="h-[15px] w-[15px]" />
                        </button>
                        <button className="h-full w-10 flex items-center justify-center rounded-sm text-zinc-500 hover:text-white transition-colors">
                            <LayoutGrid className="h-[15px] w-[15px]" />
                        </button>
                    </div>
                </div>
            )}

            {/* =========================================
          STEP 1: CALENDAR VIEW
      ========================================= */}
            {bookingStep === 'calendar' && (
                <div className="bg-[#1c1c1c] border border-zinc-800/80 rounded-2xl w-full max-w-[1050px] flex flex-col md:flex-row shadow-2xl overflow-hidden min-h-[460px]">

                    {/* Left Column */}
                    <div className="p-8 md:w-[300px] flex-shrink-0 flex flex-col gap-6 md:border-r border-zinc-800/80">
                        <div className="flex flex-col gap-3">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                                <img src="https://github.com/shadcn.png" alt="Avatar" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[15px] font-medium text-zinc-400">{formattedName}</span>
                        </div>

                        <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                            {displayTitle}
                        </h1>

                        <div className="flex flex-col gap-3 text-[14px] font-medium text-zinc-300 mt-2">
                            <div className="flex items-center gap-3">
                                <Clock className="h-[18px] w-[18px] text-zinc-500" />
                                <span>{durationMinutes}m</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Video className="h-[18px] w-[18px] text-zinc-500" />
                                <span>Cal Video</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300 cursor-pointer hover:text-white transition-colors w-max mt-2">
                                <Globe className="h-[18px] w-[18px] text-zinc-500" />
                                <span>{userSchedule?.timezone || 'Asia/Kolkata'}</span>
                                <ChevronDown className="h-4 w-4 opacity-70" />
                            </div>
                        </div>
                    </div>

                    {/* Middle Column */}
                    <div className="p-8 flex-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h2 className="text-[16px] text-white tracking-tight">
                                <span className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long' })}</span>
                                <span className="text-zinc-400 font-medium ml-1.5">{year}</span>
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                                <div key={day} className="text-center text-[11px] font-bold text-zinc-500 tracking-wider mb-2">{day}</div>
                            ))}

                            {calendarCells.map((cell, i) => {
                                const { day, monthOffset, dateObj } = cell;
                                const isAvailable = monthOffset === 0 && isAvailableDate(dateObj);
                                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === dateObj.getMonth() && selectedDate?.getFullYear() === dateObj.getFullYear();
                                const isToday = today.getDate() === day && today.getMonth() === dateObj.getMonth() && today.getFullYear() === dateObj.getFullYear();

                                if (monthOffset !== 0) {
                                    return (
                                        <div key={i} className="flex flex-col items-center justify-center h-[44px] w-full text-[15px] font-normal text-zinc-700 relative">
                                            <span className="leading-none">{day}</span>
                                        </div>
                                    );
                                }

                                if (!isAvailable) {
                                    return (
                                        <div key={i} className={`flex flex-col items-center justify-center h-[44px] w-full text-[15px] font-normal relative ${dateObj < today ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                            <span className="leading-none">{day}</span>
                                            {isToday && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-zinc-500" />}
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(dateObj)}
                                        className={`flex flex-col items-center justify-center h-[44px] w-full rounded-md text-[15px] transition-all relative ${isSelected ? 'bg-white text-black font-semibold shadow-sm scale-105 z-10' : 'bg-[#292929] text-zinc-200 font-medium hover:bg-[#3f3f46]'}`}
                                    >
                                        <span className="leading-none">{day}</span>
                                        {isToday && <div className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-black' : 'bg-zinc-400'}`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Time Slots */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${selectedDate ? 'w-full md:w-[280px] opacity-100 md:border-l border-zinc-800/80' : 'w-0 opacity-0 border-none'}`}>
                        {selectedDate && (
                            <div className="flex flex-col h-full w-full p-6 pb-4">
                                <div className="flex-shrink-0 flex items-center justify-between mb-6">
                                    <h3 className="text-[16px] font-semibold text-white tracking-tight flex items-center gap-1.5">
                                        {selectedDate.toLocaleString('en-US', { weekday: 'short' })}
                                        <span className="font-normal text-zinc-400">{selectedDate.getDate().toString().padStart(2, '0')}</span>
                                    </h3>
                                    <div className="flex items-center bg-[#111111] border border-zinc-800 rounded-md p-0.5">
                                        <button onClick={() => setTimeFormat('12h')} className={`px-2.5 py-1 text-[12px] font-semibold rounded-sm transition-colors ${timeFormat === '12h' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>12h</button>
                                        <button onClick={() => setTimeFormat('24h')} className={`px-2.5 py-1 text-[12px] font-semibold rounded-sm transition-colors ${timeFormat === '24h' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>24h</button>
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    <div className="absolute inset-0 overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-2.5">
                                        {activeTimeSlots.length > 0 ? (
                                            activeTimeSlots.map((time, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleTimeSelect(time)}
                                                    className="w-full flex-shrink-0 border border-zinc-700/80 bg-transparent rounded-md py-2.5 flex items-center justify-center gap-2.5 group hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all"
                                                >
                                                    <div className="h-[6px] w-[6px] rounded-full bg-[#10b981] opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-[14px] font-medium text-zinc-200 tracking-tight">{time}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-zinc-500 text-[14px] text-center mt-10">No available times for this date.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =========================================
          STEP 2: FORM VIEW
      ========================================= */}
            {bookingStep === 'form' && selectedStartTime && selectedEndTime && (
                <div className="bg-[#1c1c1c] border border-zinc-800/80 rounded-2xl w-full max-w-[850px] flex flex-col md:flex-row shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                    {/* Form Left Info Column */}
                    <div className="p-8 md:w-[320px] flex-shrink-0 flex flex-col gap-6 md:border-r border-zinc-800/80 bg-[#1c1c1c]">
                        <div className="flex flex-col gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                                <img src="https://github.com/shadcn.png" alt="Avatar" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[15px] font-medium text-zinc-400">{formattedName}</span>
                        </div>

                        <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                            {displayTitle}
                        </h1>

                        <p className="text-zinc-400 text-[15px] leading-relaxed">{description}</p>

                        <div className="flex flex-col gap-4 text-[14px] font-medium text-zinc-300 mt-2">
                            <div className="flex items-start gap-3">
                                <CalendarIcon className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-white">{formatMeetingDate(selectedStartTime)}</span>
                                    <span className="text-zinc-400">{formatMeetingTimeRange(selectedStartTime, selectedEndTime)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-zinc-500" />
                                <span>{durationMinutes}m</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Video className="h-5 w-5 text-zinc-500" />
                                <span>Cal Video</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-zinc-500" />
                                <span>{userSchedule?.timezone || 'Asia/Kolkata'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Right Inputs Column */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-white">Your name *</label>
                                <Input
                                    value={guestName} onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="John Doe"
                                    className="bg-transparent border-zinc-700 text-white h-11 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-600 text-[15px]"
                                />
                            </div>

                            {/* NEW: Added UI validation feedback for incorrect emails */}
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-white">Email address *</label>
                                <Input
                                    type="email"
                                    value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={`bg-transparent border-zinc-700 text-white h-11 rounded-lg focus-visible:ring-1 text-[15px] ${guestEmail && !isEmailValid ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-zinc-600'}`}
                                />
                                {guestEmail && !isEmailValid && (
                                    <p className="text-red-500 text-[12px] mt-1.5">Please enter a valid email address.</p>
                                )}
                            </div>

                            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-3 h-9 px-3">
                                <UserPlus className="h-4 w-4 mr-2" /> Add guests
                            </Button>
                        </div>

                        <div className="mt-12 flex flex-col gap-6">
                            <p className="text-[13px] text-zinc-500">
                                By proceeding, you agree to Cal.com's <span className="text-zinc-300 font-medium cursor-pointer hover:text-white">Terms</span> and <span className="text-zinc-300 font-medium cursor-pointer hover:text-white">Privacy Policy</span>.
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <Button variant="ghost" onClick={() => setBookingStep('calendar')} className="text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium px-5">
                                    Back
                                </Button>
                                {/* NEW: Button disabled unless Name is entered and Email is perfectly formatted */}
                                <Button onClick={handleConfirmBooking} disabled={!guestName || !isEmailValid || isSubmitting} className="bg-white text-black hover:bg-zinc-200 font-medium px-6 border-0">
                                    {isSubmitting ? "Confirming..." : "Confirm"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
          STEP 3: SUCCESS VIEW
      ========================================= */}
            {bookingStep === 'success' && selectedStartTime && selectedEndTime && (
                <div className="w-full max-w-[650px] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-500">

                    <button
                        onClick={() => window.location.href = '/dashboard/bookings'}
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
                  {displayTitle} between {formattedName} and {guestName}
                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
                                <span className="text-[15px] font-semibold text-white w-16 shrink-0">When</span>
                                <div className="flex flex-col text-[15px] text-zinc-300 font-medium">
                                    <span>{formatMeetingDate(selectedStartTime)}</span>
                                    <span>
                    {formatMeetingTimeRange(selectedStartTime, selectedEndTime)}
                                        <span className="text-zinc-500 ml-1">({userSchedule?.timezone || 'India Standard Time'})</span>
                  </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
                                <span className="text-[15px] font-semibold text-white w-16 shrink-0">Who</span>
                                <div className="flex flex-col gap-4 text-[15px] text-zinc-300 font-medium">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            {formattedName} <Badge variant="secondary" className="bg-[#3b82f6]/20 text-blue-400 hover:bg-[#3b82f6]/20 border-0 text-[10px] px-1.5 py-0 h-[18px]">Host</Badge>
                                        </div>
                                        <span className="text-zinc-500 font-normal">admin@cal.com</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{guestName}</span>
                                        <span className="text-zinc-500 font-normal">{guestEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* FIXED: ExternalLink imported and successfully rendering here */}
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
            )}

            {/* Footer Branding */}
            <div className="mt-10 text-[15px] font-bold text-zinc-600 tracking-tight">
                Cal.com
            </div>

            <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}} />
        </div>
    );
}
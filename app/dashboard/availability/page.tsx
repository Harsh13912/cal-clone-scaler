'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Globe, Pencil, Copy, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AvailabilityPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [schedules, setSchedules] = useState<any[]>([]);

    // Modal State
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newScheduleName, setNewScheduleName] = useState("Working hours");

    useEffect(() => {
        // Mock Database using LocalStorage so schedules actually save!
        const stored = localStorage.getItem('cal-schedules');
        if (stored) {
            setSchedules(JSON.parse(stored));
        } else {
            const defaultSchedules = [
                { id: '1', name: 'Working hours', isDefault: true, summary: 'Mon - Fri, 9:00 AM - 5:00 PM', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
            ];
            setSchedules(defaultSchedules);
            localStorage.setItem('cal-schedules', JSON.stringify(defaultSchedules));
        }
        setIsLoading(false);
    }, []);

    const handleContinueNew = () => {
        if (!newScheduleName.trim()) return;

        // Save to our mock local storage database
        const newId = Date.now().toString();
        const newSchedule = {
            id: newId,
            name: newScheduleName,
            isDefault: false,
            summary: 'Mon - Fri, 9:00 AM - 5:00 PM',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const updatedSchedules = [...schedules, newSchedule];
        localStorage.setItem('cal-schedules', JSON.stringify(updatedSchedules));

        setIsNewModalOpen(false);
        // Redirect to the new edit page
        router.push(`/dashboard/availability/${newId}/edit`);
    };

    const executeDelete = (id: string) => {
        const updatedSchedules = schedules.filter(s => s.id !== id);
        setSchedules(updatedSchedules);
        localStorage.setItem('cal-schedules', JSON.stringify(updatedSchedules));
        toast.success("Schedule deleted");
    };

    return (
        <div className="space-y-6 pb-12 font-sans min-h-screen">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[24px] font-bold tracking-tight text-white">Availability</h1>
                    <p className="text-zinc-400 text-[14px] mt-1 font-normal">Configure times when you are available for bookings.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex p-1 bg-[#1c1c1c] border border-zinc-800 rounded-lg">
                        <button className="px-3 py-1.5 text-[13px] font-medium bg-zinc-800 text-white rounded-md shadow-sm">
                            My availability
                        </button>
                        <button className="px-3 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
                            Team availability
                        </button>
                    </div>

                    <Button onClick={() => { setNewScheduleName(""); setIsNewModalOpen(true); }} className="bg-white text-black hover:bg-zinc-200 border-0 rounded-md px-4 h-9 font-medium shadow-none transition-colors">
                        <Plus className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
                        New
                    </Button>
                </div>
            </div>

            {/* The Schedules List */}
            <div>
                {isLoading ? (
                    <Skeleton className="h-32 w-full bg-zinc-800/50 rounded-xl" />
                ) : schedules.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-[14px] border border-zinc-800 rounded-xl bg-transparent">
                        No schedules found. Create one to get started.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="flex flex-col sm:flex-row sm:items-start justify-between p-5 border border-zinc-800 rounded-xl bg-transparent hover:bg-zinc-900/30 transition-colors"
                            >
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-white text-[15px] tracking-tight">{schedule.name}</h3>
                                        {schedule.isDefault && (
                                            <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium px-2 py-0 rounded-md text-[11px] h-[22px]">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-zinc-300 text-[14px] font-normal tracking-tight">
                    {schedule.summary}
                  </span>
                                    <div className="flex items-center text-zinc-500 text-[13px] mt-1">
                                        <Globe className="h-[14px] w-[14px] mr-1.5" />
                                        {schedule.timezone}
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-0">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-transparent border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-zinc-800 p-1 shadow-xl rounded-xl">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/availability/${schedule.id}/edit`)} className="text-zinc-300 hover:!bg-zinc-800 hover:!text-white focus:!bg-zinc-800 focus:!text-white cursor-pointer rounded-md my-0.5">
                                                <Pencil className="mr-2.5 h-4 w-4 text-zinc-400" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                                            <DropdownMenuItem onClick={() => executeDelete(schedule.id)} className="text-[#f87171] hover:!bg-red-500/10 hover:!text-red-400 focus:!bg-red-500/10 focus:!text-red-400 cursor-pointer rounded-md my-0.5">
                                                <Trash className="mr-2.5 h-4 w-4 text-[#f87171]" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center mt-8">
                <p className="text-zinc-500 text-[14px]">
                    Temporarily out-of-office? <span className="text-zinc-300 underline cursor-pointer hover:text-white">Add a redirect</span>
                </p>
            </div>

            {/* PIXEL PERFECT NEW MODAL */}
            <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
                <DialogContent className="bg-[#1c1c1c] border-zinc-800 text-white sm:max-w-[450px] p-0 shadow-2xl rounded-2xl overflow-hidden gap-0">
                    <div className="p-6 pb-5">
                        <DialogHeader>
                            <DialogTitle className="text-[20px] font-bold tracking-tight mb-2 text-left">Add a new schedule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-4 text-left">
                            <label className="text-[14px] font-semibold text-white">Name</label>
                            <Input
                                value={newScheduleName}
                                onChange={(e) => setNewScheduleName(e.target.value)}
                                placeholder="e.g. holiday"
                                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 h-11 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-600 text-[15px]"
                            />
                        </div>
                    </div>

                    {/* Authentic Gray Footer */}
                    <div className="bg-[#242424] px-6 py-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                        <Button variant="ghost" onClick={() => setIsNewModalOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-700 font-medium">
                            Close
                        </Button>
                        <Button onClick={handleContinueNew} disabled={!newScheduleName.trim()} className="bg-white text-black hover:bg-zinc-200 font-medium border-0 px-5">
                            Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
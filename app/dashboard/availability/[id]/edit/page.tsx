'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Copy, Plus, Trash2, Pencil, Trash, Info
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DAYS_OF_WEEK = [
    { id: 'sun', label: 'Sunday' },
    { id: 'mon', label: 'Monday' },
    { id: 'tue', label: 'Tuesday' },
    { id: 'wed', label: 'Wednesday' },
    { id: 'thu', label: 'Thursday' },
    { id: 'fri', label: 'Friday' },
    { id: 'sat', label: 'Saturday' },
];

export default function EditAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [scheduleName, setScheduleName] = useState("");
    const [isDefault, setIsDefault] = useState(false);

    const [weeklySchedule, setWeeklySchedule] = useState<Record<string, { active: boolean, slots: { start: string, end: string }[] }>>({
        sun: { active: false, slots: [{ start: '09:00', end: '17:00' }] },
        mon: { active: true, slots: [{ start: '09:00', end: '17:00' }] },
        tue: { active: true, slots: [{ start: '09:00', end: '17:00' }] },
        wed: { active: true, slots: [{ start: '09:00', end: '17:00' }] },
        thu: { active: true, slots: [{ start: '09:00', end: '17:00' }] },
        fri: { active: true, slots: [{ start: '09:00', end: '17:00' }] },
        sat: { active: false, slots: [{ start: '09:00', end: '17:00' }] },
    });

    useEffect(() => {
        // Read from Mock DB
        const stored = localStorage.getItem('cal-schedules');
        if (stored) {
            const schedules = JSON.parse(stored);
            const current = schedules.find((s: any) => s.id === id);
            if (current) {
                setScheduleName(current.name);
                setIsDefault(current.isDefault);
            } else {
                setScheduleName("New Schedule");
            }
        }
        setIsLoading(false);
    }, [id]);

    const toggleDay = (dayId: string, checked: boolean) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], active: checked }
        }));
    };

    const updateTime = (dayId: string, slotIndex: number, field: 'start' | 'end', value: string) => {
        setWeeklySchedule(prev => {
            const newSlots = [...prev[dayId].slots];
            newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
            return { ...prev, [dayId]: { ...prev[dayId], slots: newSlots } };
        });
    };

    const addSlot = (dayId: string) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                active: true,
                slots: [...prev[dayId].slots, { start: '09:00', end: '17:00' }]
            }
        }));
    };

    const removeSlot = (dayId: string, slotIndex: number) => {
        setWeeklySchedule(prev => {
            const newSlots = prev[dayId].slots.filter((_, idx) => idx !== slotIndex);
            if (newSlots.length === 0) {
                return { ...prev, [dayId]: { active: false, slots: [{ start: '09:00', end: '17:00' }] } };
            }
            return { ...prev, [dayId]: { ...prev[dayId], slots: newSlots } };
        });
    };

    const handleSave = () => {
        setIsSaving(true);

        // Update our mock database
        const stored = localStorage.getItem('cal-schedules');
        if (stored) {
            let schedules = JSON.parse(stored);
            const sIndex = schedules.findIndex((s: any) => s.id === id);
            if (sIndex >= 0) {
                schedules[sIndex].name = scheduleName;
                schedules[sIndex].isDefault = isDefault;
                localStorage.setItem('cal-schedules', JSON.stringify(schedules));
            }
        }

        setTimeout(() => {
            toast.success("Schedule updated successfully");
            setIsSaving(false);
            // Wait for toast to render before pushing
            setTimeout(() => {
                router.push('/dashboard/availability');
            }, 300);
        }, 500);
    };

    if (isLoading) {
        return <div className="p-8 bg-[#111111] min-h-screen"><Skeleton className="h-12 w-1/3 bg-zinc-800 mb-8" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 font-sans pb-20">

            {/* Sticky Top Action Bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#111111] border-b border-zinc-800/80 -mx-4 sm:-mx-10 mb-8">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/availability')} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-2 mt-0.5">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Input
                                value={scheduleName}
                                onChange={(e) => setScheduleName(e.target.value)}
                                className="text-[18px] font-semibold text-white tracking-tight bg-transparent border-0 px-0 h-auto focus-visible:ring-0 w-[180px]"
                            />
                            <Pencil className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-zinc-400 text-[13px] mt-0.5">Mon - Fri, 9:00 AM - 5:00 PM</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3">
                        <span className="text-zinc-300 text-[14px] font-medium tracking-tight">Set as default</span>
                        <Switch
                            checked={isDefault} onCheckedChange={setIsDefault}
                            className="data-[state=checked]:!bg-white data-[state=unchecked]:!bg-zinc-800 border-0 [&_span]:data-[state=checked]:!bg-black [&_span]:data-[state=unchecked]:!bg-zinc-400"
                        />
                    </div>
                    <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-md">
                        <Trash className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-zinc-200 text-black hover:bg-white border-0 font-medium px-5 h-9 rounded-md shadow-none">
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            <div className="max-w-[950px] mx-auto flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                    <div className="border border-zinc-800 rounded-xl bg-transparent py-1">
                        <div className="flex flex-col px-5 divide-y divide-zinc-800/60">
                            {DAYS_OF_WEEK.map((day) => {
                                const dayData = weeklySchedule[day.id];
                                return (
                                    <div key={day.id} className="flex flex-col sm:flex-row sm:items-center py-4 gap-4 sm:gap-0">
                                        <div className="flex items-center gap-4 sm:w-[150px]">
                                            <Switch
                                                checked={dayData.active}
                                                onCheckedChange={(c) => toggleDay(day.id, c)}
                                                className="data-[state=checked]:!bg-white data-[state=unchecked]:!bg-zinc-800 border-0 [&_span]:data-[state=checked]:!bg-black [&_span]:data-[state=unchecked]:!bg-zinc-400"
                                            />
                                            <span className={`text-[15px] font-medium ${dayData.active ? 'text-white' : 'text-zinc-500'}`}>
                        {day.label}
                      </span>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-3">
                                            {!dayData.active ? (
                                                <div className="py-1.5 hidden sm:block"></div>
                                            ) : (
                                                dayData.slots.map((slot, index) => (
                                                    <div key={index} className="flex items-center gap-3 w-full">
                                                        <div className="flex items-center gap-2">
                                                            {/* Using type="time" forces correct format validation while looking like text */}
                                                            <input
                                                                type="time"
                                                                value={slot.start}
                                                                onChange={(e) => updateTime(day.id, index, 'start', e.target.value)}
                                                                className="bg-transparent border border-zinc-800 text-zinc-300 text-[14px] rounded-md px-3 h-9 w-[110px] text-center focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 [color-scheme:dark]"
                                                            />
                                                            <span className="text-zinc-600 text-[14px]">-</span>
                                                            <input
                                                                type="time"
                                                                value={slot.end}
                                                                onChange={(e) => updateTime(day.id, index, 'end', e.target.value)}
                                                                className="bg-transparent border border-zinc-800 text-zinc-300 text-[14px] rounded-md px-3 h-9 w-[110px] text-center focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 [color-scheme:dark]"
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-1 ml-2">
                                                            <Button variant="ghost" size="icon" onClick={() => addSlot(day.id)} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md">
                                                                <Plus className="h-[15px] w-[15px]" strokeWidth={2.5} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md">
                                                                <Copy className="h-[15px] w-[15px]" />
                                                            </Button>
                                                            {dayData.slots.length > 1 && (
                                                                <Button variant="ghost" size="icon" onClick={() => removeSlot(day.id, index)} className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md">
                                                                    <Trash2 className="h-[15px] w-[15px]" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border border-zinc-800 rounded-xl p-6 bg-transparent">
                        <h3 className="text-[15px] font-semibold text-white tracking-tight flex items-center gap-1.5">
                            Date overrides
                            <Info className="h-[14px] w-[14px] text-zinc-500" />
                        </h3>
                        <p className="text-zinc-400 text-[14px] mt-1.5 mb-4">Add dates when your availability changes from your daily hours.</p>
                        <Button variant="outline" className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md h-9 text-[14px]">
                            <Plus className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
                            Add an override
                        </Button>
                    </div>
                </div>

                <div className="w-full lg:w-[280px] flex-shrink-0 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-zinc-200 tracking-tight">Timezone</label>

                        {/* PIXEL PERFECT CUSTOM SELECT DROPDOWN */}
                        <Select defaultValue="Asia/Kolkata">
                            <SelectTrigger className="w-full bg-transparent border border-zinc-800 text-white text-[15px] rounded-lg px-3.5 h-[42px] focus:ring-1 focus:ring-zinc-700 focus:ring-offset-0">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1c1c1c] border-zinc-800 text-white rounded-xl shadow-xl p-1">
                                <SelectItem value="Asia/Ashgabat" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2 text-[14px]">Asia/Ashgabat GMT +5:00</SelectItem>
                                <SelectItem value="Asia/Samarkand" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2 text-[14px]">Asia/Samarkand GMT +5:00</SelectItem>
                                <SelectItem value="Asia/Tashkent" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2 text-[14px]">Asia/Tashkent GMT +5:00</SelectItem>
                                <SelectItem value="Asia/Kolkata" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2 text-[14px]">Asia/Kolkata GMT +05:30</SelectItem>
                                <SelectItem value="America/New_York" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2 text-[14px]">America/New York GMT -05:00</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>

                    <hr className="border-zinc-800/80" />

                    <div className="border border-zinc-800 rounded-xl p-5 bg-transparent space-y-3">
                        <h4 className="text-[14px] font-semibold text-white">Something doesn't look right?</h4>
                        <Button variant="outline" className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md h-9 text-[13px] px-4 w-full sm:w-auto">
                            Launch troubleshooter
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, Calendar, Clock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const navigation = [
    { name: "Event types", href: "/dashboard/event-types", icon: Link2 },
    { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Availability", href: "/dashboard/availability", icon: Clock },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const NavLinks = () => (
        <>
            {navigation.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                    <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
            <span
                className={`group flex items-center px-3 py-2 text-[14px] font-medium rounded-md mb-1 transition-colors ${
                    isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
            >
              <item.icon
                  className={`mr-3 flex-shrink-0 h-[18px] w-[18px] ${
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                  aria-hidden="true"
              />
                {item.name}
            </span>
                    </Link>
                );
            })}
        </>
    );

    return (
        // Base dark background
        <div className="flex h-screen bg-[#111111] font-sans">

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-[240px] md:flex-col md:fixed md:inset-y-0 border-r border-zinc-800 bg-[#111111]">
                <div className="flex flex-shrink-0 items-center px-6 pt-6 mb-6">
                    <div className="flex items-center gap-2.5">
                        {/* Cal.com Logo */}
                        <div className="h-6 w-6 bg-white rounded-md flex items-center justify-center">
                            <span className="text-black font-bold text-sm leading-none">C</span>
                        </div>
                        <span className="text-[16px] font-semibold tracking-tight text-white">Cal Clone</span>
                    </div>
                </div>

                <nav className="mt-2 flex-1 space-y-0.5 px-3">
                    <NavLinks />
                </nav>

                {/* NEW: Circular Profile Icon at bottom of sidebar */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 w-full hover:bg-zinc-800/50 p-2 rounded-md transition-colors cursor-pointer">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center overflow-hidden">
                            {/* Fallback avatar image */}
                            <img src="https://github.com/shadcn.png" alt="Profile" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[14px] font-medium text-white leading-tight">Admin User</span>
                            <span className="text-[12px] text-zinc-500 leading-tight">cal.com/admin</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-zinc-800 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-white rounded-md flex items-center justify-center">
                        <span className="text-black font-bold text-sm leading-none">C</span>
                    </div>
                    <span className="text-[16px] font-semibold tracking-tight text-white">Cal Clone</span>
                </div>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[240px] p-0 pt-5 bg-[#111111] border-r border-zinc-800 text-white flex flex-col">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <div className="px-6 mb-6 flex items-center gap-2">
                            <div className="h-6 w-6 bg-white rounded-md flex items-center justify-center">
                                <span className="text-black font-bold text-sm leading-none">C</span>
                            </div>
                            <span className="text-[16px] font-semibold tracking-tight text-white">Cal Clone</span>
                        </div>
                        <nav className="flex-1 space-y-0.5 px-3 mt-4">
                            <NavLinks />
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-[240px] overflow-hidden">
                <main className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
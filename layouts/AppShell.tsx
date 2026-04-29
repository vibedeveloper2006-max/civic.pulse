"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckSquare,
  MessageSquare,
  MapPin,
  User,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/timeline", label: "Timeline", icon: CalendarDays },
  { href: "/eligibility", label: "Eligibility", icon: ShieldCheck },
  { href: "/guide", label: "Guide", icon: CheckSquare },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/polling", label: "Polling", icon: MapPin },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col">
      {/* Top Nav */}
      <header className="bg-[#002855] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#e41d35] rounded flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CivicPulse</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              aria-label="Profile"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#c4c6d0] z-40 shadow-lg">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded transition-colors min-w-0 flex-1",
                pathname === href ? "text-[#002855]" : "text-[#747780]"
              )}
            >
              <Icon className={cn("w-5 h-5", pathname === href && "text-[#002855]")} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

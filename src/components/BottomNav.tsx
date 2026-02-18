"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, BrainCircuit, Settings, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { translations } from "@/utils/translations";
import { useApp } from "@/context/AppContext";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function BottomNav() {
    const pathname = usePathname();
    const { language } = useApp();
    const t = translations[language];

    const navItems = [
        { name: t.home || "Home", href: "/", icon: Home },
        { name: t.invoice || "Invoices", href: "/invoices", icon: FileText },
        { name: t.marketing || "Marketing", href: "/marketing", icon: Sparkles },
        { name: t.tools || "Tools", href: "/tools", icon: BrainCircuit },
        { name: t.settings || "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-border flex items-center justify-around px-6 pb-2 safe-area-bottom z-50">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                            isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-xl transition-all",
                            isActive && "bg-primary/10"
                        )}>
                            <Icon size={24} />
                        </div>
                        <span className="text-[10px] font-medium tracking-wide uppercase">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

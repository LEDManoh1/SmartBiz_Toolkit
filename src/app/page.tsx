"use client";

import { useApp } from "@/context/AppContext";
import { Sun, Moon, Sparkles, FileText, Users, TrendingUp, ArrowRight, Languages } from "lucide-react";
import Link from "next/link";
import { translations } from "@/utils/translations";

export default function Home() {
  const { isDarkMode, toggleDarkMode, plan, customerCount, language, setLanguage } = useApp();
  const t = translations[language];

  return (
    <div className="space-y-8 animate-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SmartBiz Toolkit</h1>
          <p className="text-muted-foreground italic">{t.tagline}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage(language === "sw" ? "en" : "sw")}
            className="p-3 rounded-2xl glass hover:bg-primary/5 transition-colors text-primary font-bold text-xs flex items-center gap-2"
          >
            <Languages size={18} /> {language.toUpperCase()}
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-2xl glass hover:bg-primary/5 transition-colors"
          >
            {isDarkMode ? <Sun className="text-primary" /> : <Moon className="text-primary" />}
          </button>
        </div>
      </header>

      {/* Plan Status Card */}
      <section className="glass rounded-[2rem] p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={120} />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {plan === "free" ? t.free_plan : `${plan.toUpperCase()} Plan`}
            </span>
            <h2 className="text-2xl font-bold mt-2">{t.health}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t.customers}</p>
            <p className="text-2xl font-black">{customerCount} <span className="text-sm font-normal text-muted-foreground">/ {plan === "free" ? "20" : "∞"}</span></p>
          </div>
        </div>

        {plan === "free" && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">{t.upgrade_desc}</p>
            <Link href="/settings" className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
              {t.upgrade_pro} <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/invoices" className="glass p-6 rounded-[2rem] space-y-3 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <FileText className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold">{t.invoice}</h3>
            <p className="text-[10px] text-muted-foreground tracking-tight">{language === "sw" ? "Tengeneza ankara za PDF bila kikomo" : "Generate unlimited PDF invoices"}</p>
          </div>
        </Link>
        <Link href="/marketing" className="glass p-6 rounded-[2rem] space-y-3 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold">{t.marketing}</h3>
            <p className="text-[10px] text-muted-foreground tracking-tight">{language === "sw" ? "Matangazo ya WhatsApp & Maelezo (Pro)" : "WhatsApp ads & Captions (Pro)"}</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Mockup */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">{t.recent_invoices}</h3>
          <Link href="/invoices" className="text-sm text-primary font-semibold">{t.view_all}</Link>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-background border border-border">
                  <Users size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm">Example Client {i}</p>
                  <p className="text-[10px] text-muted-foreground">#100{i} • Today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">25,000 Tsh</p>
                <div className="flex items-center gap-1 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[8px] font-bold uppercase text-green-500">Paid</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

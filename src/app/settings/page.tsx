"use client";

import { useApp } from "@/context/AppContext";
import { User, Shield, CreditCard, LogOut, CheckCircle2, Loader2, Zap, Star } from "lucide-react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useState } from "react";

import { translations } from "@/utils/translations";

const pricingPlans = [
    {
        id: "monthly",
        nameSw: "Pro ya Kila Mwezi",
        nameEn: "Monthly Pro",
        priceTsh: "12,000",
        priceUsd: 5,
        savingSw: "",
        savingEn: "",
        durationSw: "mwezi",
        durationEn: "month",
        amount: 12000,
    },
    {
        id: "quarterly",
        nameSw: "Pro ya Robo Mwaka",
        nameEn: "Quarterly Pro",
        priceTsh: "30,000",
        priceUsd: 12,
        savingSw: "Punguzo 10%",
        savingEn: "10% off",
        durationSw: "robo mwaka",
        durationEn: "quarter",
        amount: 30000,
    },
    {
        id: "yearly",
        nameSw: "Pro ya Mwaka",
        nameEn: "Yearly Pro",
        priceTsh: "99,000",
        priceUsd: 40,
        savingSw: "Punguzo 30%",
        savingEn: "30% off",
        durationSw: "mwaka",
        durationEn: "year",
        amount: 99000,
    },
];

export default function SettingsPage() {
    const { plan, billingCycle, setPlan, customerCount, language, setLanguage } = useApp();
    const t = translations[language];
    const [selectedCycle, setSelectedCycle] = useState<any>(pricingPlans.find(p => p.id === billingCycle) || pricingPlans[0]);
    const [isProcessing, setIsProcessing] = useState(false);

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-5d6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e-X",
        tx_ref: Date.now().toString(),
        amount: selectedCycle.amount,
        currency: "TZS",
        payment_options: "card,mobilemoney,ussd",
        customer: {
            email: "merchant@smartbiz.com",
            phone_number: "0719037557",
            name: "SmartBiz Merchant",
        },
        customizations: {
            title: `SmartBiz ${language === "sw" ? selectedCycle.nameSw : selectedCycle.nameEn}`,
            description: language === "sw" ? "Fungua AI Marketing + AI Add-ons" : "Unlock AI Marketing + AI Add-ons",
            logo: "https://st2.staticfile.org/favicon.ico",
        },
    };

    const handleFlutterPayment = useFlutterwave(config);

    const startProUpgrade = () => {
        setIsProcessing(true);
        handleFlutterPayment({
            callback: (response) => {
                if (response.status === "successful") {
                    setPlan("pro", selectedCycle.id);
                }
                setIsProcessing(false);
                closePaymentModal();
            },
            onClose: () => {
                setIsProcessing(false);
            },
        });
    };

    return (
        <div className="space-y-8 animate-in pb-10">
            <h2 className="text-2xl font-bold">{t.settings}</h2>

            <section className="glass rounded-[2rem] p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                        <User size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold italic">SmartBiz Merchant</h3>
                        <p className="text-sm text-muted-foreground">{language === "sw" ? "Umejiunga" : "Joined"} Feb 2026</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{language === "sw" ? "Maelezo ya Akaunti" : "Account Details"}</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-background rounded-2xl border border-border">
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className="text-muted-foreground" />
                                <span className="text-sm font-medium">{language === "sw" ? "Mpango wa Sasa" : "Current Plan"}</span>
                            </div>
                            <span className="text-sm font-bold text-primary uppercase">{plan === "pro" ? `${billingCycle} Pro` : t.free_plan}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-background rounded-2xl border border-border">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-muted-foreground" />
                                <span className="text-sm font-medium">{language === "sw" ? "Kiwango cha Wateja" : "Customer Quota"}</span>
                            </div>
                            <span className="text-sm font-bold">{customerCount} / {plan === "free" ? 20 : "∞"}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Language Section */}
            <section className="glass rounded-[2rem] p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{t.language}</h4>
                <div className="flex gap-2">
                    {["sw", "en"].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang as any)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${language === lang ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                }`}
                        >
                            {lang === "sw" ? "Kiswahili" : "English"}
                        </button>
                    ))}
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="space-y-4">
                <div className="flex items-end justify-between">
                    <h3 className="text-xl font-bold">{language === "sw" ? "Chagua Mpango" : "Choose Plan"}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "sw" ? "Ofa ya Mapema 💡" : "Early Adopter Offer 💡"}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {pricingPlans.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedCycle(p)}
                            className={`text-left p-5 rounded-[2rem] transition-all border-2 ${selectedCycle.id === p.id
                                ? "glass border-primary ring-4 ring-primary/10"
                                : "bg-secondary/50 border-transparent hover:border-border"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold">{language === "sw" ? p.nameSw : p.nameEn}</h4>
                                        {(language === "sw" ? p.savingSw : p.savingEn) && (
                                            <span className="text-[9px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full uppercase">
                                                {language === "sw" ? p.savingSw : p.savingEn}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-2xl font-black">{p.priceTsh}</span>
                                        <span className="text-xs text-muted-foreground ml-1">Tsh / {language === "sw" ? p.durationSw : p.durationEn}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Approx. ${p.priceUsd} USD</p>
                                </div>
                                {selectedCycle.id === p.id && <Star className="text-primary fill-primary" size={20} />}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="glass rounded-[2rem] p-6 space-y-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3 text-primary">
                        <Zap size={24} className="fill-primary/20" />
                        <p className="font-bold italic">{language === "sw" ? "Sifa za Mpango wa Malipo" : "Pro Plan Features"}</p>
                    </div>
                    <ul className="space-y-2">
                        {[
                            language === "sw" ? "AI Marketing Assistant (Matangazo & Maelezo)" : "AI Marketing Assistant (Ads & Captions)",
                            language === "sw" ? "AI Business Tools (Notes, Mitihani, Cards)" : "AI Business Tools (Notes, Exams, Cards)",
                            language === "sw" ? "Kuhifadhi Wateja Bila Kikomo" : "Unlimited Customer Profile Gating",
                            language === "sw" ? "Msaada wa Haraka & Vifaa Vingi" : "Priority Support & Multi-device Sync",
                        ].map((f, i) => (
                            <li key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 size={14} className="text-primary" /> {f}
                            </li>
                        ))}
                    </ul>

                    <div className="pt-4">
                        {plan === "free" ? (
                            <button
                                onClick={startProUpgrade}
                                disabled={isProcessing}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : `${language === "sw" ? "LIPPIA" : "PAY FOR"} ${(language === "sw" ? selectedCycle.nameSw : selectedCycle.nameEn).toUpperCase()}`}
                            </button>
                        ) : (
                            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                                <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} /> {language === "sw" ? `Kifurushi cha ${billingCycle} Kinafanya kazi` : `Active ${billingCycle} Subscription`}
                                </p>
                                <button
                                    onClick={() => setPlan("free")}
                                    className="text-[10px] text-muted-foreground mt-2 underline"
                                >
                                    {language === "sw" ? "Rudi kwenye Bila Malipo (Developer Mode)" : "Switch back to Free (Developer Mode)"}
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-center text-muted-foreground mt-4">
                            {language === "sw" ? "Malipo yanalindwa na **Flutterwave**. Mobile Money & Cards zinakubaliwa." : "Securely processed by **Flutterwave**. Mobile Money & Cards supported."}
                        </p>
                    </div>
                </div>
            </section>

            <button className="w-full py-4 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/5 rounded-2xl transition-colors mt-10">
                <LogOut size={20} /> {language === "sw" ? "Ondoka (Sign Out)" : "Sign Out"}
            </button>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Sparkles, MessageCircle, Instagram, Megaphone, Copy, Check, Loader2, AlertCircle, Lock } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from "next/link";
import { translations } from "@/utils/translations";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

type Category = "whatsapp" | "instagram" | "short_ad";

export default function MarketingAssistant() {
    const { plan, language } = useApp();
    const t = translations[language];
    const [category, setCategory] = useState<Category>("whatsapp");
    const [businessType, setBusinessType] = useState("");
    const [productName, setProductName] = useState("");
    const [offer, setOffer] = useState("");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (plan === "free") return; // Gated for Pro

        if (!businessType || !productName) {
            setError(language === "sw" ? "Tafadhali jaza aina ya biashara na jina la bidhaa" : "Please fill in business type and product name");
            return;
        }

        setIsLoading(true);
        setError("");
        setResult("");

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const languageRequest = language === "sw" ? "Output must be in Swahili (Kiswahili)." : "Output must be in English.";

            let prompt = "";
            if (category === "whatsapp") {
                prompt = `Generate a high-converting WhatsApp promotional message for a ${businessType} selling ${productName}. The offer is: ${offer}. Use emojis, bullet points, and a clear call to action. Keep it engaging but professional for a chat app. ${languageRequest}`;
            } else if (category === "instagram") {
                prompt = `Generate a catchy Instagram caption for a ${businessType}'s new post about ${productName}. Offer: ${offer}. Include relevant hashtags and a call to action. Style: Lifestyle and aspirational. ${languageRequest}`;
            } else {
                prompt = `Generate a short, punchy ad copy (under 100 words) for a ${businessType} promoting ${productName}. Offer: ${offer}. Focus on urgency and benefits. ${languageRequest}`;
            }

            const res = await model.generateContent(prompt);
            const text = res.response.text();
            setResult(text);
        } catch (err) {
            setError(language === "sw" ? "Imeshindwa kutengeneza maelezo. Angalia intaneti yako." : "Failed to generate content. Please check your API key or connection.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-purple-500" /> {t.marketing}
                </h2>
                {plan === "free" && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                        <Lock size={10} /> Pro
                    </span>
                )}
            </div>

            <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
                {(["whatsapp", "instagram", "short_ad"] as Category[]).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${category === cat ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/50"
                            }`}
                    >
                        {cat === "whatsapp" && <MessageCircle size={20} />}
                        {cat === "instagram" && <Instagram size={20} />}
                        {cat === "short_ad" && <Megaphone size={20} />}
                        <span className="text-[10px] font-bold mt-1 uppercase">
                            {cat === "short_ad" ? (language === "sw" ? "Tangazo" : "Ad Copy") : cat}
                        </span>
                    </button>
                ))}
            </div>

            <div className="glass p-6 rounded-[2rem] space-y-4">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">{language === "sw" ? "Aina ya Biashara" : "Business Type"}</label>
                        <input
                            placeholder={language === "sw" ? "m.f. Duka la Kahawa, Wakala wa Teknolojia" : "e.g. Coffee Shop, Tech Agency"}
                            className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">{language === "sw" ? "Jina la Bidhaa/Huduma" : "Product/Service Name"}</label>
                        <input
                            placeholder={language === "sw" ? "m.f. Arabica Roast, SEO Audit" : "e.g. Arabica Roast, SEO Audit"}
                            className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">{language === "sw" ? "Ofa ya Sasa (Hiari)" : "Current Offer (Optional)"}</label>
                        <input
                            placeholder={language === "sw" ? "m.f. Punguzo la 20% mwishoni mwa wiki" : "e.g. 20% off this weekend"}
                            className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            value={offer}
                            onChange={(e) => setOffer(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/20 text-xs">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                {plan === "free" ? (
                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center space-y-3">
                        <h4 className="font-bold flex items-center justify-center gap-2">
                            <Lock size={16} /> {t.restricted}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            {language === "sw"
                                ? "AI Marketing Assistant inapatikana kwa watumiaji wa Pro tu. Boresha sasa kupata huduma hii."
                                : "The AI Marketing Assistant is only available for Pro users. Upgrade now to unlock automated copywriting."}
                        </p>
                        <Link href="/settings" className="text-xs font-bold text-amber-600 underline">
                            {t.upgrade_pro}
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                    >
                        {isLoading ? <><Loader2 size={20} className="animate-spin" /> {language === "sw" ? "Inatengeneza..." : "Generating..."}</> : <><Sparkles size={20} /> {t.generate}</>}
                    </button>
                )}
            </div>

            {result && (
                <div className="glass p-6 rounded-[2rem] space-y-4 animate-in">
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <h3 className="font-bold text-sm uppercase tracking-wide">{language === "sw" ? "Yaliyotengenezwa" : "Generated Content"}</h3>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                            {isCopied ? <><Check size={14} /> {t.copied}</> : <><Copy size={14} /> {t.copy}</>}
                        </button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {result}
                    </p>
                </div>
            )}
        </div>
    );
}

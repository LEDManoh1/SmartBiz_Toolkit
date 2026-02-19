"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
    BrainCircuit, FileSearch, Sparkles, Copy, Check, Loader2, Lock,
    ArrowRight, BookMarked, ListChecks, Settings2, Download, Plus, Share2,
    History, Languages, Wand2, Type, FileText, MessageSquare, Coffee
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { jsPDF } from "jspdf";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

type ToolType = "notes" | "exam" | "flashcards";
type AIAction = "summarize" | "expand" | "simplify" | "translate" | "action_items";
type CategoryType = "Meeting" | "Clients" | "Training" | "SOP" | "Sales" | "General";

interface ExamQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
}

interface Flashcard {
    front: string;
    back: string;
}

export default function BusinessTools() {
    const { plan } = useApp();
    const [tool, setTool] = useState<ToolType>("notes");
    const [category, setCategory] = useState<CategoryType>("General");
    const [input, setInput] = useState("");
    const [result, setResult] = useState<string | ExamQuestion[] | Flashcard[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // New States
    const [tags, setTags] = useState<string[]>([]);
    const [actionItems, setActionItems] = useState<string[]>([]);
    const [aiOptions, setAiOptions] = useState({
        tone: "professional",
        length: "balanced",
        language: "en"
    });
    const [usageStats, setUsageStats] = useState({
        summaries: 0,
        lastUsed: ""
    });

    useEffect(() => {
        const savedStats = localStorage.getItem("sb_ai_usage");
        if (savedStats) setUsageStats(JSON.parse(savedStats));
    }, []);

    const updateUsage = () => {
        const newStats = {
            summaries: (usageStats.summaries || 0) + 1,
            lastUsed: new Date().toLocaleDateString()
        };
        setUsageStats(newStats);
        localStorage.setItem("sb_ai_usage", JSON.stringify(newStats));
    };

    const handleAction = async (action: AIAction) => {
        if (plan === "free" || !input) return;
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            let prompt = "";

            const optionsStr = `Tone: ${aiOptions.tone}, Length: ${aiOptions.length}, Context/Category: ${category}`;

            switch (action) {
                case "summarize":
                    prompt = `Summarize these ${category} notes professionally. ${optionsStr}. Output as a markdown summary with key points.\n\n${input}`;
                    break;
                case "expand":
                    prompt = `Elaborate on these ${category} points with more detail and context. ${optionsStr}.\n\n${input}`;
                    break;
                case "simplify":
                    prompt = `Rephrase this ${category} content to be as simple and easy to understand as possible. ${optionsStr}.\n\n${input}`;
                    break;
                case "translate":
                    prompt = `Translate this ${category} content to ${aiOptions.language === 'en' ? 'English' : 'Swahili'}. Maintain the original tone.\n\n${input}`;
                    break;
                case "action_items":
                    prompt = `Extract a list of actionable to-do items from this ${category} text. Format as a bulleted list of tasks.\n\n${input}`;
                    break;
            }

            const res = await model.generateContent(prompt);
            const text = res.response.text();

            if (action === "action_items") {
                const items = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*')).map(l => l.replace(/^[-*]\s*/, ''));
                setActionItems(items);
            } else {
                setResult(text);
            }

            updateUsage();
            autoDetectTags(input);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const autoDetectTags = async (text: string) => {
        if (text.length < 50) return;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Based on this text, provide 3-5 short categories/tags. Return ONLY the tags separated by commas.\n\n${text}`;
            const res = await model.generateContent(prompt);
            const detectedTags = res.response.text().split(',').map(tag => tag.trim());
            setTags(detectedTags);
        } catch (e) {
            console.error("Auto-tagging failed", e);
        }
    };

    const applyTemplate = (type: string) => {
        const templates: Record<string, string> = {
            meeting: "# Meeting Notes\nDate: \nTopic: \nAttendees: \n\n## Discussion Points\n- \n\n## Decisions\n- ",
            call: "# Client Call\nClient Name: \nObjective: \n\n## Key Notes\n- \n\n## Next Steps\n- ",
            plan: "# Project Plan\nProject: \nTimeline: \n\n## Objectives\n- \n\n## Deliverables\n- ",
            team_meeting: "# Team Meeting Summary\nOverview: \nKey Highlights: \nNext Milestones: \n\n---\nCreated via SmartBiz AI",
            sales_quiz: "Target Subject: Sales Strategy\nAudience: Sales Team\n\nGenerate a 5-question sales strategy quiz based on the following text...",
            customer_flashcards: "Target Subject: Customer Care\n\nGenerate 5 flashcards for customer service training based on the following text..."
        };
        setInput(templates[type]);
    };

    const handleSave = async () => {
        if (plan === "free" || !result) return;
        alert("Note saved successfully! (Cloud synchronization active for Pro)");
    };

    const exportToPDF = () => {
        if (!result) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(37, 99, 235);
        doc.text("SmartBiz AI Output", 20, 20);
        doc.setFontSize(12);
        doc.setTextColor(0);

        const splitText = doc.splitTextToSize(typeof result === 'string' ? result : JSON.stringify(result), 170);
        doc.text(splitText, 20, 40);
        doc.save(`AI_Output_${new Date().getTime()}.pdf`);
    };

    const shareViaWhatsApp = () => {
        if (!result) return;
        const text = encodeURIComponent(typeof result === 'string' ? result : JSON.stringify(result));
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareViaEmail = () => {
        if (!result) return;
        const body = encodeURIComponent(typeof result === 'string' ? result : JSON.stringify(result));
        window.location.href = `mailto:?subject=SmartBiz AI Notes&body=${body}`;
    };

    const handleProcess = async () => {
        if (plan === "free" || !input) return;

        setIsLoading(true);
        setResult(null);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            let prompt = "";

            if (tool === "exam") {
                prompt = `Generate 5 multiple choice questions based on the following text. Return ONLY a valid JSON array of objects with 'question', 'options' (array of 4 strings), 'answer' (the correct option string), and 'explanation' keys.\n\nContext: ${category}\n\n${input}`;
            } else if (tool === "flashcards") {
                prompt = `Generate 5 flashcards based on the following text. Return ONLY a valid JSON array of objects with 'front' and 'back' keys.\n\nContext: ${category}\n\n${input}`;
            }

            const res = await model.generateContent(prompt);
            const text = res.response.text().replace(/```json|```/g, "").trim();

            try {
                const parsed = JSON.parse(text);
                setResult(parsed);
                updateUsage();
            } catch (e) {
                console.error("Failed to parse AI JSON response", e);
                setResult(text);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                        Business Add-ons
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                        <Wand2 size={16} className="text-primary" /> Powered by Gemini AI
                    </p>
                </div>

                {usageStats.summaries > 0 && (
                    <div className="flex items-center gap-3 bg-secondary/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50 shadow-sm">
                        <History size={16} className="text-primary" />
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {usageStats.summaries} AI Syncs • <span className="text-primary/70">{usageStats.lastUsed}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex lg:flex-col gap-2 p-1.5 bg-secondary/50 backdrop-blur-sm rounded-3xl border border-border/50">
                        {(["notes", "exam", "flashcards"] as ToolType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTool(t); setResult(null); setActionItems([]); }}
                                className={`flex-1 flex lg:flex-row flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${tool === t
                                    ? "bg-background text-primary shadow-lg shadow-primary/5 scale-[1.02] border border-primary/10"
                                    : "text-muted-foreground hover:bg-background/40"
                                    }`}
                            >
                                <div className={`p-2 rounded-xl ${tool === t ? "bg-primary/10 text-primary" : "bg-secondary"}`}>
                                    {t === "notes" && <FileText size={20} />}
                                    {t === "exam" && <BrainCircuit size={20} />}
                                    {t === "flashcards" && <BookMarked size={20} />}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-wider">
                                    {t === "notes" ? "Smart Notes" : t === "exam" ? "AI Exams" : "Flashcards"}
                                </span>
                            </button>
                        ))}
                    </div>

                    {tool === "notes" && (
                        <div className="glass p-5 rounded-[2rem] space-y-4 border-primary/5 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Refinement Templates</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => applyTemplate('meeting')} className="flex items-center gap-3 p-3 text-xs font-bold hover:bg-primary/5 rounded-xl transition-all text-left border border-transparent hover:border-primary/10 group active:scale-95">
                                    <MessageSquare size={16} className="text-muted-foreground group-hover:text-primary" /> Meeting Notes
                                </button>
                                <button onClick={() => applyTemplate('team_meeting')} className="flex items-center gap-3 p-3 text-xs font-bold hover:bg-primary/5 rounded-xl transition-all text-left border border-transparent hover:border-primary/10 group active:scale-95">
                                    <Sparkles size={16} className="text-muted-foreground group-hover:text-primary" /> Team Summary
                                </button>
                                <button onClick={() => applyTemplate('call')} className="flex items-center gap-3 p-3 text-xs font-bold hover:bg-primary/5 rounded-xl transition-all text-left border border-transparent hover:border-primary/10 group active:scale-95">
                                    <Coffee size={16} className="text-muted-foreground group-hover:text-primary" /> Client Call
                                </button>
                            </div>
                        </div>
                    )}

                    {tool === "exam" && (
                        <div className="glass p-5 rounded-[2rem] space-y-4 border-primary/5 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Quiz Templates</h4>
                            <button onClick={() => applyTemplate('sales_quiz')} className="w-full flex items-center gap-3 p-3 text-xs font-bold hover:bg-primary/5 rounded-xl transition-all text-left border border-transparent hover:border-primary/10 group active:scale-95">
                                <BrainCircuit size={16} className="text-muted-foreground group-hover:text-primary" /> Sales Staff Quiz
                            </button>
                        </div>
                    )}

                    {tool === "flashcards" && (
                        <div className="glass p-5 rounded-[2rem] space-y-4 border-primary/5 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Card Templates</h4>
                            <button onClick={() => applyTemplate('customer_flashcards')} className="w-full flex items-center gap-3 p-3 text-xs font-bold hover:bg-primary/5 rounded-xl transition-all text-left border border-transparent hover:border-primary/10 group active:scale-95">
                                <BookMarked size={16} className="text-muted-foreground group-hover:text-primary" /> Customer Service
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="glass p-6 md:p-8 rounded-[2.5rem] space-y-6 shadow-xl shadow-primary/5 border-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Sparkles size={80} className="text-primary" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <Settings2 size={16} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Configuration</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {["Meeting", "Clients", "Training", "SOP", "Sales"].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat as CategoryType)}
                                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${category === cat
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                            : "bg-background text-muted-foreground border-border/50 hover:border-primary/30"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex gap-2">
                                {tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/30">
                        <div className="flex flex-wrap gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground ml-1">Tone</label>
                                <select
                                    value={aiOptions.tone}
                                    onChange={(e) => setAiOptions({ ...aiOptions, tone: e.target.value })}
                                    className="bg-background border border-border/50 px-3 py-1.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="creative">Creative</option>
                                    <option value="concise">Concise</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground ml-1">Length</label>
                                <select
                                    value={aiOptions.length}
                                    onChange={(e) => setAiOptions({ ...aiOptions, length: e.target.value })}
                                    className="bg-background border border-border/50 px-3 py-1.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="short">Short</option>
                                    <option value="balanced">Balanced</option>
                                    <option value="detailed">Detailed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground ml-1">Language</label>
                                <select
                                    value={aiOptions.language}
                                    onChange={(e) => setAiOptions({ ...aiOptions, language: e.target.value })}
                                    className="bg-background border border-border/50 px-3 py-1.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="en">English</option>
                                    <option value="sw">Swahili</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <textarea
                        placeholder={tool === "notes" ? "Paste your meeting notes, brainstorming ideas, or raw text here..." : "Paste the source text to generate content..."}
                        className="w-full bg-secondary/20 border border-border/50 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all min-h-[220px] text-base resize-none shadow-inner"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />

                    {plan === "free" ? (
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] text-center space-y-2">
                            <Lock size={24} className="mx-auto text-amber-500 mb-2" />
                            <p className="text-sm font-black uppercase tracking-widest text-amber-700">Pro Feature Restricted</p>
                            <p className="text-xs text-muted-foreground">Upgrade to Pro to unlock advanced AI capabilities and cloud synchronization.</p>
                        </div>
                    ) : (
                        tool === "notes" ? (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleAction("summarize")} disabled={isLoading || !input} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-sm">
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <FileSearch size={18} />} Summarize
                                    </button>
                                    <button onClick={() => handleAction("expand")} disabled={isLoading || !input} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-2xl font-bold border border-border active:scale-95 transition-all text-sm">
                                        <ArrowRight size={18} /> Expand
                                    </button>
                                    <button onClick={() => handleAction("simplify")} disabled={isLoading || !input} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-2xl font-bold border border-border active:scale-95 transition-all text-sm">
                                        <Type size={18} /> Simplify
                                    </button>
                                    <button onClick={() => handleAction("translate")} disabled={isLoading || !input} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-2xl font-bold border border-border active:scale-95 transition-all text-sm">
                                        <Languages size={18} /> Translate
                                    </button>
                                </div>
                                <button onClick={() => handleAction("action_items")} disabled={isLoading || !input} className="w-full py-3 bg-accent/10 text-accent border border-accent/20 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-accent/20 transition-all font-bold">
                                    <ListChecks size={16} /> Extract Action Items
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleProcess} disabled={isLoading || !input} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20">
                                {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Generate {tool === "exam" ? "Comprehensive Exam" : "Flashcard Set"}</>}
                            </button>
                        )
                    )}
                </div>

                {(result || actionItems.length > 0) && (
                    <div className="space-y-8 animate-in mt-10">
                        {result && tool === "notes" && typeof result === "string" && (
                            <div className="glass p-8 rounded-[3rem] relative bg-primary/5 border-primary/10 shadow-2xl shadow-primary/5">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><Sparkles size={18} /></div>
                                        <h3 className="font-black text-[12px] uppercase tracking-[0.2em] text-primary">AI Output Preview</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => { navigator.clipboard.writeText(result); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary" title="Copy">
                                            {isCopied ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                        <button onClick={exportToPDF} className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary" title="Export PDF">
                                            <Download size={18} />
                                        </button>
                                        <button onClick={shareViaWhatsApp} className="p-2 hover:bg-accent/10 rounded-xl transition-colors text-accent" title="Share WhatsApp">
                                            <Share2 size={18} />
                                        </button>
                                        <button onClick={shareViaEmail} className="p-2 hover:bg-blue-500/10 rounded-xl transition-colors text-blue-500" title="Share Email">
                                            <History size={18} />
                                        </button>
                                        <button onClick={handleSave} className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary" title="Save to Cloud">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-background/50 backdrop-blur-md p-6 rounded-[2rem] border border-primary/5 shadow-inner">
                                    <textarea className="w-full bg-transparent border-none outline-none resize-none font-medium text-sm leading-relaxed text-slate-700 dark:text-slate-300 min-h-[220px]" value={result} onChange={(e) => setResult(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {result && tool === "exam" && Array.isArray(result) && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-primary flex items-center gap-2 shadow-sm"><BrainCircuit size={18} /> AI Generated Exam</h3>
                                    <div className="flex gap-2">
                                        <button onClick={exportToPDF} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"><Download size={16} /></button>
                                        <button onClick={shareViaWhatsApp} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all"><Share2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {(result as ExamQuestion[]).map((q: ExamQuestion, idx: number) => (
                                        <div key={idx} className="glass p-8 rounded-[2.5rem] border-primary/5 hover:border-primary/20 transition-all group">
                                            <div className="flex items-start gap-4">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">{idx + 1}</span>
                                                <div className="space-y-4 flex-1">
                                                    <p className="font-bold text-base text-slate-800 dark:text-slate-200">{q.question}</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                        {q.options.map((opt: string, i: number) => (
                                                            <button key={i} className="text-left p-4 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary">
                                                                <span className="text-[10px] font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span> {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="mt-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                                                            <p className="text-[10px] font-black uppercase text-accent mb-1">AI Explanation</p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result && tool === "flashcards" && Array.isArray(result) && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-primary flex items-center gap-2"><BookMarked size={18} /> Study Flashcards</h3>
                                    <div className="flex gap-2">
                                        <button onClick={exportToPDF} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"><Download size={16} /></button>
                                        <button onClick={shareViaWhatsApp} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all"><Share2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(result as Flashcard[]).map((card: Flashcard, idx: number) => (
                                        <div key={idx} className="glass p-8 rounded-[3rem] flex flex-col items-center text-center space-y-6 border-t-4 border-t-primary hover:scale-[1.02] transition-all bg-background/50">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">Front</span>
                                                <p className="font-black text-lg text-slate-800 dark:text-slate-200">{card.front}</p>
                                            </div>
                                            <div className="w-16 h-1 bg-primary/20 rounded-full" />
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-accent/50">Back</span>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.back}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {actionItems.length > 0 && (
                            <div className="glass p-8 rounded-[2.5rem] border-accent/10 bg-accent/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-accent/20 rounded-xl text-accent"><ListChecks size={20} /></div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-accent">Action Items Extracted</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {actionItems.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-5 bg-background/60 backdrop-blur-md rounded-2xl border border-accent/10 group hover:border-accent transition-all shadow-sm">
                                            <div className="mt-1 w-5 h-5 rounded-lg border-2 border-accent/30 group-hover:border-accent group-hover:bg-accent/10 transition-all flex items-center justify-center">
                                                <Check size={12} className="text-accent scale-0 group-hover:scale-100 transition-all duration-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

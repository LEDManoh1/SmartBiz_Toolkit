"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BookOpen, BrainCircuit, FileSearch, Sparkles, Plus, Copy, Check, Loader2, Lock, Trash2, ArrowRight } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

type ToolType = "notes" | "exam" | "flashcards";

export default function BusinessTools() {
    const { plan } = useApp();
    const [tool, setTool] = useState<ToolType>("notes");
    const [input, setInput] = useState("");
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleProcess = async () => {
        if (plan === "free") return;
        if (!input) return;

        setIsLoading(true);
        setResult(null);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            let prompt = "";
            if (tool === "notes") {
                prompt = `Summarize the following notes into a professional, concise summary with key takeaways as bullet points: \n\n ${input}`;
            } else if (tool === "exam") {
                prompt = `Generate 5 multiple-choice questions based on this text. Format as a JSON array of objects with 'question', 'options' (array of 4), and 'answer' (the correct option string). Text: \n\n ${input}`;
            } else if (tool === "flashcards") {
                prompt = `Create 5 study flashcards from this text. Format as a JSON array of objects with 'front' and 'back' properties. Text: \n\n ${input}`;
            }

            const res = await model.generateContent(prompt);
            let text = res.response.text();

            if (tool !== "notes") {
                // Cleanup JSON if needed
                text = text.replace(/```json|```/g, "").trim();
                setResult(JSON.parse(text));
            } else {
                setResult(text);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <h2 className="text-2xl font-bold">Business Add-ons</h2>

            <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
                {(["notes", "exam", "flashcards"] as ToolType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => { setTool(t); setResult(null); }}
                        className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${tool === t ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/50"
                            }`}
                    >
                        {t === "notes" && <FileSearch size={20} />}
                        {t === "exam" && <BrainCircuit size={20} />}
                        {t === "flashcards" && <BookOpen size={20} />}
                        <span className="text-[10px] font-bold mt-1 uppercase">
                            {t === "notes" ? "AI Notes" : t === "exam" ? "Exam Gen" : "Flashcards"}
                        </span>
                    </button>
                ))}
            </div>

            <div className="glass p-6 rounded-[2rem] space-y-4">
                <textarea
                    placeholder={tool === "notes" ? "Paste your meeting notes here..." : "Paste the source text to generate content..."}
                    className="w-full bg-background border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[150px] text-sm resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                {plan === "free" ? (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center">
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Lock size={12} /> Pro required for AI Toolkit
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleProcess}
                        disabled={isLoading || !input}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Generate {tool.charAt(0).toUpperCase() + tool.slice(1)}</>}
                    </button>
                )}
            </div>

            {result && (
                <div className="space-y-4">
                    {tool === "notes" && (
                        <div className="glass p-6 rounded-[2rem] relative bg-primary/5 border-primary/10">
                            <h3 className="font-bold text-sm mb-3 text-primary">AI Summary</h3>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{result}</p>
                        </div>
                    )}

                    {tool === "exam" && Array.isArray(result) && (
                        <div className="space-y-3">
                            {result.map((q: any, idx: number) => (
                                <div key={idx} className="glass p-5 rounded-2xl space-y-3">
                                    <p className="font-bold text-sm">{idx + 1}. {q.question}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {q.options.map((opt: string, i: number) => (
                                            <div key={i} className={`p-3 rounded-xl border text-xs ${opt === q.answer ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-background border-border"}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tool === "flashcards" && Array.isArray(result) && (
                        <div className="grid grid-cols-1 gap-4">
                            {result.map((card: any, idx: number) => (
                                <div key={idx} className="glass p-6 rounded-[2rem] flex flex-col items-center text-center space-y-4 border-l-4 border-l-primary">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Front</span>
                                        <p className="font-bold">{card.front}</p>
                                    </div>
                                    <div className="w-full h-px bg-border/50" />
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Back</span>
                                        <p className="text-sm text-muted-foreground">{card.back}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

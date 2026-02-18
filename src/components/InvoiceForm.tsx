"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Trash2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { jsPDF } from "jspdf";

interface ServiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
}

import { translations } from "@/utils/translations";

export default function InvoiceForm() {
    const { addCustomer, plan, customerCount, language } = useApp();
    const t = translations[language];
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [items, setItems] = useState<ServiceItem[]>([
        { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, rate: 0 },
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const savedNum = localStorage.getItem("sb_last_invoice_num") || "1000";
        setInvoiceNumber((parseInt(savedNum) + 1).toString());
    }, []);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, rate: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
        setItems(
            items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const tax = subtotal * 0.15; // 15% Tax
    const total = subtotal + tax;

    const generatePDF = async () => {
        if (!clientName) {
            setError(language === "sw" ? "Jina la mteja linahitajika" : "Client name is required");
            return;
        }

        // We still try to register the customer, but we allow PDF generation either way
        // as per "Unlimited access kwa invoice generator"
        const isNewCustomerAllowed = addCustomer(clientName);
        if (!isNewCustomerAllowed && plan === "free") {
            setError(language === "sw"
                ? "Onyo: Umefikia kikomo cha wateja (20). Ankara itatengenezwa, lakini mteja mpya hataokolewa."
                : "Warning: Customer limit (20) reached. You can still generate invoices, but new customers won't be saved.");
        }

        setIsGenerating(true);
        setError("");

        try {
            const doc = new jsPDF();

            // Add Brand
            doc.setFontSize(22);
            doc.setTextColor(37, 99, 235); // Blue-600
            doc.text("SmartBiz Toolkit", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(t.tagline, 20, 26);

            // Invoice Details
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`${t.invoice.toUpperCase()}: #${invoiceNumber}`, 140, 20);
            doc.text(`DATE: ${new Date().toLocaleDateString()}`, 140, 26);

            // Client Info
            doc.setFontSize(14);
            doc.text(t.client_details.toUpperCase() + ":", 20, 50);
            doc.setFontSize(12);
            doc.text(clientName, 20, 57);
            if (clientEmail) doc.text(clientEmail, 20, 63);

            // Table Header
            doc.setFillColor(243, 244, 246);
            doc.rect(20, 80, 170, 10, "F");
            doc.setFontSize(10);
            doc.text(language === "sw" ? "Maelezo" : "Description", 25, 86);
            doc.text(language === "sw" ? "Idadi" : "Qty", 120, 86);
            doc.text(language === "sw" ? "Bei" : "Rate", 140, 86);
            doc.text(language === "sw" ? "Jumla" : "Amount", 170, 86);

            // Items
            let y = 96;
            items.forEach((item) => {
                doc.text(item.description || (language === "sw" ? "Huduma" : "Service"), 25, y);
                doc.text(item.quantity.toString(), 120, y);
                doc.text(`${t.currency === "$" ? "$" : ""}${item.rate.toLocaleString()}${t.currency !== "$" ? " " + t.currency : ""}`, 140, y);
                doc.text(`${t.currency === "$" ? "$" : ""}${(item.quantity * item.rate).toLocaleString()}${t.currency !== "$" ? " " + t.currency : ""}`, 170, y);
                y += 10;
            });

            // Totals
            y += 10;
            doc.line(20, y, 190, y);
            y += 10;
            doc.text("Subtotal:", 140, y);
            doc.text(`${t.currency === "$" ? "$" : ""}${subtotal.toLocaleString()}${t.currency !== "$" ? " " + t.currency : ""}`, 170, y);
            y += 7;
            doc.text("Tax (15%):", 140, y);
            doc.text(`${t.currency === "$" ? "$" : ""}${tax.toLocaleString()}${t.currency !== "$" ? " " + t.currency : ""}`, 170, y);
            y += 10;
            doc.setFontSize(14);
            doc.text("TOTAL:", 140, y);
            doc.text(`${t.currency === "$" ? "$" : ""}${total.toLocaleString()}${t.currency !== "$" ? " " + t.currency : ""}`, 170, y);

            doc.save(`Invoice_${invoiceNumber}.pdf`);

            // Update state
            localStorage.setItem("sb_last_invoice_num", invoiceNumber);
            setInvoiceNumber((parseInt(invoiceNumber) + 1).toString());

        } catch (err) {
            setError(language === "sw" ? "Imeshindwa kutengeneza PDF" : "Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t.new_invoice}</h2>
                <span className="text-sm font-mono bg-secondary px-3 py-1 rounded-lg">#{invoiceNumber}</span>
            </div>

            <div className="glass p-6 rounded-[2rem] space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t.client_details}</label>
                    <input
                        placeholder={language === "sw" ? "Jina la Mteja" : "Client Name"}
                        className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                    <input
                        placeholder={language === "sw" ? "Baruapepe ya Mteja (Hiari)" : "Client Email (Optional)"}
                        className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t.services}</label>
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-2 items-start">
                            <input
                                placeholder={language === "sw" ? "Maelezo" : "Description"}
                                className="flex-[3] bg-background border border-border p-3 rounded-xl outline-none"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder={language === "sw" ? "Idadi" : "Qty"}
                                className="flex-1 bg-background border border-border p-3 rounded-xl outline-none"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            />
                            <input
                                type="number"
                                placeholder={language === "sw" ? "Bei" : "Rate"}
                                className="flex-1 bg-background border border-border p-3 rounded-xl outline-none"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                            />
                            <button
                                onClick={() => removeItem(item.id)}
                                className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                disabled={items.length === 1}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                        <Plus size={16} /> {t.add_service}
                    </button>
                </div>

                <div className="pt-6 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{t.currency === "$" ? "$" : ""}{subtotal.toLocaleString()}{t.currency !== "$" ? " " + t.currency : ""}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (15%)</span>
                        <span>{t.currency === "$" ? "$" : ""}{tax.toLocaleString()}{t.currency !== "$" ? " " + t.currency : ""}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                        <span>Total</span>
                        <span className="text-primary">{t.currency === "$" ? "$" : ""}{total.toLocaleString()}{t.currency !== "$" ? " " + t.currency : ""}</span>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/20 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                    {isGenerating ? (language === "sw" ? "Inatengeneza..." : "Generating...") : <><Download size={20} /> {t.generate_pdf}</>}
                </button>
            </div>

            <div className="glass p-4 rounded-2xl flex items-center gap-3 bg-blue-500/5 border-blue-500/10">
                <CheckCircle className="text-blue-500" size={20} />
                <p className="text-xs text-muted-foreground">
                    {language === "sw"
                        ? "Ankara zinahifadhiwa kwenye kifaa chako. Boresha kwenda Pro kuhifadhi mtandaoni."
                        : "Invoices are saved locally. Upgrade to Pro to sync with cloud."}
                </p>
            </div>
        </div>
    );
}

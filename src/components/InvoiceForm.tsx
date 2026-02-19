"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Trash2, Download, CheckCircle, AlertCircle, Image as ImageIcon, Camera } from "lucide-react";
import { jsPDF } from "jspdf";

interface ServiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
}

import { translations } from "@/utils/translations";

export default function InvoiceForm() {
    const { addCustomer, plan, language } = useApp();
    const t = translations[language];
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [businessLogo, setBusinessLogo] = useState<string | null>(null);
    const [items, setItems] = useState<ServiceItem[]>([
        { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, rate: 0 },
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusinessLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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

    const updateItem = (id: string, field: keyof ServiceItem, value: string | number) => {
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
            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            let currentY = margin;

            // Add Brand Logo or Name
            if (businessLogo) {
                try {
                    // Estimate dimensions to maintain aspect ratio (simple approach)
                    doc.addImage(businessLogo, 'PNG', margin, currentY, 40, 20);
                    currentY += 25;
                } catch (e) {
                    console.error("Failed to add logo to PDF", e);
                }
            }

            doc.setFontSize(22);
            doc.setTextColor(37, 99, 235); // Blue-600
            doc.text("SmartBiz Toolkit", businessLogo ? 70 : margin, businessLogo ? currentY - 15 : currentY);

            if (!businessLogo) currentY += 6;

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(t.tagline, businessLogo ? 70 : margin, businessLogo ? currentY - 10 : currentY);

            if (!businessLogo) currentY += 14;
            else currentY += 5;

            // Invoice Details
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`${t.invoice.toUpperCase()}: #${invoiceNumber}`, pageWidth - margin - 50, 20);
            doc.text(`${language === 'sw' ? 'TAREHE' : 'DATE'}: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 26);

            // Client Info
            currentY = Math.max(currentY, 50);
            doc.setFontSize(14);
            doc.text(t.client_details.toUpperCase() + ":", margin, currentY);
            doc.setFontSize(12);
            doc.text(clientName, margin, currentY + 7);
            if (clientEmail) doc.text(clientEmail, margin, currentY + 13);

            // Table Header
            currentY += 30;
            doc.setFillColor(243, 244, 246);
            doc.rect(margin, currentY, pageWidth - (margin * 2), 10, "F");
            doc.setFontSize(10);
            doc.text(language === "sw" ? "Maelezo" : "Description", margin + 5, currentY + 6);
            doc.text(language === "sw" ? "Idadi" : "Qty", margin + 100, currentY + 6);
            doc.text(language === "sw" ? "Bei" : "Rate", margin + 120, currentY + 6);
            doc.text(language === "sw" ? "Jumla" : "Amount", margin + 150, currentY + 6);

            // Items
            currentY += 16;
            items.forEach((item) => {
                const desc = item.description || (language === "sw" ? "Huduma" : "Service");
                doc.text(desc, margin + 5, currentY);
                doc.text(item.quantity.toString(), margin + 100, currentY);
                doc.text(`${t.currency} ${item.rate.toLocaleString()}`, margin + 120, currentY);
                doc.text(`${t.currency} ${(item.quantity * item.rate).toLocaleString()}`, margin + 150, currentY);
                currentY += 10;
            });

            // Totals
            currentY += 10;
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;
            doc.text("Subtotal:", margin + 120, currentY);
            doc.text(`${t.currency} ${subtotal.toLocaleString()}`, margin + 150, currentY);
            currentY += 7;
            doc.text(language === 'sw' ? "Kodi (15%):" : "Tax (15%):", margin + 120, currentY);
            doc.text(`${t.currency} ${tax.toLocaleString()}`, margin + 150, currentY);
            currentY += 10;
            doc.setFontSize(14);
            doc.text("TOTAL:", margin + 120, currentY);
            doc.text(`${t.currency} ${total.toLocaleString()}`, margin + 150, currentY);

            doc.save(`Invoice_${invoiceNumber}.pdf`);

            // Update state
            localStorage.setItem("sb_last_invoice_num", invoiceNumber);
            setInvoiceNumber((parseInt(invoiceNumber) + 1).toString());

        } catch (err) {
            console.error(err);
            setError(language === "sw" ? "Imeshindwa kutengeneza PDF" : "Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in pb-24 md:pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {t.new_invoice}
                    </h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <Camera size={14} /> Professional billing made easy
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice No.</span>
                    <span className="text-lg font-mono bg-secondary/50 backdrop-blur-sm border border-border/50 px-4 py-1.5 rounded-2xl shadow-inner">
                        #{invoiceNumber}
                    </span>
                </div>
            </div>

            <div className="glass p-6 md:p-8 rounded-[2.5rem] space-y-8 shadow-2xl shadow-primary/5 border-primary/10">
                {/* Logo Section */}
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/70">{t.business_logo}</label>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-secondary/30 flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary/50 transition-all overflow-hidden">
                                {businessLogo ? (
                                    <img src={businessLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <ImageIcon className="text-muted-foreground group-hover:scale-110 transition-transform" size={32} />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {businessLogo && (
                                <button
                                    onClick={() => setBusinessLogo(null)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="font-bold text-sm md:text-base">{t.upload_logo}</p>
                            <p className="text-xs text-muted-foreground max-w-xs">PNG, JPG or SVG. Recommended size 400x200px. Max size 2MB.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70">{t.client_details}</label>
                        <input
                            placeholder={language === "sw" ? "Jina la Mteja" : "Client Name"}
                            className="w-full bg-secondary/20 border border-border/50 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg shadow-sm"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70">Email (Optional)</label>
                        <input
                            placeholder={language === "sw" ? "Baruapepe ya Mteja" : "Client Email"}
                            className="w-full bg-secondary/20 border border-border/50 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg shadow-sm"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-widest text-primary/70">{t.services}</label>
                        <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase md:hidden tracking-wider">Vertical Stacking Active</span>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="relative group bg-secondary/10 md:bg-transparent p-6 md:p-0 rounded-[2rem] md:rounded-none border border-border/30 md:border-0 shadow-sm md:shadow-none transition-all">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-4 items-end">
                                    <div className="md:col-span-6 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1 md:hidden">Service Description</label>
                                        <input
                                            placeholder={language === "sw" ? "Maelezo ya huduma" : "Service description"}
                                            className="w-full bg-background border border-border/50 p-4 md:p-3 rounded-2xl md:rounded-xl outline-none focus:ring-4 md:focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-base md:text-sm"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1 md:hidden">{language === 'sw' ? 'Idadi' : 'Quantity'}</label>
                                        <input
                                            type="number"
                                            placeholder="1"
                                            className="w-full bg-background border border-border/50 p-4 md:p-3 rounded-2xl md:rounded-xl outline-none focus:ring-4 md:focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm pl-4 text-base md:text-sm"
                                            value={item.quantity || ""}
                                            onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1 md:hidden">{language === 'sw' ? 'Bei (TSH)' : 'Rate (TSH)'}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold opacity-50">{t.currency}</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full bg-background border border-border/50 p-4 md:p-3 rounded-2xl md:rounded-xl outline-none focus:ring-4 md:focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm pl-12 md:pl-10 text-base md:text-sm"
                                                value={item.rate || ""}
                                                onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end md:mb-1">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-4 md:p-3 text-destructive hover:bg-destructive/10 rounded-2xl md:rounded-xl transition-all hover:rotate-12 active:scale-90"
                                            disabled={items.length === 1}
                                            title="Remove Item"
                                        >
                                            <Trash2 size={24} className="md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>
                                {index < items.length - 1 && <div className="hidden md:block h-px w-full bg-border/20 my-6" />}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addItem}
                        className="w-full md:w-auto flex items-center justify-center gap-3 text-primary font-black uppercase tracking-widest text-xs bg-primary/5 px-8 py-4 rounded-[2rem] border border-primary/20 hover:bg-primary/10 transition-all active:scale-95 shadow-lg shadow-primary/5"
                    >
                        <Plus size={18} /> {t.add_service}
                    </button>
                </div>

                <div className="pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="hidden md:block">
                        <div className="glass p-6 rounded-3xl bg-blue-500/5 border-blue-500/10 h-full flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-600">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-blue-900 dark:text-blue-100">Local Security</p>
                                <p className="text-xs text-muted-foreground">
                                    {language === "sw"
                                        ? "Ankara zinahifadhiwa kwenye kifaa chako pekee."
                                        : "Invoices are stored securely on your browser."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm px-2">
                            <span className="text-muted-foreground font-medium">Subtotal</span>
                            <span className="font-bold">{t.currency} {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm px-2">
                            <span className="text-muted-foreground font-medium">{language === 'sw' ? 'Kodi' : 'Tax'} (15%)</span>
                            <span className="font-bold text-destructive/80">{t.currency} {tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-black pt-4 border-t border-border/50 px-2 animate-in">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Total</span>
                            <span className="text-primary drop-shadow-sm">{t.currency} {total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-2xl border border-destructive/20 text-sm font-medium animate-pulse">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="hidden md:flex w-full py-5 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/30 disabled:opacity-50"
                >
                    {isGenerating ? (language === "sw" ? "Inatengeneza..." : "Generating...") : <><Download size={24} /> {t.generate_pdf}</>}
                </button>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden glass border-t border-border/50 p-4 z-50 animate-in translate-y-0 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-black text-primary truncate">{t.currency} {total.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="flex-[1.5] py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        {isGenerating ? "..." : <><Download size={18} /> {t.generate_pdf}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

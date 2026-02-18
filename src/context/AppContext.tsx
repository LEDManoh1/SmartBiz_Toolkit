"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Plan = "free" | "pro";
type BillingCycle = "monthly" | "quarterly" | "yearly";
type Language = "sw" | "en";

interface AppContextType {
    plan: Plan;
    billingCycle: BillingCycle;
    language: Language;
    setLanguage: (lang: Language) => void;
    customerCount: number;
    setPlan: (plan: Plan, cycle?: BillingCycle) => void;
    addCustomer: (name: string) => boolean;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [plan, setPlan] = useState<Plan>("free");
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const [language, setLanguage] = useState<Language>("sw");
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load state from local storage
        const savedPlan = localStorage.getItem("sb_plan") as Plan;
        const savedCycle = localStorage.getItem("sb_billing_cycle") as BillingCycle;
        const savedLang = localStorage.getItem("sb_lang") as Language;
        const savedTheme = localStorage.getItem("sb_theme");

        if (savedPlan) setPlan(savedPlan);
        if (savedCycle) setBillingCycle(savedCycle);
        if (savedLang) setLanguage(savedLang);

        const darkModeEnabled = savedTheme === "dark" ||
            (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

        setIsDarkMode(darkModeEnabled);
        if (darkModeEnabled) {
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        if (newVal) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("sb_theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("sb_theme", "light");
        }
    };

    const updatePlan = (newPlan: Plan, cycle?: BillingCycle) => {
        setPlan(newPlan);
        localStorage.setItem("sb_plan", newPlan);
        if (cycle) {
            setBillingCycle(cycle);
            localStorage.setItem("sb_billing_cycle", cycle);
        }
    };

    const [customers, setCustomers] = useState<string[]>([]);

    useEffect(() => {
        const savedCustomers = localStorage.getItem("sb_customers");
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    }, []);

    const addCustomer = (name: string): boolean => {
        if (customers.includes(name)) return true;
        if (plan === "free" && customers.length >= 20) {
            return false;
        }
        const newCustomers = [...customers, name];
        setCustomers(newCustomers);
        localStorage.setItem("sb_customers", JSON.stringify(newCustomers));
        return true;
    };

    const customerCount = customers.length;

    const updateLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("sb_lang", lang);
    };

    return (
        <AppContext.Provider value={{ plan, billingCycle, language, setLanguage: updateLanguage, customerCount, setPlan: updatePlan, addCustomer, isDarkMode, toggleDarkMode }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
}

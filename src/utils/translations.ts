export interface TranslationContent {
    welcome: string;
    tagline: string;
    health: string;
    customers: string;
    free_plan: string;
    pro_plan: string;
    upgrade_pro: string;
    upgrade_desc: string;
    invoice: string;
    marketing: string;
    tools: string;
    settings: string;
    home: string;
    recent_invoices: string;
    view_all: string;
    new_invoice: string;
    client_details: string;
    services: string;
    generate_pdf: string;
    add_service: string;
    language: string;
    theme: string;
    restricted: string;
    generate: string;
    copy: string;
    copied: string;
    currency: string;
}

export const translations: Record<"sw" | "en", TranslationContent> = {
    sw: {
        welcome: "Karibu tena kwenye toolkit yako",
        tagline: "Zana za kisasa kwa biashara yako",
        health: "Hali ya Biashara",
        customers: "Wateja",
        free_plan: "Bila Malipo",
        pro_plan: "Malipo (Pro)",
        upgrade_pro: "Njoo kwenye Pro",
        upgrade_desc: "Boresha sasa kupata AI Marketing, AI Add-ons na usawazishaji wa wingu.",
        invoice: "Ankara",
        marketing: "AI Marketing",
        tools: "Business Tools",
        settings: "Mipangilio",
        home: "Nyumbani",
        recent_invoices: "Ankara za Karibuni",
        view_all: "Zote",
        new_invoice: "Tengeneza Ankara",
        client_details: "Maelezo ya Mteja",
        services: "Huduma",
        generate_pdf: "Tengeneza PDF",
        add_service: "Ongeza Huduma",
        language: "Lugha",
        theme: "Mandhari",
        restricted: "Kipengele hiki kimezuiwa",
        generate: "Tengeneza Maelezo",
        copy: "Nakili",
        copied: "Imenakiliwa",
        currency: "Tsh",
    },
    en: {
        welcome: "Welcome back to your toolkit",
        tagline: "Modern tools for your business",
        health: "Business Health",
        customers: "Customers",
        free_plan: "Free Plan",
        pro_plan: "Pro Plan",
        upgrade_pro: "Upgrade to Pro",
        upgrade_desc: "Upgrade now for AI Marketing, AI Add-ons, and cloud sync.",
        invoice: "Invoice",
        marketing: "AI Marketing",
        tools: "Business Tools",
        settings: "Settings",
        home: "Home",
        recent_invoices: "Recent Invoices",
        view_all: "View All",
        new_invoice: "Generate Invoice",
        client_details: "Client Details",
        services: "Services",
        generate_pdf: "Generate PDF",
        add_service: "Add Service",
        language: "Language",
        theme: "Theme",
        restricted: "Restricted Feature",
        generate: "Generate Content",
        copy: "Copy",
        copied: "Copied",
        currency: "$",
    }
};

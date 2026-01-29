import {
    LayoutDashboard,
    Calendar,
    Users,
    UserCheck,
    BarChart3,
    ShieldCheck,
    Zap,
    Search,
    FileText,
    Smartphone,
    Database,
    Globe,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DemoStatsWidget } from '@/components/website/demos/DemoStatsWidget';
import { DemoCheckInWidget } from '@/components/website/demos/DemoCheckInWidget';
import { DemoCalendarWidget } from '@/components/website/demos/DemoCalendarWidget';
import { DemoSystemWidget } from '@/components/website/demos/DemoSystemWidget';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Features | Camping Management with Interactive Map",
    description: "Discover CampFlow features: Visual Planning, Fast Check-in, Guest Reporting, Statistics and CRM. The complete and free PMS for campsites.",
};

export default function FeaturesPage() {
    const featureSections = [
        {
            title: "Total Control",
            description: "A powerful dashboard to always keep your finger on the pulse.",
            icon: LayoutDashboard,
            demo: <DemoStatsWidget />,
            features: [
                {
                    title: "Intuitive Dashboard",
                    description: "Keep track of arrivals, departures, and occupancy in real time at a glance.",
                    icon: BarChart3
                },
                {
                    title: "Occupancy Calendar",
                    description: "Visually view the status of pitches. A clear grid shows who is there and who is arriving.",
                    icon: Calendar
                },
                {
                    title: "Advanced Statistics",
                    description: "Predictive graphs on weekly occupancy to better plan resources.",
                    icon: Zap
                }
            ]
        },
        {
            title: "Simplified Operations",
            description: "Tools designed to speed up daily work at reception.",
            icon: UserCheck,
            demo: <DemoCheckInWidget />,
            features: [
                {
                    title: "Smart Check-in",
                    description: "Quick guest registration with autocomplete for Italian Municipalities and Provinces.",
                    icon: UserCheck
                },
                {
                    title: "Guest Management (CRM)",
                    description: "A complete database of your guests with booking history and quick contacts (Email/Phone).",
                    icon: Users
                },
                {
                    title: "Police Integration",
                    description: "Keep track of submissions to the Alloggiati Web portal. Mark who has been sent and who hasn't.",
                    icon: ShieldCheck
                },
                {
                    title: "Enhanced Search",
                    description: "Find bookings and customers in an instant by searching by name, email, or phone number.",
                    icon: Search
                }
            ]
        },
        {
            title: "Visual Planning",
            description: "The heart of your campsite: an interactive calendar for pitch management.",
            icon: Calendar,
            demo: <DemoCalendarWidget />,
            features: [
                {
                    title: "Drag & Drop (Coming Soon)",
                    description: "Move reservations quickly (feature coming soon).",
                    icon: BarChart3
                },
                {
                    title: "Matrix View",
                    description: "Cross-reference pitches and days to immediately find free slots.",
                    icon: Database
                },
                {
                    title: "Advanced Filters",
                    description: "Filter by type (Tent, Camper, Bungalow) or by campsite zone.",
                    icon: Globe
                }
            ]
        },
        {
            title: "Technology & Control",
            description: "Under the hood, tools for demanding developers and administrators.",
            icon: Database,
            demo: <DemoSystemWidget />,
            features: [
                {
                    title: "System Monitor",
                    description: "A 'Black Box' to monitor server health, error logs, and database performance.",
                    icon: BarChart3
                },
                {
                    title: "Administrative Actions",
                    description: "Control panel for data reset, log cleaning, and advanced management in case of emergency.",
                    icon: Database
                },
                {
                    title: "Open Source & Self-Host",
                    description: "The code is yours. You can host it wherever you want and modify it as you please.",
                    icon: Globe
                }
            ]
        }
    ];

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-primary/5">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
                        <Zap className="w-3 h-3 mr-1" />
                        Feature Pack v1.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Much more than a simple <span className="text-primary">Excel</span>.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        CampFlow digitizes every aspect of your campsite, from booking to reporting to the Police Headquarters, all in a single modern platform.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/pricing">
                            <Button size="lg" className="h-12 px-8">See Pricing</Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="h-12 px-8">Request Demo</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4 space-y-32">
                    {featureSections.map((section, index) => (
                        <div key={index} className={`flex flex-col md:flex-row gap-16 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex-1 space-y-8">
                                <div className="space-y-4">
                                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-bold">{section.title}</h2>
                                    <p className="text-xl text-muted-foreground">
                                        {section.description}
                                    </p>
                                </div>
                                <div className="grid gap-6">
                                    {section.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                            <div className="mt-1 bg-muted w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                                <feature.icon className="w-5 h-5 text-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Placeholder / Abstract Representation */}
                            {/* Visual Representation or Live Demo */}
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl rounded-full opacity-30" />
                                {section.demo ? (
                                    <div className="relative bg-card border rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
                                        <div className="p-1 bg-muted/50 border-b flex gap-1.5 px-4 items-center h-10">
                                            <div className="w-3 h-3 rounded-full bg-red-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-400/50" />
                                            <div className="ml-4 text-xs text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded-md flex-1 text-center">
                                                campflow-demo.app
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-muted/10 p-4 flex flex-col justify-center">
                                            {section.demo}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative bg-card border rounded-2xl shadow-2xl p-8 aspect-square md:aspect-auto md:min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="p-4 bg-muted/30 rounded-full mb-4">
                                            <section.icon className="w-24 h-24 text-primary/40 stroke-1" />
                                        </div>
                                        <div className="space-y-2 max-w-sm">
                                            <h4 className="text-xl font-medium text-foreground">Designed for efficiency</h4>
                                            <p className="text-muted-foreground text-sm">
                                                Every interface is designed to reduce clicks and maximize operational speed.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-8 opacity-50">
                                            <div className="h-2 bg-primary/20 rounded"></div>
                                            <div className="h-2 bg-primary/20 rounded"></div>
                                            <div className="h-2 bg-primary/20 rounded col-span-2"></div>
                                            <div className="h-20 bg-primary/10 rounded col-span-2"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Additional "Grid" of smaller features */}
            <section className="py-20 bg-muted/30 border-y">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">And it doesn't end here...</h2>
                        <p className="text-muted-foreground">
                            Small details that make a big difference in daily management.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Mobile Friendly", desc: "Manage everything even from a tablet or smartphone while moving around the campsite." },
                            { title: "Dark Mode", desc: "Elegant dark interface that rests your eyes during evening shifts." },
                            { title: "Activity Log", desc: "Track who did what for maximum transparency." },
                            { title: "Automatic Backups", desc: "Your data is safe in the cloud, replicated and protected." },
                            { title: "Custom Filters", desc: "Create custom views of the arrivals and departures list." },
                            { title: "Whatsapp Support", desc: "Quick buttons to contact guests on Whatsapp Web." }
                        ].map((item, i) => (
                            <div key={i} className="bg-background p-6 rounded-xl border hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <h3 className="font-semibold">{item.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to modernize your campsite?</h2>
                    <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
                        Start today. No hidden costs, no constraints.
                    </p>
                    <Link href="/contact">
                        <Button size="lg" variant="secondary" className="h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-all">
                            Talk to Simone
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

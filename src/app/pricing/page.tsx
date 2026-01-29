import { Button } from '@/components/ui/button';
import { Check, Github, Server, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Pricing | CampFlow Cloud vs Self-Hosted",
    description: "CampFlow is Free and Open Source. We offer managed Cloud plans for support calls and server setup for those who prefer a turnkey solution.",
};

export default function PricingPage() {
    const tiers = [
        {
            name: 'Community',
            price: 'Free',
            description: 'For developers and those who can manage the server independently.',
            icon: Github,
            features: [
                'Complete Open Source Code',
                'Unlimited Self-hosting',
                'Manual Updates',
                'No License Cost',
                'Community Support',
            ],
            cta: 'Go to GitHub',
            href: 'https://github.com/simo-hue',
            variant: 'outline',
            target: '_blank',
            popular: false,
            blurPrice: false,
        },
        {
            name: 'Assisted Setup',
            price: '€499',
            period: 'one-time',
            description: 'Want the software but not an expert? We help you.',
            icon: LifeBuoy,
            features: [
                'Installation on premise/server',
                'Campsite Configuration',
                '1 hour of staff training',
                '30 days post-setup support',
            ],
            cta: 'Book your Assisted Setup',
            href: '/contact',
            variant: 'outline',
            target: '_self',
            popular: true,
            blurPrice: false,
        },
        {
            name: 'Cloud Managed',
            price: '€499',
            blurPrice: true,
            description: 'The turnkey solution. We take care of everything.',
            icon: Server,
            features: [
                'Ready to use',
                'Hosting and Server included',
                'Data Backup',
                'Automatic Updates',
                'Priority Email Support',
            ],
            cta: 'Let\'s Talk',
            href: 'mailto:mattioli.simone.10@gmail.com',
            variant: 'default',
            target: '_self',
            popular: false,
        },
    ];

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Open Source, with Premium Services</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        CampFlow is free and open. You only pay if you want us to manage it for you or if you need help with installation.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`flex flex-col p-8 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all relative ${tier.popular ? 'border-primary ring-1 ring-primary shadow-lg scale-105 z-10' : ''}`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                    <tier.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">{tier.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className={`text-4xl font-bold ${tier.blurPrice ? 'blur-md select-none' : ''}`}>
                                    {tier.price}
                                </span>
                                {tier.period && <span className="text-muted-foreground text-sm font-medium ml-1">{tier.period}</span>}
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <div className="bg-primary/10 p-1 rounded-full text-primary shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href={tier.href} target={tier.target}>
                                <Button className="w-full" variant={tier.variant as any} size="lg">
                                    {tier.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="grid gap-6">
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="font-semibold mb-2">Is it really free?</h3>
                            <p className="text-muted-foreground text-sm">
                                Yes, the Community version is 100% open source. You can download the code, install it on your server, and use it without limits, forever.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="font-semibold mb-2">What does "Cloud Management" include?</h3>
                            <p className="text-muted-foreground text-sm">
                                It includes hosting on high-performance servers, security configuration, automatic backups, and software updates. You only worry about managing your campsite, we take care of the rest.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="font-semibold mb-2">Can I switch from Cloud to Self-hosted?</h3>
                            <p className="text-muted-foreground text-sm">
                                Absolutely yes. The data is yours. You can request a database export at any time and migrate to your private server.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

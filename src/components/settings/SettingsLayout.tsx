'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Building2, Euro, Palette, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const settingsSections = [
    {
        id: 'campeggio',
        label: 'Campeggio',
        icon: Building2,
        description: 'Gestisci piazzole e tende',
    },
    {
        id: 'prezzi',
        label: 'Prezzi',
        icon: Euro,
        description: 'Configura tariffe e prezzi',
    },
    {
        id: 'aspetto',
        label: 'Aspetto',
        icon: Palette,
        description: 'Personalizza tema e layout',
    },
];

interface SettingsLayoutProps {
    children: React.ReactNode;
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export function SettingsLayout({ children, activeSection, onSectionChange }: SettingsLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-border" />
                            <h1 className="text-2xl font-bold">Impostazioni</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="w-64 shrink-0">
                        <nav className="space-y-1">
                            {settingsSections.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;

                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => onSectionChange(section.id)}
                                        className={cn(
                                            'w-full text-left px-4 py-3 rounded-lg transition-colors',
                                            'hover:bg-accent hover:text-accent-foreground',
                                            isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium">{section.label}</div>
                                                <div className={cn(
                                                    'text-xs mt-0.5',
                                                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                                )}>
                                                    {section.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-card border rounded-lg p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

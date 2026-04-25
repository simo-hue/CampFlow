'use client';

import {
    clearBookingsAction,
    clearCustomersAction,
    clearPitchesAction,
    clearSeasonsAction,
    seedPitchesAction,
    seedSeasonsAction,
    resetSystemAction,
    generateBackupAction
} from '../login/actions';
import DestructiveActionDialog from './DestructiveActionDialog';
import { useState } from 'react';
import { 
    Download, 
    Loader2, 
    CheckSquare, 
    Square, 
    Database, 
    Trash2, 
    RefreshCcw, 
    ShieldAlert, 
    FileJson,
    LayoutGrid,
    Users,
    Calendar,
    Settings,
    ChevronRight
} from 'lucide-react';

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
                {subtitle && <p className="text-[10px] text-gray-500 uppercase tracking-widest">{subtitle}</p>}
            </div>
        </div>
    );
}

function ActionButton({ label, icon: Icon, theme = 'gray', onClick, disabled, loading }: { 
    label: string, 
    icon?: any,
    theme?: 'red' | 'yellow' | 'blue' | 'orange' | 'green' | 'gray',
    onClick?: () => void,
    disabled?: boolean,
    loading?: boolean
}) {
    const colors = {
        red: 'text-red-400 border-red-500/30 hover:bg-red-500/10',
        yellow: 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10',
        blue: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10',
        orange: 'text-orange-400 border-orange-500/30 hover:bg-orange-500/10',
        green: 'text-green-400 border-green-500/30 hover:bg-green-500/10',
        gray: 'text-gray-400 border-gray-600/30 hover:bg-gray-800',
    };

    return (
        <button 
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full py-2.5 px-4 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                ${colors[theme]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : Icon ? (
                <Icon className="h-3 w-3" />
            ) : null}
            {label}
        </button>
    );
}

export default function DatabaseManagerWidget() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [selectedTables, setSelectedTables] = useState<string[]>([
        'customers', 'bookings', 'booking_guests', 'pitches', 'sectors', 
        'pricing_seasons', 'customer_groups', 'group_season_configuration', 
        'group_bundles', 'app_logs'
    ]);

    const allAvailableTables = [
        'customers', 'bookings', 'booking_guests', 'pitches', 'sectors', 
        'pricing_seasons', 'customer_groups', 'group_season_configuration', 
        'group_bundles', 'app_logs'
    ];

    const handleBackup = async () => {
        if (selectedTables.length === 0) return;
        setIsBackingUp(true);
        try {
            const result = await generateBackupAction(selectedTables);
            if (result.success && result.backup) {
                const blob = new Blob([JSON.stringify(result.backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const tablesLabel = selectedTables.length === allAvailableTables.length ? 'full' : 'partial';
                a.download = `campflow_backup_${tablesLabel}_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error: any) {
            alert('Backup failed');
        } finally {
            setIsBackingUp(false);
        }
    };

    const toggleTable = (table: string) => {
        setSelectedTables(prev =>
            prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. Export & Backup Section */}
            <div className="lg:col-span-4 bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm shadow-xl">
                <SectionHeader icon={FileJson} title="Data Export" subtitle="Snapshot Engine" />
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select Tables</span>
                        <button
                            onClick={() => setSelectedTables(selectedTables.length === allAvailableTables.length ? [] : allAvailableTables)}
                            className="text-[9px] text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            {selectedTables.length === allAvailableTables.length ? '[ NONE ]' : '[ ALL ]'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 p-2 bg-black/20 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {allAvailableTables.map(table => (
                            <label
                                key={table}
                                className={`flex items-center gap-3 cursor-pointer p-2 rounded-md transition-all border
                                    ${selectedTables.includes(table) 
                                        ? 'bg-blue-500/5 border-blue-500/20 text-gray-200' 
                                        : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTables.includes(table)}
                                    onChange={() => toggleTable(table)}
                                    className="hidden"
                                />
                                {selectedTables.includes(table) ? (
                                    <CheckSquare className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <Square className="h-4 w-4 text-gray-700" />
                                )}
                                <span className="text-[11px] font-medium font-mono">{table}</span>
                            </label>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleBackup}
                            disabled={isBackingUp || selectedTables.length === 0}
                            className={`w-full py-3 px-4 rounded-xl border font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg
                                ${isBackingUp || selectedTables.length === 0
                                    ? 'bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed'
                                    : 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white hover:border-blue-500'}`}
                        >
                            {isBackingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            <span className="text-xs">{isBackingUp ? 'Processing...' : 'Run Backup Engine'}</span>
                        </button>
                        <p className="text-[9px] text-center text-gray-600 mt-3 italic">
                            Exports selected tables to a secure JSON bundle
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Management Sections */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Seed & Maintenance */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                    <SectionHeader icon={RefreshCcw} title="System Maintenance" subtitle="Configuration & Seed" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <LayoutGrid className="h-3 w-3" /> Default Resources
                            </h3>
                            <DestructiveActionDialog
                                title="Seed Default Pitches"
                                description="Inserts the 15 default pitches (001-205). Will fail if pitches already exist (IDs clash)."
                                confirmKeyword="SEED"
                                actionFn={seedPitchesAction}
                                theme="green"
                                trigger={<ActionButton label="Seed Pitches" icon={ChevronRight} theme="green" />}
                            />
                            <DestructiveActionDialog
                                title="Seed Default Seasons"
                                description="Inserts default seasons (Low, Medium, High). Will fail if IDs clash."
                                confirmKeyword="SEED"
                                actionFn={seedSeasonsAction}
                                theme="green"
                                trigger={<ActionButton label="Seed Seasons" icon={ChevronRight} theme="green" />}
                            />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Trash2 className="h-3 w-3" /> Cleanup Tools
                            </h3>
                            <DestructiveActionDialog
                                title="Clear All Pitches"
                                description="Deletes all configured pitches. This will empty the occupancy grid."
                                confirmKeyword="PITCHES"
                                actionFn={clearPitchesAction}
                                theme="orange"
                                trigger={<ActionButton label="Wipe Pitches" theme="orange" />}
                            />
                            <DestructiveActionDialog
                                title="Clear All Seasons"
                                description="Deletes all pricing seasons. Pricing calculations will be disabled."
                                confirmKeyword="SEASONS"
                                actionFn={clearSeasonsAction}
                                theme="orange"
                                trigger={<ActionButton label="Wipe Seasons" theme="orange" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Data Purge & Danger Zone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Transactional Purge */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                        <SectionHeader icon={Database} title="Data Purge" subtitle="Clear Records" />
                        <div className="space-y-3">
                            <DestructiveActionDialog
                                title="Purge Bookings"
                                description="Irreversibly deletes all bookings and assigned guests. Customers are preserved."
                                confirmKeyword="CLEAR"
                                actionFn={clearBookingsAction}
                                theme="yellow"
                                trigger={<ActionButton label="Purge Bookings" icon={Calendar} theme="yellow" />}
                            />
                            <DestructiveActionDialog
                                title="Purge Customers"
                                description="Irreversibly deletes all customers and associated history."
                                confirmKeyword="CUSTOMERS"
                                actionFn={clearCustomersAction}
                                theme="blue"
                                trigger={<ActionButton label="Purge Customers" icon={Users} theme="blue" />}
                            />
                        </div>
                    </div>

                    {/* Fatal Actions */}
                    <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
                        <SectionHeader icon={ShieldAlert} title="Danger Zone" subtitle="System Reset" />
                        <div className="space-y-4">
                            <p className="text-[10px] text-red-500/70 leading-relaxed">
                                Factory reset will wipe all data and restore initial configuration. Use with extreme caution.
                            </p>
                            <DestructiveActionDialog
                                title="System Factory Reset"
                                description="This will delete EVERYTHING and restore default pitches/seasons."
                                confirmKeyword="RESET"
                                actionFn={resetSystemAction}
                                theme="red"
                                trigger={
                                    <button className="w-full py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white font-bold uppercase tracking-widest text-[11px] transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                        [ FACTORY RESET ]
                                    </button>
                                }
                            />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Info, UserCheck, Shield, MapPin, User, Trash2 } from 'lucide-react';
import { MunicipalityAutocomplete, ProvinceAutocomplete } from './GeoAutocomplete';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface GuestData {
    id?: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    gender: string;
    birth_country: string;
    birth_province: string;
    birth_city: string;
    citizenship: string;
    is_head_of_family: boolean;
    // Full fields (Head of Family only)
    address?: string;
    residence_country?: string;
    residence_province?: string;
    residence_city?: string;
    residence_zip?: string;
    document_type?: string;
    document_number?: string;
    document_issue_date?: string;
    document_issuer?: string;
    document_issue_city?: string;
    document_issue_country?: string;
    license_plate?: string;
}

interface GuestFormProps {
    index: number;
    guest: GuestData;
    onChange: (index: number, data: GuestData) => void;
    onRemove?: (index: number) => void;
    canRemove: boolean;
    isHeadOfFamily: boolean;
    onSetHeadOfFamily: (index: number) => void;
    errors?: Record<string, boolean>;
}

export function GuestForm({
    index,
    guest,
    onChange,
    onRemove,
    canRemove,
    isHeadOfFamily,
    onSetHeadOfFamily,
    errors = {}
}: GuestFormProps) {

    const handleChange = (field: keyof GuestData, value: any) => {
        onChange(index, { ...guest, [field]: value });
    };

    const isItaly = (s: string) => !s || s.toLowerCase() === 'italia';

    return (
        <div className={cn(
            "rounded-xl border p-4 transition-all duration-200",
            isHeadOfFamily
                ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm"
                : "bg-card border-border hover:border-primary/20"
        )}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                        isHeadOfFamily ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                    )}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            {guest.first_name || `Ospite ${index + 1}`} {guest.last_name}
                            {isHeadOfFamily && (
                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 h-5 px-1.5 text-[10px]">
                                    Capo Famiglia
                                </Badge>
                            )}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isHeadOfFamily && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSetHeadOfFamily(index)}
                            className="text-muted-foreground hover:text-blue-600 text-xs h-8"
                        >
                            Imposta come Capo Famiglia
                        </Button>
                    )}

                    {canRemove && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove?.(index)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Core Fields (Always Visible) - Anagrafica (Blue) */}
            <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 font-semibold border-b border-blue-200/50 pb-2 mb-4">
                    <User className="w-4 h-4" />
                    <h4 className="text-sm uppercase tracking-wide">Anagrafica Ospite</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className={cn(errors.first_name && "text-destructive")}>Nome *</Label>
                        <Input
                            value={guest.first_name}
                            onChange={e => handleChange('first_name', e.target.value)}
                            className={cn(errors.first_name && "border-destructive", "bg-background/80")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className={cn(errors.last_name && "text-destructive")}>Cognome *</Label>
                        <Input
                            value={guest.last_name}
                            onChange={e => handleChange('last_name', e.target.value)}
                            className={cn(errors.last_name && "border-destructive", "bg-background/80")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className={cn(errors.birth_date && "text-destructive")}>Data di Nascita *</Label>
                        <Input
                            type="date"
                            value={guest.birth_date}
                            onChange={e => handleChange('birth_date', e.target.value)}
                            className={cn(errors.birth_date && "border-destructive", "bg-background/80")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className={cn(errors.gender && "text-destructive")}>Sesso *</Label>
                        <select
                            className={cn(
                                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                errors.gender && "border-destructive"
                            )}
                            value={guest.gender}
                            onChange={e => handleChange('gender', e.target.value)}
                        >
                            <option value="">Seleziona...</option>
                            <option value="M">Maschio</option>
                            <option value="F">Femmina</option>
                        </select>
                    </div>

                    {/* Birth Place - Condensed */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-background/40 p-3 rounded-lg border border-blue-200/30">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Stato Nascita *</Label>
                            <Input
                                value={guest.birth_country}
                                onChange={e => handleChange('birth_country', e.target.value)}
                                placeholder="Italia"
                                className={cn("h-9 bg-background/80", errors.birth_country && "border-destructive")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Provincia</Label>
                            {isItaly(guest.birth_country) ? (
                                <ProvinceAutocomplete
                                    value={guest.birth_province}
                                    onSelect={(p) => handleChange('birth_province', p.sigla)}
                                    placeholder="RM"
                                    className={cn("h-9 bg-background/80", errors.birth_province && "border-destructive")}
                                />
                            ) : (
                                <Input
                                    value={guest.birth_province}
                                    onChange={e => handleChange('birth_province', e.target.value.toUpperCase())}
                                    placeholder="--"
                                    className={cn("h-9 uppercase bg-background/80", errors.birth_province && "border-destructive")}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Comune *</Label>
                            {isItaly(guest.birth_country) ? (
                                <MunicipalityAutocomplete
                                    value={guest.birth_city}
                                    onSelect={(c) => {
                                        handleChange('birth_city', c.nome);
                                        handleChange('birth_province', c.sigla);
                                        if (!guest.birth_country) handleChange('birth_country', 'Italia');
                                    }}
                                    placeholder="Cerca comune..."
                                    className={cn("h-9 bg-background/80", errors.birth_city && "border-destructive")}
                                />
                            ) : (
                                <Input
                                    value={guest.birth_city}
                                    onChange={e => handleChange('birth_city', e.target.value)}
                                    placeholder="Città"
                                    className={cn("h-9 bg-background/80", errors.birth_city && "border-destructive")}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className={cn(errors.citizenship && "text-destructive")}>Cittadinanza *</Label>
                        <Input
                            value={guest.citizenship}
                            onChange={e => handleChange('citizenship', e.target.value)}
                            className={cn(errors.citizenship && "border-destructive", "bg-background/80")}
                        />
                    </div>
                </div>
            </div>

            {/* Extended Fields (Only for Head of Family) */}
            {isHeadOfFamily && (
                <div className="mt-8 animate-in slide-in-from-top-4 duration-300 space-y-6">

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Residenza (Amber) */}
                        <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-semibold border-b border-amber-200/50 pb-2">
                                <MapPin className="w-4 h-4" />
                                <h4 className="text-sm uppercase tracking-wide">Residenza</h4>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className={cn("text-xs text-muted-foreground", errors.address && "text-destructive")}>Indirizzo</Label>
                                    <Input
                                        value={guest.address || ''}
                                        onChange={e => handleChange('address', e.target.value)}
                                        placeholder="Via Roma, 1"
                                        className={cn(errors.address && "border-destructive", "bg-background/80")}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.residence_city && "text-destructive")}>Comune</Label>
                                        <Input
                                            value={guest.residence_city || ''}
                                            onChange={e => handleChange('residence_city', e.target.value)}
                                            className={cn(errors.residence_city && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.residence_zip && "text-destructive")}>CAP</Label>
                                        <Input
                                            value={guest.residence_zip || ''}
                                            onChange={e => handleChange('residence_zip', e.target.value)}
                                            className={cn(errors.residence_zip && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.residence_province && "text-destructive")}>Provincia</Label>
                                        <Input
                                            value={guest.residence_province || ''}
                                            onChange={e => handleChange('residence_province', e.target.value)}
                                            className={cn(errors.residence_province && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.residence_country && "text-destructive")}>Stato</Label>
                                        <Input
                                            value={guest.residence_country || ''}
                                            onChange={e => handleChange('residence_country', e.target.value)}
                                            className={cn(errors.residence_country && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documento (Emerald) */}
                        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-semibold border-b border-emerald-200/50 pb-2">
                                <Shield className="w-4 h-4" />
                                <h4 className="text-sm uppercase tracking-wide">Documento</h4>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.document_type && "text-destructive")}>Tipo</Label>
                                        <select
                                            className={cn(
                                                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                                errors.document_type && "border-destructive"
                                            )}
                                            value={guest.document_type || 'carta_identita'}
                                            onChange={e => handleChange('document_type', e.target.value)}
                                        >
                                            <option value="carta_identita">Carta d'Identità</option>
                                            <option value="passaporto">Passaporto</option>
                                            <option value="patente">Patente</option>
                                            <option value="altro">Altro</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.document_number && "text-destructive")}>Numero</Label>
                                        <Input
                                            value={guest.document_number || ''}
                                            onChange={e => handleChange('document_number', e.target.value)}
                                            className={cn(errors.document_number && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.document_issuer && "text-destructive")}>Ente</Label>
                                        <Input
                                            value={guest.document_issuer || ''}
                                            onChange={e => handleChange('document_issuer', e.target.value)}
                                            className={cn(errors.document_issuer && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.document_issue_date && "text-destructive")}>Data Rilascio</Label>
                                        <Input
                                            type="date"
                                            value={guest.document_issue_date || ''}
                                            onChange={e => handleChange('document_issue_date', e.target.value)}
                                            className={cn(errors.document_issue_date && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.document_issue_city && "text-destructive")}>Comune Ril.</Label>
                                        <Input
                                            value={guest.document_issue_city || ''}
                                            onChange={e => handleChange('document_issue_city', e.target.value)}
                                            className={cn(errors.document_issue_city && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className={cn("text-xs text-muted-foreground", errors.document_issue_country && "text-destructive")}>Stato Ril.</Label>
                                        <Input
                                            value={guest.document_issue_country || ''}
                                            onChange={e => handleChange('document_issue_country', e.target.value)}
                                            className={cn(errors.document_issue_country && "border-destructive", "bg-background/80")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Veicolo (Indigo) */}
                    <div className="rounded-xl border border-indigo-200/50 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900/50 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold border-b border-indigo-200/50 pb-2">
                            <User className="w-4 h-4" />
                            <h4 className="text-sm uppercase tracking-wide">Veicolo</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="license_plate" className="text-muted-foreground">Targa Veicolo</Label>
                                <Input
                                    id="license_plate"
                                    value={guest.license_plate || ''}
                                    onChange={e => handleChange('license_plate', e.target.value.toUpperCase())}
                                    placeholder="AA000AA"
                                    className="uppercase font-mono bg-background/80"
                                />
                                <p className="text-[10px] text-muted-foreground">Necessaria per l'accesso automatico.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

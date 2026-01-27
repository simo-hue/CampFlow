'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useCustomerGroups } from '@/hooks/useCustomerGroups';
import type { Customer } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface CustomerDialogProps {
    customer?: Customer | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CustomerDialog({ customer, open, onClose, onSuccess }: CustomerDialogProps) {
    const isEditing = !!customer;
    const { groups } = useCustomerGroups();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Customer>>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        personal_id_code: '', // Codice Fiscale
        group_id: undefined,
        license_plate: '',
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                first_name: customer.first_name,
                last_name: customer.last_name,
                email: customer.email || '',
                phone: customer.phone,
                address: customer.address || '',
                notes: customer.notes || '',
                // @ts-ignore
                personal_id_code: customer.personal_id_code || '',
                group_id: customer.group_id,
                license_plate: customer.license_plate || '',
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                address: '',
                notes: '',
                personal_id_code: '',
                group_id: undefined,
                license_plate: '',
            });
        }
    }, [customer, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/customers/${customer.id}`
                : '/api/customers';

            const method = isEditing ? 'PUT' : 'POST';

            // Clean up empty strings to null for optional fields
            const payload = { ...formData };
            if (!payload.email) delete payload.email;
            if (payload.group_id === 'none') payload.group_id = undefined; // Handle clear

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Errore salvataggio cliente');
            }

            toast.success(isEditing ? 'Cliente aggiornato' : 'Cliente creato');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifica Cliente' : 'Nuovo Cliente'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Nome *</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Cognome *</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefono *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cf">Codice Fiscale</Label>
                            <Input
                                id="cf"
                                // @ts-ignore
                                value={formData.personal_id_code}
                                // @ts-ignore
                                onChange={(e) => setFormData({ ...formData, personal_id_code: e.target.value.toUpperCase() })}
                                className="uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targa">Targa Auto</Label>
                            <Input
                                id="targa"
                                value={formData.license_plate}
                                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                                className="uppercase"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group">Gruppo Cliente</Label>
                        <Select
                            value={formData.group_id || 'none'}
                            onValueChange={(val) => setFormData({ ...formData, group_id: val === 'none' ? undefined : val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona un gruppo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nessun Gruppo</SelectItem>
                                {groups.map(group => (
                                    <SelectItem key={group.id} value={group.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                                            {group.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Assegnando un gruppo, il cliente riceverà automaticamente gli sconti configurati.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Indirizzo</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Note</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Annulla
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? 'Aggiorna' : 'Crea'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

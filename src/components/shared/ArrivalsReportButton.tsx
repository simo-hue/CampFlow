'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { getTodayItaly } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to display a date string as dd/MM/yyyy or 'N/D'
const fmtDate = (d: string | null | undefined): string => {
    if (!d) return 'N/D';
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return 'N/D'; }
};

// Helper to display value or 'N/D'
const val = (v: string | null | undefined): string => v?.trim() || 'N/D';

// Map document_type DB value to Italian label
const docTypeLabel = (t: string | null | undefined): string => {
    const map: Record<string, string> = {
        carta_identita: "Carta d'Identità",
        passaporto: 'Passaporto',
        patente: 'Patente',
        altro: 'Altro',
    };
    return t ? (map[t] || t) : 'N/D';
};

// Map gender DB value to Italian label
const genderLabel = (g: string | null | undefined): string => {
    if (g === 'M') return 'Maschio';
    if (g === 'F') return 'Femmina';
    return 'N/D';
};

interface ArrivalsReportButtonProps {
    defaultDate?: string;
}

export function ArrivalsReportButton({ defaultDate }: ArrivalsReportButtonProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(defaultDate || getTodayItaly());
    const [loading, setLoading] = useState(false);

    // Update internal date when defaultDate prop changes (e.g. view toggle)
    // and the dialog is actually opened
    useEffect(() => {
        if (defaultDate) {
            setDate(defaultDate);
        }
    }, [defaultDate, open]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/arrivals/print?date=${date}`);
            if (!res.ok) throw new Error('Failed to fetch arrivals');
            const data = await res.json();
            generatePDF(date, data.arrivals);
            toast.success('Riepilogo generato con successo!');
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Errore durante la generazione del riepilogo');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = (selectedDate: string, arrivals: any[]) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const parsedDate = new Date(selectedDate + 'T12:00:00');
        const formattedDate = format(parsedDate, 'dd MMMM yyyy', { locale: it });
        const PAGE_W = 210;
        const MARGIN = 14;
        const CONTENT_W = PAGE_W - MARGIN * 2;

        // ─── PAGE HEADER ───────────────────────────────────────────────
        const drawPageHeader = () => {
            doc.setFillColor(30, 41, 59); // slate-800
            doc.rect(0, 0, PAGE_W, 22, 'F');
            doc.setFontSize(15);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('REGISTRO ARRIVI', MARGIN, 13);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(203, 213, 225); // slate-300
            doc.text(
                `Data: ${formattedDate}   |   Prenotazioni: ${arrivals.length}   |   Generato il ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
                MARGIN, 19
            );
        };

        drawPageHeader();
        let y = 30;

        if (arrivals.length === 0) {
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text('Nessun arrivo previsto per questa data.', MARGIN, y + 10);
            const fnameObj = format(parsedDate, 'dd MMMM yyyy', { locale: it }).toLowerCase();
            doc.save(`arrivi ${fnameObj}.pdf`);
            return;
        }

        // ─── PER OGNI PRENOTAZIONE ────────────────────────────────────
        arrivals.forEach((booking, idx) => {
            const isCheckedIn = booking.status === 'checked_in';
            const customer = booking.customer || {};
            const pitch = booking.pitch || {};
            const guests: any[] = booking.guests || [];

            // Find head of family from booking_guests; fallback to customer
            const headGuest = guests.find((g: any) => g.is_head_of_family) || guests[0] || null;
            const otherGuests = headGuest ? guests.filter((g: any) => g.id !== headGuest.id) : [];

            // For head fields: prefer booking_guest data, fallback to customer table
            const hg = (field: string) => headGuest?.[field] || customer[field] || null;

            // ─── BOOKING CARD HEADER ─────────────────────────────────
            const CARD_HEADER_H = 14;

            // Check page space for header + at least 30mm of content
            if (y + CARD_HEADER_H + 30 > 280) {
                doc.addPage();
                drawPageHeader();
                y = 30;
            }

            // Card header background
            doc.setFillColor(241, 245, 249); // slate-100
            doc.setDrawColor(203, 213, 225); // slate-300
            doc.rect(MARGIN, y, CONTENT_W, CARD_HEADER_H, 'FD');

            // Pitch badge
            doc.setFillColor(isCheckedIn ? 22 : 220, isCheckedIn ? 163 : 38, isCheckedIn ? 74 : 38);
            doc.roundedRect(MARGIN + 2, y + 2, 28, 10, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`Piaz. ${val(pitch.number)}`, MARGIN + 5, y + 8.5);

            // Guest name
            const headName = `${hg('first_name') || ''} ${hg('last_name') || ''}`.trim() || 'Cliente Sconosciuto';
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text(headName, MARGIN + 34, y + 9);

            // Guest count
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`${booking.guests_count} ospiti`, PAGE_W - MARGIN - 2, y + 9, { align: 'right' });

            y += CARD_HEADER_H;

            // ─── MISSING CHECK-IN ────────────────────────────────────
            if (!isCheckedIn) {
                // Red alert box
                doc.setFillColor(254, 242, 242); // red-50
                doc.setDrawColor(252, 165, 165); // red-300
                doc.rect(MARGIN, y, CONTENT_W, 22, 'FD');

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(185, 28, 28); // red-700
                doc.text('⚠  CHECK-IN NON EFFETTUATO — DATI DA COMPILARE', MARGIN + 4, y + 8);

                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(153, 27, 27); // red-800
                const refLine = `Riferimento: ${val(customer.first_name)} ${val(customer.last_name)}   |   Tel: ${val(customer.phone)}   |   Email: ${val(customer.email)}`;
                doc.text(refLine, MARGIN + 4, y + 16);

                y += 28;
            } else {
                // ─── SEZIONE 1 — CAPOFAMIGLIA ANAGRAFICA ─────────────
                y += 2;
                sectionTitle(doc, 'CAPOFAMIGLIA — ANAGRAFICA', MARGIN, y, CONTENT_W, [37, 99, 235]); // blue-600
                y += 7;

                const anaData: [string, string][] = [
                    ['Nome e Cognome', `${val(hg('first_name'))} ${val(hg('last_name'))}`],
                    ['Data di Nascita', fmtDate(hg('birth_date'))],
                    ['Sesso', genderLabel(hg('gender'))],
                    ['Luogo di Nascita', `${val(hg('birth_city'))} (${val(hg('birth_province'))}) — ${val(hg('birth_country'))}`],
                    ['Cittadinanza', val(hg('citizenship'))],
                ];

                y = renderKeyValueTable(doc, anaData, MARGIN, y, CONTENT_W);

                // ─── SEZIONE 2 — RESIDENZA ───────────────────────────
                if (y + 40 > 280) { doc.addPage(); drawPageHeader(); y = 30; }

                sectionTitle(doc, 'RESIDENZA', MARGIN, y, CONTENT_W, [180, 130, 10]); // amber
                y += 7;

                const resData: [string, string][] = [
                    ['Indirizzo', val(hg('address'))],
                    ['Comune', val(hg('residence_city'))],
                    ['Provincia', val(hg('residence_province'))],
                    ['CAP', val(hg('residence_zip'))],
                    ['Stato', val(hg('residence_country'))],
                ];

                y = renderKeyValueTable(doc, resData, MARGIN, y, CONTENT_W);

                // ─── SEZIONE 3 — DOCUMENTO ──────────────────────────
                if (y + 40 > 280) { doc.addPage(); drawPageHeader(); y = 30; }

                sectionTitle(doc, 'DOCUMENTO DI IDENTITÀ', MARGIN, y, CONTENT_W, [5, 150, 105]); // emerald
                y += 7;

                const docData: [string, string][] = [
                    ['Tipo Documento', docTypeLabel(hg('document_type'))],
                    ['Numero', val(hg('document_number'))],
                    ['Rilasciato da', val(hg('document_issuer'))],
                    ['Data di Rilascio', fmtDate(hg('document_issue_date'))],
                    ['Comune di Rilascio', val(hg('document_issue_city'))],
                    ['Stato di Rilascio', val(hg('document_issue_country'))],
                ];

                y = renderKeyValueTable(doc, docData, MARGIN, y, CONTENT_W);

                // ─── SEZIONE 4 — VEICOLO ────────────────────────────
                if (y + 20 > 280) { doc.addPage(); drawPageHeader(); y = 30; }

                sectionTitle(doc, 'VEICOLO', MARGIN, y, CONTENT_W, [79, 70, 229]); // indigo
                y += 7;

                const vehData: [string, string][] = [
                    ['Targa', val(hg('license_plate'))],
                ];

                y = renderKeyValueTable(doc, vehData, MARGIN, y, CONTENT_W);

                // ─── SEZIONE 5 — ALTRI OSPITI ───────────────────────
                if (otherGuests.length > 0) {
                    if (y + 30 > 280) { doc.addPage(); drawPageHeader(); y = 30; }

                    sectionTitle(doc, `ALTRI OSPITI (${otherGuests.length})`, MARGIN, y, CONTENT_W, [100, 116, 139]); // slate
                    y += 7;

                    otherGuests.forEach((g: any, gIdx: number) => {
                        if (y + 30 > 280) { doc.addPage(); drawPageHeader(); y = 30; }

                        // Guest sub-header
                        doc.setFillColor(248, 250, 252); // slate-50
                        doc.setDrawColor(226, 232, 240);
                        doc.rect(MARGIN, y, CONTENT_W, 8, 'FD');
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(71, 85, 105);
                        const guestLabel = `${gIdx + 2}. ${val(g.first_name)} ${val(g.last_name)}`;
                        doc.text(guestLabel, MARGIN + 3, y + 5.5);
                        y += 10;

                        const guestData: [string, string][] = [
                            ['Nome e Cognome', `${val(g.first_name)} ${val(g.last_name)}`],
                            ['Data di Nascita', fmtDate(g.birth_date)],
                            ['Sesso', genderLabel(g.gender)],
                            ['Luogo di Nascita', `${val(g.birth_city)} (${val(g.birth_province)}) — ${val(g.birth_country)}`],
                            ['Cittadinanza', val(g.citizenship)],
                        ];

                        y = renderKeyValueTable(doc, guestData, MARGIN, y, CONTENT_W);
                    });
                }
            }

            // ─── SEPARATOR ──────────────────────────────────────────
            if (idx < arrivals.length - 1) {
                if (y + 14 > 280) {
                    doc.addPage();
                    drawPageHeader();
                    y = 30;
                } else {
                    doc.setDrawColor(148, 163, 184);
                    doc.setLineWidth(0.4);
                    doc.line(MARGIN, y + 4, PAGE_W - MARGIN, y + 4);
                    y += 14;
                }
            }
        });

        // ─── FOOTER ─────────────────────────────────────────────────
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);
            doc.text(`Pagina ${i} di ${totalPages}  —  Documento generato da CampFlow  —  ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, PAGE_W / 2, 292, { align: 'center' });
        }

        const fnameObj = format(parsedDate, 'dd MMMM yyyy', { locale: it }).toLowerCase();
        doc.save(`arrivi ${fnameObj}.pdf`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-background">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Stampa Arrivi</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Genera Riepilogo Arrivi</DialogTitle>
                    <DialogDescription>
                        Seleziona la data per cui vuoi generare il foglio di riepilogo PDF con
                        tutti i dati inseriti durante il check-in.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data degli arrivi</label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10"
                            />
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <FileText className="mr-2 h-4 w-4" />}
                        Genera PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sectionTitle(
    doc: jsPDF,
    title: string,
    x: number,
    y: number,
    w: number,
    color: [number, number, number]
) {
    doc.setFillColor(...color);
    doc.rect(x, y, 3, 5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, x + 5, y + 4);
}

/**
 * Renders a two-column key/value table and returns the new Y position.
 */
function renderKeyValueTable(
    doc: jsPDF,
    rows: [string, string][],
    x: number,
    y: number,
    w: number
): number {
    const COL1 = 42;
    const ROW_H = 5.5;
    const PAD_X = 2;
    const PAD_Y = 4;

    rows.forEach(([label, value], i) => {
        const bg = i % 2 === 0 ? [252, 252, 253] : [255, 255, 255];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(x, y, w, ROW_H, 'F');

        // Label
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(label, x + PAD_X, y + PAD_Y);

        // Value — wrapping for long strings
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42); // slate-900
        const maxW = w - COL1 - PAD_X;
        const lines = doc.splitTextToSize(value, maxW);
        doc.text(lines[0], x + COL1, y + PAD_Y); // Always show at least first line

        y += ROW_H;
    });

    // Bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x, y, x + w, y);

    return y + 4;
}

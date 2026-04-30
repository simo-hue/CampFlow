'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format, addDays } from 'date-fns';
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
    view?: 'today' | 'tomorrow' | 'week';
}

export function ArrivalsReportButton({ defaultDate, view }: ArrivalsReportButtonProps) {
    const [loading, setLoading] = useState(false);

    // Using defaultDate prop directly for calculation
    // removed the dialog "open" state

    const handleGenerate = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const currentDate = defaultDate || getTodayItaly();
            let url = `/api/arrivals/print?date=${currentDate}`;

            // If in week view, we fetch the range (next 7 days from starting date)
            if (view === 'week') {
                const startDate = currentDate;
                const endDate = format(addDays(new Date(currentDate), 6), 'yyyy-MM-dd');
                url = `/api/arrivals/print?startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch arrivals');
            const data = await res.json();

            if (view === 'week') {
                generateWeeklyPDF(currentDate, data.arrivals);
            } else {
                generatePDF(currentDate, data.arrivals);
            }

            toast.success('Riepilogo generato con successo!');
        } catch (error) {
            logger.error(error instanceof Error ? error.message : String(error), { error });
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
            doc.text('REGISTRO ARRIVI GIORNALIERO', MARGIN, 13);
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
            y = renderBookingCard(doc, booking, y, MARGIN, CONTENT_W, PAGE_W, () => {
                doc.addPage();
                drawPageHeader();
                return 30;
            });

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

    const generateWeeklyPDF = (selectedDate: string, arrivals: any[]) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const PAGE_W = 210;
        const MARGIN = 14;
        const CONTENT_W = PAGE_W - MARGIN * 2;

        const drawPageHeader = (title: string, subtitle: string) => {
            doc.setFillColor(30, 41, 59); // slate-800
            doc.rect(0, 0, PAGE_W, 22, 'F');
            doc.setFontSize(15);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(title, MARGIN, 13);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(203, 213, 225); // slate-300
            doc.text(subtitle, MARGIN, 19);
        };

        // Group arrivals by date
        const grouped: Record<string, any[]> = {};
        arrivals.forEach(a => {
            const d = a.booking_period.match(/\[([^,]+),/)?.[1] || 'Sconosciuto';
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(a);
        });

        const sortedDates = Object.keys(grouped).sort();
        const startD = new Date(selectedDate);
        const endD = addDays(startD, 6);
        const subtitleStr = `Settimana: ${format(startD, 'dd/MM')} - ${format(endD, 'dd/MM/yyyy')}   |   Totale: ${arrivals.length}   |   Generato il ${format(new Date(), 'dd/MM HH:mm')}`;

        drawPageHeader('REGISTRO ARRIVI SETTIMANALE', subtitleStr);
        let y = 30;

        if (arrivals.length === 0) {
            doc.setFontSize(11);
            doc.text('Nessun arrivo previsto per questa settimana.', MARGIN, y + 10);
            doc.save(`arrivi settimana ${format(startD, 'dd MM yyyy')}.pdf`);
            return;
        }

        sortedDates.forEach((dateStr, dIdx) => {
            const dayArrivals = grouped[dateStr];
            const parsedDay = new Date(dateStr + 'T12:00:00');

            // Start a new page for each day (except first day unless it's already full)
            if (dIdx > 0 || y > 240) {
                doc.addPage();
                drawPageHeader('REGISTRO ARRIVI SETTIMANALE', subtitleStr);
                y = 30;
            }

            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(MARGIN, y, PAGE_W - MARGIN, y);
            y += 8;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(format(parsedDay, 'EEEE d MMMM yyyy', { locale: it }).toUpperCase(), MARGIN, y);
            y += 6;

            dayArrivals.forEach((booking, idx) => {
                // Reuse logic from single PDF or implement directly
                // For simplicity and grouping, we'll implement a compact version or call a shared helper
                // Given the requirement "tenendo il template di quello singolo giornaliero"
                // I will extract the booking render logic into a function
                y = renderBookingCard(doc, booking, y, MARGIN, CONTENT_W, PAGE_W, () => {
                    doc.addPage();
                    drawPageHeader('REGISTRO ARRIVI SETTIMANALE', subtitleStr);
                    return 30;
                });
                y += 10;
            });

            y += 5;
        });

        // Footer
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text(`Pagina ${i} di ${totalPages}  —  CampFlow Weekly Report`, PAGE_W / 2, 292, { align: 'center' });
        }

        doc.save(`arrivi settimana ${format(startD, 'dd MM yyyy')}.pdf`);
    };

    /**
     * Shared render function for a single booking card
     */
    const renderBookingCard = (doc: jsPDF, booking: any, y: number, MARGIN: number, CONTENT_W: number, PAGE_W: number, onNewPage: () => number): number => {
        const isCheckedIn = booking.status === 'checked_in';
        const customer = booking.customer || {};
        const pitch = booking.pitch || {};
        const guests: any[] = booking.guests || [];
        const headGuest = guests.find((g: any) => g.is_head_of_family) || guests[0] || null;
        const otherGuests = headGuest ? guests.filter((g: any) => g.id !== headGuest.id) : [];
        const hg = (field: string) => headGuest?.[field] || customer[field] || null;

        const CARD_HEADER_H = 14;
        if (y + CARD_HEADER_H + 40 > 285) { y = onNewPage(); }

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(MARGIN, y, CONTENT_W, CARD_HEADER_H, 'FD');

        doc.setFillColor(isCheckedIn ? 22 : 220, isCheckedIn ? 163 : 38, isCheckedIn ? 74 : 38);
        doc.roundedRect(MARGIN + 2, y + 2, 28, 10, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`Piaz. ${val(pitch.number)}`, MARGIN + 5, y + 8.5);

        const headName = `${hg('last_name') || ''} ${hg('first_name') || ''}`.trim() || 'Cliente Sconosciuto';
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(headName, MARGIN + 34, y + 9);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${booking.guests_count} ospiti`, PAGE_W - MARGIN - 2, y + 9, { align: 'right' });

        y += CARD_HEADER_H;

        if (!isCheckedIn) {
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(252, 165, 165);
            doc.rect(MARGIN, y, CONTENT_W, 22, 'FD');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(185, 28, 28);
            doc.text('⚠  CHECK-IN DA EFFETTUARE', MARGIN + 4, y + 8);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(153, 27, 27);
            const refLine = `Riferimento: ${val(customer.last_name)} ${val(customer.first_name)}   |   Tel: ${val(customer.phone)}   |   Email: ${val(customer.email)}`;
            doc.text(refLine, MARGIN + 4, y + 16);
            y += 28;
        } else {
            // ─── SEZIONE 1 — CAPOFAMIGLIA ANAGRAFICA ─────────────
            y += 2;
            sectionTitle(doc, 'CAPOFAMIGLIA — ANAGRAFICA', MARGIN, y, CONTENT_W, [37, 99, 235]);
            y += 7;
            const anaData: [string, string][] = [
                ['Nome e Cognome', `${val(hg('last_name'))} ${val(hg('first_name'))}`],
                ['Data di Nascita', fmtDate(hg('birth_date'))],
                ['Sesso', genderLabel(hg('gender'))],
                ['Luogo di Nascita', `${val(hg('birth_city'))} (${val(hg('birth_province'))}) — ${val(hg('birth_country'))}`],
                ['Cittadinanza', val(hg('citizenship'))],
            ];
            y = renderKeyValueTable(doc, anaData, MARGIN, y, CONTENT_W);

            // ─── SEZIONE 2 — RESIDENZA ───────────────────────────
            if (y + 40 > 285) { y = onNewPage(); }
            sectionTitle(doc, 'RESIDENZA', MARGIN, y, CONTENT_W, [180, 130, 10]);
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
            if (y + 45 > 285) { y = onNewPage(); }
            sectionTitle(doc, 'DOCUMENTO DI IDENTITÀ', MARGIN, y, CONTENT_W, [5, 150, 105]);
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
            if (y + 20 > 285) { y = onNewPage(); }
            sectionTitle(doc, 'VEICOLO', MARGIN, y, CONTENT_W, [79, 70, 229]);
            y += 7;
            const vehData: [string, string][] = [['Targa', val(hg('license_plate'))]];
            y = renderKeyValueTable(doc, vehData, MARGIN, y, CONTENT_W);

            // ─── SEZIONE 5 — ALTRI OSPITI ───────────────────────
            if (otherGuests.length > 0) {
                if (y + 30 > 285) { y = onNewPage(); }
                sectionTitle(doc, `ALTRI OSPITI (${otherGuests.length})`, MARGIN, y, CONTENT_W, [100, 116, 139]);
                y += 7;

                otherGuests.forEach((g: any, gIdx: number) => {
                    if (y + 35 > 285) { y = onNewPage(); }
                    doc.setFillColor(248, 250, 252);
                    doc.setDrawColor(226, 232, 240);
                    doc.rect(MARGIN, y, CONTENT_W, 8, 'FD');
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text(`${gIdx + 2}. ${val(g.last_name)} ${val(g.first_name)}`, MARGIN + 3, y + 5.5);
                    y += 9;

                    const guestData: [string, string][] = [
                        ['Anagrafica', `${val(g.last_name)} ${val(g.first_name)} (${genderLabel(g.gender)})`],
                        ['Nascita', `${fmtDate(g.birth_date)} - ${val(g.birth_city)} (${val(g.birth_province)}) — ${val(g.birth_country)}`],
                        ['Cittadinanza', val(g.citizenship)],
                    ];
                    y = renderKeyValueTable(doc, guestData, MARGIN, y, CONTENT_W);
                    y += 3;
                });
            }
        }
        return y;
    };

    return (
        <Button
            variant="outline"
            className="gap-2 bg-background hover:bg-muted font-semibold transition-all active:scale-95"
            onClick={handleGenerate}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {loading ? 'Generazione...' : 'Stampa Arrivi'}
            </span>
        </Button>
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

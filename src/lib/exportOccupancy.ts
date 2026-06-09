import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export interface ExportData {
    pitchNumber: string;
    days: {
        date: string;
        isOccupied: boolean;
        customerName?: string;
    }[];
}

export const exportOccupancyToPDF = (
    data: ExportData[],
    sectorName: string,
    timeframeName: string,
    startDateStr: string,
    endDateStr: string
) => {
    // Landscape A4 for Matrix
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

    // Title
    const title = `Occupazione - Settore ${sectorName} (${timeframeName})`;
    
    // Parse Dates
    let dateRangeStr = '';
    try {
        const start = parseISO(startDateStr);
        const end = parseISO(endDateStr);
        dateRangeStr = `${format(start, 'd MMM yyyy', { locale: it })} - ${format(end, 'd MMM yyyy', { locale: it })}`;
    } catch (e) {
        dateRangeStr = `${startDateStr} - ${endDateStr}`;
    }

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periodo: ${dateRangeStr}`, 14, 22);

    if (data.length === 0 || data[0].days.length === 0) {
         doc.text("Nessun dato disponibile.", 14, 35);
         doc.save(`occupazione_${sectorName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${startDateStr}.pdf`);
         return;
    }

    // Build Table Headers
    const days = data[0].days;
    const tableHead = [['Piazzola', ...days.map(d => {
        try {
            return format(parseISO(d.date), 'dd/MM');
        } catch {
            return d.date;
        }
    })]];

    // Build Table Body
    const tableBody = data.map(row => {
        const rowData = [row.pitchNumber];
        row.days.forEach(day => {
             // In the body array, we just need empty strings or text. We will handle colors in hooks.
             // Print first 3 chars of name if occupied to keep cells small
             rowData.push(day.isOccupied ? (day.customerName?.substring(0, 3).toUpperCase() || 'OCC') : '');
        });
        return rowData;
    });

    autoTable(doc, {
        startY: 30,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: {
            fontSize: 7,
            cellPadding: 1,
            halign: 'center',
            valign: 'middle',
            overflow: 'hidden',
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 8,
        },
        columnStyles: {
            0: { cellWidth: 20, fontStyle: 'bold', halign: 'left', fillColor: [240, 240, 240] }
        },
        didParseCell: function(dataHook) {
            // dataHook.section can be 'head', 'body', 'foot'
            if (dataHook.section === 'body' && dataHook.column.index > 0) {
                // Find the original day data
                const rowIndex = dataHook.row.index;
                const colIndex = dataHook.column.index - 1;
                const dayInfo = data[rowIndex]?.days[colIndex];
                
                if (dayInfo && dayInfo.isOccupied) {
                     // Red box
                     dataHook.cell.styles.fillColor = [255, 220, 220]; // Light red
                     dataHook.cell.styles.textColor = [150, 0, 0];
                } else {
                     // Green box
                     dataHook.cell.styles.fillColor = [220, 255, 220]; // Light green
                }
            }
        }
    });

    const safeSector = sectorName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`occupazione_${safeSector}_${startDateStr}.pdf`);
};

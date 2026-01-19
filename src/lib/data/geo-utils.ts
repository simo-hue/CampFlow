
import comuniData from './comuni.json';

export type Comune = {
    nome: string;
    codice: string;
    zona: { codice: string; nome: string };
    regione: { codice: string; nome: string };
    provincia: { codice: string; nome: string };
    sigla: string;
    codiceCatastale: string;
    cap: string[];
    popolazione: number;
};

// Type assertion since importing JSON directly might infer shape loosely
const comuni = comuniData as Comune[];

export const searchComuni = (query: string): Comune[] => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    // Filter by name, limit to 50 results for performance
    return comuni
        .filter((c) => c.nome.toLowerCase().includes(lowerQuery))
        .slice(0, 50);
};

export const getComuneByExactName = (name: string): Comune | undefined => {
    return comuni.find((c) => c.nome.toLowerCase() === name.toLowerCase());
};

// Extract unique provinces
const provincesMap = new Map<string, string>();
comuni.forEach(c => {
    provincesMap.set(c.sigla, c.provincia.nome);
});

export type Province = { sigla: string; nome: string };

const provinces: Province[] = Array.from(provincesMap.entries())
    .map(([sigla, nome]) => ({ sigla, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

export const searchProvince = (query: string): Province[] => {
    if (!query) return provinces.slice(0, 50);
    const lowerQuery = query.toLowerCase();
    return provinces
        .filter((p) =>
            p.nome.toLowerCase().includes(lowerQuery) ||
            p.sigla.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 50);
};

export const getAllProvince = () => provinces;

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

export function MapPlaceholder() {
    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Mappa Interattiva
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                    <div className="text-center text-muted-foreground">
                        <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Mappa Campeggio</p>
                        <p className="text-sm mt-1">Coming Soon - Vista SVG interattiva delle 300 piazzole</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

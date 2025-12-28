'use client';

import { useState, useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export function CsvManager() {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadTemplate = () => {
        const headers = ['Nombre', 'Categoria', 'Unidad (KG/L/UD)', 'Precio', 'Rendimiento (%)', 'Alergenos (Separados por coma)'];
        const rows = [
            ['Tomate Pera', 'Verduras', 'KG', '1.50', '100', ''],
            ['Harina Trigo', 'Secos', 'KG', '0.80', '100', 'Gluten'],
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'plantilla_productos.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r?\n/);
            const data = lines.slice(1).map(line => {
                // Better CSV parsing to handle basic quoted strings if needed, 
                // but for now simple split with robust cleanup
                const parts = line.split(',');
                if (parts.length < 4) return null; // Skip empty or invalid lines

                const [name, category, pricingUnit, pricePerUnit, yieldPercent, allergens] = parts;

                return {
                    name: name?.trim(),
                    category: category?.trim() || 'Otros',
                    pricingUnit: pricingUnit?.trim() || 'KG',
                    pricePerUnit: parseFloat(pricePerUnit?.trim() || '0'),
                    yieldPercent: parseFloat(yieldPercent?.trim() || '100'),
                    allergens: allergens ? allergens.replace(/"/g, '').split(';').map(s => s.trim()) : []
                };
            }).filter(item => item && item.name);

            try {
                const res = await fetch('/api/products/batch', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (res.ok) {
                    const result = await res.json();
                    alert(`Se han cargado ${result.count} productos correctamente.`);
                    window.location.reload();
                } else {
                    alert('Error al cargar productos. Verifique el formato del CSV.');
                }
            } catch (error) {
                console.error(error);
                alert('Error de conexión con el servidor.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 text-sm font-medium shadow-sm transition-colors"
                title="Descargar plantilla CSV"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Plantilla CSV</span>
            </button>

            <input
                type="file"
                id="csv-upload"
                ref={fileInputRef}
                onChange={handleUpload}
                accept=".csv"
                className="hidden"
            />

            <label
                htmlFor="csv-upload"
                className={`flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 text-sm font-medium shadow-sm transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{isUploading ? 'Cargando...' : 'Cargar CSV'}</span>
            </label>
        </div>
    );
}

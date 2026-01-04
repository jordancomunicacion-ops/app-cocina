export type UnitType = 'KG' | 'G' | 'L' | 'ML' | 'UD';

export const UNITS = {
    KG: 'KG',
    G: 'G',
    L: 'L',
    ML: 'ML',
    UD: 'UD',
} as const;

export const UNIT_LABELS = {
    [UNITS.KG]: 'Kilogramos',
    [UNITS.G]: 'Gramos',
    [UNITS.L]: 'Litros',
    [UNITS.ML]: 'Mililitros',
    [UNITS.UD]: 'Unidades',
};

// Base units: KG for mass, L for volume, UD for count.
// Conversion factors to Base Unit.
const CONVERSION_FACTORS: Record<UnitType, number> = {
    KG: 1,
    G: 0.001,
    L: 1,
    ML: 0.001,
    UD: 1,
};

export function convertTo(amount: number, fromUnit: UnitType, toUnit: UnitType): number | null {
    if (fromUnit === toUnit) return amount;

    // Mass to Mass
    if ((fromUnit === 'KG' || fromUnit === 'G') && (toUnit === 'KG' || toUnit === 'G')) {
        const amountInKg = amount * CONVERSION_FACTORS[fromUnit];
        return amountInKg / CONVERSION_FACTORS[toUnit];
    }

    // Volume to Volume
    if ((fromUnit === 'L' || fromUnit === 'ML') && (toUnit === 'L' || toUnit === 'ML')) {
        const amountInL = amount * CONVERSION_FACTORS[fromUnit];
        return amountInL / CONVERSION_FACTORS[toUnit];
    }

    // Unit to Unit (Identity)
    if (fromUnit === 'UD' && toUnit === 'UD') {
        return amount;
    }

    // Incompatible types (e.g. Mass to Volume without density)
    // For MVP we assume water density if we REALLY need to (1kg = 1L) but safer to return null
    return null;
}

export function formatUnit(amount: number, unit: UnitType): string {
    return `${amount} ${unit}`;
}

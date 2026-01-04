import { prisma } from '@/lib/prisma';
import { convertTo, UnitType } from '@/app/lib/units';
import { Ingredient } from '@prisma/client';

type ShoppingItem = {
    ingredient: Ingredient;
    totalQuantity: number;
    unit: UnitType;
    estimatedCost: number;
};

export async function generateShoppingList(eventId: string): Promise<ShoppingItem[]> {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            menuItems: {
                include: {
                    recipe: {
                        include: {
                            items: {
                                include: {
                                    ingredient: true,
                                    subRecipe: {
                                        include: {
                                            items: {
                                                include: { ingredient: true }
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!event) return [];

    const shoppingMap = new Map<string, ShoppingItem>();

    for (const menuItem of event.menuItems) {
        const recipe = menuItem.recipe;

        // Determine how many times we need to make the recipe
        // If servingsOverride is set, use it. Otherwise use event PAX.
        // NOTE: In really advanced logic, we check if recipe.yieldQuantity fits into servings.
        // Simple logic: Needs = (Pax * SafetyMargin) / RecipeYield

        const targetServings = (menuItem.servingsOverride || event.pax) * event.safetyMargin;
        const factor = targetServings / (recipe.yieldQuantity || 1);

        // Process Recipe Items
        for (const item of recipe.items) {
            if (item.type === 'INGREDIENT' && item.ingredient) {
                addIngredientToMap(shoppingMap, item.ingredient, item.quantityGross * factor, item.unit as UnitType);
            } else if (item.type === 'SUB_RECIPE' && item.subRecipe) {
                // Recursive logic (1 level deep handled here for simplicity, ideally recursive function)
                // SubRecipe Quantity Needed = Item Quantity * Factor
                // SubRecipe Yield = subRecipe.yield
                // SubRecipe Factor = (Item Quantity * Factor) / SubRecipe Yield
                const subRecipe = item.subRecipe;
                const subFactor = (item.quantityGross * factor) / (subRecipe.yieldQuantity || 1);

                for (const subItem of subRecipe.items) {
                    if (subItem.type === 'INGREDIENT' && subItem.ingredient) {
                        addIngredientToMap(shoppingMap, subItem.ingredient, subItem.quantityGross * subFactor, subItem.unit as UnitType);
                    }
                }
            }
        }
    }

    return Array.from(shoppingMap.values());
}

function addIngredientToMap(
    map: Map<string, ShoppingItem>,
    ingredient: Ingredient,
    quantity: number,
    unit: UnitType
) {
    const existing = map.get(ingredient.id);
    // Convert incoming quantity to Ingredient's preferred Purchasing Unit/Pricing Unit
    const targetUnit = ingredient.pricingUnit as UnitType;
    const convertedQuantity = convertTo(quantity, unit, targetUnit);

    if (convertedQuantity === null) {
        console.warn(`Could not convert ${unit} to ${targetUnit} for ${ingredient.name}`);
        return;
    }

    if (existing) {
        existing.totalQuantity += convertedQuantity;
        existing.estimatedCost += convertedQuantity * ingredient.pricePerUnit;
    } else {
        map.set(ingredient.id, {
            ingredient,
            totalQuantity: convertedQuantity,
            unit: targetUnit,
            estimatedCost: convertedQuantity * ingredient.pricePerUnit
        });
    }
}

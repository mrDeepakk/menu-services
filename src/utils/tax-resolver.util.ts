import { Category, ICategory } from '../models/category.model';
import { Subcategory, ISubcategory } from '../models/subcategory.model';
import { IItem } from '../models/item.model';
import { Types } from 'mongoose';

/**
 * Tax Resolution Utility
 * Implements the tax inheritance chain: Item → Subcategory → Category
 * 
 * CRITICAL BUSINESS RULE:
 * Items NEVER store tax values. Tax is always resolved at runtime by walking up the hierarchy.
 * This ensures that changing category/subcategory tax automatically affects all dependent items.
 */

export interface TaxInfo {
    tax_applicable: boolean;
    tax_percentage: number;
    source: 'subcategory' | 'category' | 'none';
}

/**
 * Resolve tax for an item by walking up the inheritance chain
 * @param item - The item to resolve tax for
 * @returns Tax information with source
 */
export async function resolveTax(item: IItem): Promise<TaxInfo> {
    try {
        // First, try to get subcategory
        const subcategory = await Subcategory.findById(item.subcategory_id);

        if (!subcategory) {
            throw new Error('Subcategory not found for item');
        }

        // Check if subcategory has tax override
        if (
            subcategory.tax_applicable !== undefined &&
            subcategory.tax_percentage !== undefined
        ) {
            return {
                tax_applicable: subcategory.tax_applicable,
                tax_percentage: subcategory.tax_percentage,
                source: 'subcategory',
            };
        }

        // If no subcategory override, get from category
        const category = await Category.findById(subcategory.category_id);

        if (!category) {
            throw new Error('Category not found for subcategory');
        }

        return {
            tax_applicable: category.tax_applicable,
            tax_percentage: category.tax_percentage,
            source: 'category',
        };
    } catch (error) {
        console.error('Error resolving tax:', error);
        // Fallback to no tax
        return {
            tax_applicable: false,
            tax_percentage: 0,
            source: 'none',
        };
    }
}

/**
 * Resolve tax using pre-populated subcategory and category
 * More efficient when data is already loaded
 */
export function resolveTaxFromPopulated(
    subcategory: ISubcategory & { category_id: ICategory },
    item?: IItem
): TaxInfo {
    // Check if subcategory has tax override
    if (
        subcategory.tax_applicable !== undefined &&
        subcategory.tax_percentage !== undefined
    ) {
        return {
            tax_applicable: subcategory.tax_applicable,
            tax_percentage: subcategory.tax_percentage,
            source: 'subcategory',
        };
    }

    // Get from category
    const category = subcategory.category_id as unknown as ICategory;

    return {
        tax_applicable: category.tax_applicable,
        tax_percentage: category.tax_percentage,
        source: 'category',
    };
}

/**
 * Calculate tax amount based on base price
 */
export function calculateTaxAmount(basePrice: number, taxInfo: TaxInfo): number {
    if (!taxInfo.tax_applicable) {
        return 0;
    }

    return (basePrice * taxInfo.tax_percentage) / 100;
}

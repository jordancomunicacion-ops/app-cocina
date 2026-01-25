import { createCategory, deleteCategory, CategoryFormState, fetchCategories } from '@/app/lib/actions/settings';
import CategoryListClient from './category-list-client';

export default async function CategoryList() {
    const categories = await fetchCategories();
    return <CategoryListClient categories={categories} />;
}

import CategoryList from '@/app/ui/settings/category-list';
import PackagingList from '@/app/ui/settings/packaging-list';

export default function Page() {
    return (
        <main>
            <h1 className="mb-8 text-2xl font-bold">Configuración</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <CategoryList />
                </div>
                <div>
                    <PackagingList />
                </div>
            </div>
        </main>
    );
}

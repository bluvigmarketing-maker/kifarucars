import { LiquorCategoryManager } from "@/components/admin/liquor/LiquorCategoryManager";
import { listLiquorCategories } from "@/lib/admin/liquor-data";

export default async function LiquorCategoriesPage() {
  const categories = await listLiquorCategories();
  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Liquor categories</h1>
      <p className="mt-1 max-w-2xl text-sm text-charcoal-500 dark:text-charcoal-400">
        The shop&apos;s category chips and menus. A sub-category (e.g. Whisky inside Spirits) also shows its products
        under the parent. The order number controls the order on the shop.
      </p>
      <div className="mt-6">
        <LiquorCategoryManager categories={categories} />
      </div>
    </div>
  );
}

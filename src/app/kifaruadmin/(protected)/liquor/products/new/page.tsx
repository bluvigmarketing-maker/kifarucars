import { LiquorProductForm } from "@/components/admin/liquor/LiquorProductForm";
import { listLiquorCategories } from "@/lib/admin/liquor-data";

export default async function NewLiquorProductPage() {
  const categories = await listLiquorCategories();
  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Add liquor product</h1>
      <div className="mt-6">
        <LiquorProductForm categories={categories} />
      </div>
    </div>
  );
}

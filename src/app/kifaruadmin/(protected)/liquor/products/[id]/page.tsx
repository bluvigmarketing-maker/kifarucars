import { notFound } from "next/navigation";
import { LiquorProductForm } from "@/components/admin/liquor/LiquorProductForm";
import { getLiquorProduct, listLiquorCategories } from "@/lib/admin/liquor-data";

export default async function EditLiquorProductPage({ params }: PageProps<"/kifaruadmin/liquor/products/[id]">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getLiquorProduct(id), listLiquorCategories()]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Edit product</h1>
      <div className="mt-6">
        <LiquorProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}

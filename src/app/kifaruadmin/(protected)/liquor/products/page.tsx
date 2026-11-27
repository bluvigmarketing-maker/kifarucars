import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiquorProductsTable } from "@/components/admin/liquor/LiquorProductsTable";
import {
  LIQUOR_PRODUCTS_PAGE_SIZE,
  listLiquorCategories,
  listLiquorProducts,
  type ProductFilter,
} from "@/lib/admin/liquor-data";

const FILTERS: { value: ProductFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "In the shop" },
  { value: "hidden", label: "Hidden" },
  { value: "out-of-stock", label: "Out of stock" },
  { value: "featured", label: "Featured" },
  { value: "no-photo", label: "No photo" },
];

const selectClasses =
  "rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900";

export default async function LiquorProductsPage({ searchParams }: PageProps<"/kifaruadmin/liquor/products">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(params.q).slice(0, 80);
  const categoryId = one(params.category) || undefined;
  const filter = (FILTERS.find((f) => f.value === one(params.filter))?.value ?? "all") as ProductFilter;
  const page = Math.max(1, Number.parseInt(one(params.page) || "1", 10) || 1);
  const saved = one(params.saved) === "1";

  const [categories, { products, total }] = await Promise.all([
    listLiquorCategories(),
    listLiquorProducts({ q, categoryId, filter, page }),
  ]);
  const pages = Math.max(1, Math.ceil(total / LIQUOR_PRODUCTS_PAGE_SIZE));

  const href = (p: number) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (categoryId) s.set("category", categoryId);
    if (filter !== "all") s.set("filter", filter);
    if (p > 1) s.set("page", String(p));
    const str = s.toString();
    return `/kifaruadmin/liquor/products${str ? `?${str}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Liquor products</h1>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
            {total} {total === 1 ? "product" : "products"} · changes show in the shop immediately
          </p>
        </div>
        <Button href="/kifaruadmin/liquor/products/new" size="sm">
          <Plus size={16} /> Add product
        </Button>
      </div>

      {saved ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
          Product saved.
        </p>
      ) : null}

      <form className="mt-5 flex flex-wrap items-center gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search name or SKU"
          aria-label="Search products"
          className="w-56 rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
        />
        <select name="category" defaultValue={categoryId ?? ""} aria-label="Category" className={selectClasses}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_id ? "— " : ""}
              {c.name}
            </option>
          ))}
        </select>
        <select name="filter" defaultValue={filter} aria-label="Show" className={selectClasses}>
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-burgundy-600 px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-700">
          Apply
        </button>
        {q || categoryId || filter !== "all" ? (
          <Link href="/kifaruadmin/liquor/products" className="text-sm text-charcoal-500 hover:text-burgundy-700">
            Clear
          </Link>
        ) : null}
      </form>

      <div className="mt-5">
        <LiquorProductsTable products={products} />
      </div>

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={href(page - 1)} aria-label="Previous page" className="rounded-lg border border-charcoal-200 p-2 dark:border-charcoal-700">
              <ChevronLeft size={16} />
            </Link>
          ) : null}
          <span className="text-charcoal-600 dark:text-charcoal-300">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={href(page + 1)} aria-label="Next page" className="rounded-lg border border-charcoal-200 p-2 dark:border-charcoal-700">
              <ChevronRight size={16} />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

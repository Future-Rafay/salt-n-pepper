import { adminAction } from "@/app/admin/(protected)/actions";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { AdminPage, Check, EditLink, Empty, Field, Notice, SaveBar, SelectField } from "@/components/admin/admin-ui";
import { ProductsFilter } from "@/components/admin/products-filter";
import { SlugField } from "@/components/admin/slug-field";
import { getMenuAdminData } from "@/server/services/admin";
import { resolvePublicImageUrl } from "@/server/storage/s3";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ categories, products }, feedback] = await Promise.all([
    getMenuAdminData(),
    searchParams,
  ]);
  const returnTo = "/admin/menu/products";

  return (
    <AdminPage
      title="Menu Products"
      description="Create products here, then manage prices, options, allergens, and availability on each product."
      actions={<EditLink href="/admin/menu/categories">Categories</EditLink>}
    >
      <Notice {...feedback} />

      <ProductsFilter
        products={products.map((p) => ({
          id: p.id,
          nameEn: p.nameEn,
          nameDe: p.nameDe,
          active: p.active,
          available: p.available,
          imageUrl: resolvePublicImageUrl(p.imageKey),
          category: { id: p.categoryId, nameEn: p.category.nameEn },
          variants: p.variants,
          optionGroups: p.optionGroups,
        }))}
        categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))}
      >
        {/* Add Product Form */}
        {categories.length === 0 ? (
          <Empty>Add a category before creating products.</Empty>
        ) : (
          <AdminFormDialog trigger="Add product" title="Add product" description="Create the product, then add prices and options." variant="primary">
            <form action={adminAction} className="mt-4 space-y-4">
              <input type="hidden" name="intent" value="product" />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Category" name="categoryId">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameEn}
                    </option>
                  ))}
                </SelectField>
                <SlugField />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="German name" name="nameDe" required />
                <Field label="English name" name="nameEn" required />
              </div>
              <ImageUploadField />
              <Field label="Sort order" name="sortOrder" type="number" min="0" defaultValue="0" required />
              <div className="flex flex-wrap gap-5">
                <Check label="Published" name="active" defaultChecked />
                <Check label="Available" name="available" defaultChecked />
                <Check label="Halal" name="isHalal" />
              </div>
              <input type="hidden" name="spiceLevel" value="" />
              <input type="hidden" name="allergenIds" value="" />
              <SaveBar returnTo={returnTo} label="Add product" />
            </form>
          </AdminFormDialog>
        )}
      </ProductsFilter>
    </AdminPage>
  );
}

import { adminAction } from "@/app/admin/(protected)/actions";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { AdminPage, Check, Field, Notice, SaveBar, TextareaField } from "@/components/admin/admin-ui";
import { DeleteDialog } from "@/components/admin/danger-actions";
import { SlugField } from "@/components/admin/slug-field";
import { getMenuAdminData } from "@/server/services/admin";

type Category = Awaited<ReturnType<typeof getMenuAdminData>>["categories"][number];

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ categories }, feedback] = await Promise.all([getMenuAdminData(), searchParams]);
  const returnTo = "/admin/menu/categories";
  return <AdminPage title="Menu categories" description="Compact bilingual category structure." actions={<AdminFormDialog trigger="Add category" title="Add category" description="Create a bilingual menu category." variant="primary"><CategoryForm returnTo={returnTo} /></AdminFormDialog>}><Notice {...feedback} /><div className="overflow-hidden rounded-xl border bg-white">{categories.length === 0 ? <p className="p-8 text-center text-sm text-muted">No categories.</p> : categories.map((category) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-0"><div><h2 className="font-semibold">{category.nameEn}</h2><p className="text-xs text-muted">{category.nameDe} · /{category.slug} · {category.active ? "Published" : "Draft"}</p></div><div className="flex gap-2"><AdminFormDialog trigger="Edit" title={`Edit ${category.nameEn}`} description="Update this category."><CategoryForm returnTo={returnTo} category={category} /></AdminFormDialog><DeleteDialog intent="delete_menu" kind="category" id={category.id} returnTo={returnTo} label="Delete" /></div></div>)}</div></AdminPage>;
}

function CategoryForm({ returnTo, category }: { returnTo: string; category?: Category }) { return <form action={adminAction} className="space-y-4"><input type="hidden" name="intent" value="category" />{category && <input type="hidden" name="id" value={category.id} />}<SlugField defaultValue={category?.slug} /><div className="grid gap-4 sm:grid-cols-2"><Field label="German name" name="nameDe" defaultValue={category?.nameDe} required /><Field label="English name" name="nameEn" defaultValue={category?.nameEn} required /></div><TextareaField label="German description" name="descriptionDe" defaultValue={category?.descriptionDe} /><TextareaField label="English description" name="descriptionEn" defaultValue={category?.descriptionEn} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Sort order" name="sortOrder" type="number" min="0" defaultValue={category?.sortOrder ?? 0} required /><Check label="Published" name="active" defaultChecked={category?.active ?? true} /></div><SaveBar returnTo={returnTo} label={category ? "Save category" : "Add category"} /></form>; }

import { CategoryEditor } from "@/components/admin/category-editor";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryEditor categoryId={id} />;
}

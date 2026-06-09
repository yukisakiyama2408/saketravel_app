import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/?drink=${id}`);
}

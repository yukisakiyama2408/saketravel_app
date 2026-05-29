import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";
const label = "text-[11px] font-semibold text-[#0D1B2A]/50";

async function addDish(fd: FormData) {
  "use server";
  const pairingIds = fd.getAll("pairing_drink_ids") as string[];
  await adminClient().from("dishes").insert({
    name: fd.get("name") as string,
    region_id: (fd.get("region_id") as string) || null,
    description: (fd.get("description") as string) || null,
    pairing_drink_ids: pairingIds.length > 0 ? pairingIds : null,
  });
  revalidatePath("/admin/dishes");
}

async function updateDish(fd: FormData) {
  "use server";
  const pairingIds = fd.getAll("pairing_drink_ids") as string[];
  await adminClient().from("dishes").update({
    name: fd.get("name") as string,
    region_id: (fd.get("region_id") as string) || null,
    description: (fd.get("description") as string) || null,
    pairing_drink_ids: pairingIds.length > 0 ? pairingIds : null,
  }).eq("id", fd.get("id") as string);
  revalidatePath("/admin/dishes");
}

async function deleteDish(fd: FormData) {
  "use server";
  await adminClient().from("dishes").delete().eq("id", fd.get("id") as string);
  revalidatePath("/admin/dishes");
}

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit: editId } = await searchParams;
  const db = adminClient();
  const [{ data: dishes }, { data: regions }, { data: drinks }] = await Promise.all([
    db.from("dishes").select("*, region:regions(name)").order("name"),
    db.from("regions").select("id, name").order("name"),
    db.from("drinks").select("id, name, genre").order("name"),
  ]);
  const editingDish = dishes?.find((d) => d.id === editId);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-12 md:px-8">
      {editingDish && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#0D1B2A]/35 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl" style={{ background: "var(--paper-2)", borderColor: "var(--ink-08)" }}>
            <ModalHeader title={editingDish.name} kicker="EDIT DISH" />
            <form action={updateDish} className="space-y-3 p-5">
              <input type="hidden" name="id" value={editingDish.id} />
              <Field labelText="料理名 *"><input name="name" required defaultValue={editingDish.name} className={inp} /></Field>
              <Field labelText="産地">
                <select name="region_id" defaultValue={editingDish.region_id ?? ""} className={inp}>
                  <option value="">産地（任意）</option>
                  {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
              <Field labelText="説明"><textarea name="description" defaultValue={editingDish.description ?? ""} rows={3} className={inp} /></Field>
              <PairingCheckboxes drinks={drinks ?? []} defaultIds={editingDish.pairing_drink_ids as string[] | null} />
              <div className="flex gap-2 pt-1">
                <button type="submit" className={btn}>保存</button>
                <a href="/admin/dishes" className="w-full rounded-lg border border-[#0D1B2A]/20 py-2 text-center text-sm text-[#0D1B2A]/60">キャンセル</a>
              </div>
            </form>
          </div>
        </div>
      )}

      <PageHeader kicker="DISHES" title="料理" desc="料理名、説明、産地、合わせるお酒を登録します。" />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <PanelHead title="新規追加" desc="料理とペアリングを登録" />
          <form action={addDish} className="space-y-3 p-4">
            <Field labelText="料理名 *"><input name="name" required placeholder="例: 天ぷら" className={inp} /></Field>
            <Field labelText="産地">
              <select name="region_id" className={inp}>
                <option value="">産地（任意）</option>
                {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field labelText="説明"><textarea name="description" placeholder="説明" rows={3} className={inp} /></Field>
            <PairingCheckboxes drinks={drinks ?? []} />
            <button type="submit" className={btn}>追加する</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <ListHead title="登録済み" count={dishes?.length ?? 0} />
          <ul className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {dishes?.map((dish) => (
              <li key={dish.id}>
                <div className="flex h-full flex-col rounded-xl border p-4" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
                  <div className="mb-3">
                    <p className="truncate text-base font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{dish.name}</p>
                    <span className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--amber-tint)", border: "1px solid rgba(200,137,61,0.22)", color: "var(--amber-dk)" }}>{(dish.region as { name: string } | null)?.name ?? "産地なし"}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {dish.description && <p className="line-clamp-3 text-xs leading-relaxed" style={{ color: "var(--ink-70)" }}>{dish.description}</p>}
                    <p className="text-xs" style={{ color: "var(--ink-50)" }}>ペアリング: {(dish.pairing_drink_ids as string[] | null)?.length ?? 0}件</p>
                  </div>
                  <CardActions editHref={`/admin/dishes?edit=${dish.id}`} deleteAction={deleteDish} id={dish.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

type DrinkOption = { id: string; name: string; genre: string };

function PairingCheckboxes({ drinks, defaultIds }: { drinks: DrinkOption[]; defaultIds?: string[] | null }) {
  if (drinks.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs text-[#0D1B2A]/50">合わせるお酒（複数可）</p>
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[#0D1B2A]/10 bg-[#F8F3EC] px-3 py-2">
        {drinks.map((d) => (
          <label key={d.id} className="flex cursor-pointer items-center gap-2 text-sm text-[#0D1B2A]">
            <input type="checkbox" name="pairing_drink_ids" value={d.id} defaultChecked={defaultIds?.includes(d.id)} className="accent-[#E8A045]" />
            {d.name} <span className="text-xs text-[#0D1B2A]/40">· {d.genre}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return <div className="mb-6"><p className="mb-1 text-[11px] tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}>{kicker}</p><h1 className="text-[30px] font-bold leading-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>{desc}</p></div>;
}
function PanelHead({ title, desc }: { title: string; desc: string }) {
  return <div className="border-b px-4 py-3" style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.56)" }}><h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2><p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>{desc}</p></div>;
}
function ListHead({ title, count }: { title: string; count: number }) {
  return <div className="border-b px-4 py-3" style={{ borderColor: "var(--ink-08)" }}><h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2><p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>{count}件</p></div>;
}
function Field({ labelText, children }: { labelText: string; children: React.ReactNode }) {
  return <label className="block"><span className={`${label} mb-1.5 block`}>{labelText}</span>{children}</label>;
}
function ModalHeader({ title, kicker }: { title: string; kicker: string }) {
  return <div className="flex items-center justify-between gap-4 border-b px-5 py-4" style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.72)" }}><div className="min-w-0"><p className="mb-1 text-[10px] tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}>{kicker}</p><h2 className="truncate text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2></div><a href="/admin/dishes" className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border text-lg leading-none" style={{ borderColor: "var(--ink-08)", color: "var(--ink-50)", background: "var(--paper-2)" }} aria-label="閉じる">×</a></div>;
}
function CardActions({ editHref, deleteAction, id }: { editHref: string; deleteAction: (fd: FormData) => Promise<void>; id: string }) {
  return <div className="mt-3 flex items-center gap-2"><a href={editHref} className="flex-1 rounded-full border border-[#0D1B2A]/10 px-3 py-1.5 text-center text-xs font-semibold text-[#0D1B2A]/50">編集</a><form action={deleteAction} className="flex-1"><input type="hidden" name="id" value={id} /><button type="submit" className="w-full rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500">削除</button></form></div>;
}

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";
const label = "text-[11px] font-semibold text-[#0D1B2A]/50";

async function addStore(fd: FormData) {
  "use server";
  const regionIds = fd.getAll("region_ids") as string[];
  const drinkIds = fd.getAll("drink_ids") as string[];
  await adminClient().from("stores").insert({
    name: fd.get("name") as string,
    address: (fd.get("address") as string) || null,
    hours: (fd.get("hours") as string) || null,
    genre: (fd.get("genre") as string) || null,
    google_maps_url: (fd.get("google_maps_url") as string) || null,
    region_ids: regionIds.length > 0 ? regionIds : null,
    drink_ids: drinkIds.length > 0 ? drinkIds : null,
  });
  revalidatePath("/admin/stores");
}

async function updateStore(fd: FormData) {
  "use server";
  const regionIds = fd.getAll("region_ids") as string[];
  const drinkIds = fd.getAll("drink_ids") as string[];
  await adminClient().from("stores").update({
    name: fd.get("name") as string,
    address: (fd.get("address") as string) || null,
    hours: (fd.get("hours") as string) || null,
    genre: (fd.get("genre") as string) || null,
    google_maps_url: (fd.get("google_maps_url") as string) || null,
    region_ids: regionIds.length > 0 ? regionIds : null,
    drink_ids: drinkIds.length > 0 ? drinkIds : null,
  }).eq("id", fd.get("id") as string);
  revalidatePath("/admin/stores");
}

async function deleteStore(fd: FormData) {
  "use server";
  await adminClient().from("stores").delete().eq("id", fd.get("id") as string);
  revalidatePath("/admin/stores");
}

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit: editId } = await searchParams;
  const db = adminClient();
  const [{ data: stores }, { data: regions }, { data: drinks }] = await Promise.all([
    db.from("stores").select("*").order("name"),
    db.from("regions").select("id, name").order("name"),
    db.from("drinks").select("id, name, genre").order("name"),
  ]);
  const editingStore = stores?.find((s) => s.id === editId);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-12 md:px-8">
      {editingStore && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#0D1B2A]/35 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl" style={{ background: "var(--paper-2)", borderColor: "var(--ink-08)" }}>
            <ModalHeader title={editingStore.name} kicker="EDIT STORE" />
            <form action={updateStore} className="space-y-3 p-5">
              <input type="hidden" name="id" value={editingStore.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field labelText="店名 *"><input name="name" required defaultValue={editingStore.name} className={inp} /></Field>
                <Field labelText="ジャンル"><input name="genre" defaultValue={editingStore.genre ?? ""} placeholder="ジャンル" className={inp} /></Field>
              </div>
              <Field labelText="住所"><input name="address" defaultValue={editingStore.address ?? ""} placeholder="住所" className={inp} /></Field>
              <Field labelText="営業時間"><input name="hours" defaultValue={editingStore.hours ?? ""} placeholder="営業時間" className={inp} /></Field>
              <Field labelText="Google マップ URL"><input name="google_maps_url" type="url" defaultValue={editingStore.google_maps_url ?? ""} placeholder="Google マップ URL" className={inp} /></Field>
              <CheckboxGroup title="関連産地（複数可）" name="region_ids" items={regions ?? []} defaultIds={editingStore.region_ids as string[] | null} />
              <CheckboxGroup title="提供するお酒（複数可）" name="drink_ids" items={drinks ?? []} defaultIds={editingStore.drink_ids as string[] | null} getSub={(item) => "genre" in item ? item.genre : undefined} />
              <div className="flex gap-2 pt-1">
                <button type="submit" className={btn}>保存</button>
                <a href="/admin/stores" className="w-full rounded-lg border border-[#0D1B2A]/20 py-2 text-center text-sm text-[#0D1B2A]/60">キャンセル</a>
              </div>
            </form>
          </div>
        </div>
      )}

      <PageHeader kicker="STORES" title="店舗" desc="店名、住所、営業時間、関連産地、提供するお酒を登録します。" />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <PanelHead title="新規追加" desc="店舗と関連データを登録" />
          <form action={addStore} className="space-y-3 p-4">
            <Field labelText="店名 *"><input name="name" required placeholder="例: 山梨ワイン食堂" className={inp} /></Field>
            <Field labelText="ジャンル"><input name="genre" placeholder="バー・居酒屋" className={inp} /></Field>
            <Field labelText="住所"><input name="address" placeholder="住所" className={inp} /></Field>
            <Field labelText="営業時間"><input name="hours" placeholder="18:00-24:00" className={inp} /></Field>
            <Field labelText="Google マップ URL"><input name="google_maps_url" type="url" placeholder="https://..." className={inp} /></Field>
            <CheckboxGroup title="関連産地（複数可）" name="region_ids" items={regions ?? []} />
            <CheckboxGroup title="提供するお酒（複数可）" name="drink_ids" items={drinks ?? []} getSub={(item) => "genre" in item ? item.genre : undefined} />
            <button type="submit" className={btn}>追加する</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <ListHead title="登録済み" count={stores?.length ?? 0} />
          <ul className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {stores?.map((s) => (
              <li key={s.id}>
                <div className="flex h-full flex-col rounded-xl border p-4" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
                  <div className="mb-3">
                    <p className="truncate text-base font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{s.name}</p>
                    <span className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--amber-tint)", border: "1px solid rgba(200,137,61,0.22)", color: "var(--amber-dk)" }}>{s.genre ?? "ジャンル未設定"}</span>
                  </div>
                  <div className="flex-1 space-y-1 text-xs" style={{ color: "var(--ink-50)" }}>
                    <p className="line-clamp-2">住所: {s.address ?? "住所なし"}</p>
                    {s.hours && <p>営業時間: {s.hours}</p>}
                    <p>関連産地: {(s.region_ids as string[] | null)?.length ?? 0}件</p>
                    <p>提供銘柄: {(s.drink_ids as string[] | null)?.length ?? 0}件</p>
                  </div>
                  <CardActions editHref={`/admin/stores?edit=${s.id}`} deleteAction={deleteStore} id={s.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

type OptionItem = { id: string; name: string; genre?: string };

function CheckboxGroup({ title, name, items, defaultIds, getSub }: { title: string; name: string; items: OptionItem[]; defaultIds?: string[] | null; getSub?: (item: OptionItem) => string | undefined }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs text-[#0D1B2A]/50">{title}</p>
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[#0D1B2A]/10 bg-[#F8F3EC] px-3 py-2">
        {items.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm text-[#0D1B2A]">
            <input type="checkbox" name={name} value={item.id} defaultChecked={defaultIds?.includes(item.id)} className="accent-[#E8A045]" />
            {item.name}
            {getSub?.(item) && <span className="text-xs text-[#0D1B2A]/40">· {getSub(item)}</span>}
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
  return <div className="flex items-center justify-between gap-4 border-b px-5 py-4" style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.72)" }}><div className="min-w-0"><p className="mb-1 text-[10px] tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}>{kicker}</p><h2 className="truncate text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2></div><a href="/admin/stores" className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border text-lg leading-none" style={{ borderColor: "var(--ink-08)", color: "var(--ink-50)", background: "var(--paper-2)" }} aria-label="閉じる">×</a></div>;
}
function CardActions({ editHref, deleteAction, id }: { editHref: string; deleteAction: (fd: FormData) => Promise<void>; id: string }) {
  return <div className="mt-3 flex items-center gap-2"><a href={editHref} className="flex-1 rounded-full border border-[#0D1B2A]/10 px-3 py-1.5 text-center text-xs font-semibold text-[#0D1B2A]/50">編集</a><form action={deleteAction} className="flex-1"><input type="hidden" name="id" value={id} /><button type="submit" className="w-full rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500">削除</button></form></div>;
}

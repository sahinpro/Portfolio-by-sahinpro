import { SlideOver } from "@/admin/components/ui/SlideOver";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import type { ContactSubmissionRow } from "@/admin/types/database";
import { supabase } from "@/utils/supabase";
import { Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function AdminInboxPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ContactSubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ContactSubmissionRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((data ?? []) as ContactSubmissionRow[]);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const updateStatus = async (id: string, status: ContactSubmissionRow["status"]) => {
    const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Updated");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((s) => (s?.id === id ? { ...s, status } : s));
  };

  const mailtoReply = (r: ContactSubmissionRow) => {
    const sub = encodeURIComponent(r.subject?.trim() || "Re: your message");
    window.open(`mailto:${r.email}?subject=${sub}`, "_blank");
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Inbox</h1>
        <p className="text-sm text-white/45 mt-1">Contact form submissions.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "unread", "read", "replied", "archived"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
              filter === f ? "bg-white/15 text-white" : "text-white/45 hover:text-white/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111] overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-white/45 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-white/45 text-sm">No messages.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] uppercase text-white/40">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/[0.05] hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-4 py-2 text-white font-medium">{r.name}</td>
                  <td className="px-4 py-2 text-white/55">{r.email}</td>
                  <td className="px-4 py-2 text-white/45">{r.budget ?? "—"}</td>
                  <td className="px-4 py-2 text-white/40 text-xs">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Message"}
        wide
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void updateStatus(selected.id, "read")}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80"
                >
                  Mark read
                </button>
                <button
                  type="button"
                  onClick={() => void updateStatus(selected.id, "replied")}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80"
                >
                  Mark replied
                </button>
                <button
                  type="button"
                  onClick={() => void updateStatus(selected.id, "archived")}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80"
                >
                  Archive
                </button>
              </div>
              <button
                type="button"
                onClick={() => mailtoReply(selected)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black"
              >
                <Mail className="h-3.5 w-3.5" />
                Reply via email
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
              <p className="text-white">{selected.email}</p>
            </div>
            {selected.phone ? (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Phone</p>
                <p className="text-white">{selected.phone}</p>
              </div>
            ) : null}
            {selected.budget ? (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Budget</p>
                <p className="text-white">{selected.budget}</p>
              </div>
            ) : null}
            {selected.subject ? (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Subject</p>
                <p className="text-white">{selected.subject}</p>
              </div>
            ) : null}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Message</p>
              <p className="text-white/85 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>
            <p className="text-xs text-white/35">{new Date(selected.created_at).toLocaleString()}</p>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

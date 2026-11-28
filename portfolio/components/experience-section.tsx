"use client";

import { useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { EXPERIENCE_ITEMS, type ExperienceItem } from "@/lib/portfolio-data";
import {
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

const EXP_KEY = "tejas_custom_experience";

interface ExperienceListProps {
  maxItems?: number;
}

export function EditableExperienceList({ maxItems }: ExperienceListProps) {
  const raw = useLocalValue(EXP_KEY, "");
  const stored = raw
    ? parseStoredJson<ExperienceItem[]>(raw, EXPERIENCE_ITEMS)
    : null;
  const items = stored ?? EXPERIENCE_ITEMS;
  const visible = maxItems ? items.slice(0, maxItems) : items;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [summary, setSummary] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [stackText, setStackText] = useState("");

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setRole("");
    setCompany("");
    setPeriod("");
    setLocation("");
    setType("");
    setSummary("");
    setHighlightsText("");
    setStackText("");
  };

  const openNew = () => {
    resetForm();
    setPeriod("Present");
    setLocation("India");
    setType("Experience");
    setFormOpen(true);
  };

  const openEdit = (item: ExperienceItem) => {
    setEditingId(item.id);
    setRole(item.role);
    setCompany(item.company);
    setPeriod(item.period);
    setLocation(item.location);
    setType(item.type);
    setSummary(item.summary);
    setHighlightsText(item.highlights.join("\n"));
    setStackText(item.stack.join(", "));
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;

    const highlights = highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const stack = stackText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug =
      role
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "exp";

    const nextItem: ExperienceItem = {
      id: editingId ?? `${slug}-${items.length + 1}`,
      role: role.trim(),
      company: company.trim() || "Independent",
      period: period.trim() || "Present",
      location: location.trim() || "India",
      type: type.trim() || "Experience",
      summary: summary.trim() || "Building products and systems.",
      highlights,
      stack,
    };

    const nextList = editingId
      ? items.map((it) => (it.id === editingId ? nextItem : it))
      : [nextItem, ...items];

    writeLocalValue(EXP_KEY, JSON.stringify(nextList));
    resetForm();
  };

  const handleDelete = (id: string) => {
    const nextList = items.filter((it) => it.id !== id);
    writeLocalValue(EXP_KEY, JSON.stringify(nextList));
  };

  return (
    <div className="space-y-4">
      {formOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-3 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {editingId ? "Edit Experience" : "Add Experience"}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role (e.g. Building Startup — CrossPnP)"
              className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Organization / Startup"
              className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Period (e.g. Present)"
              className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. India)"
              className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
          </div>

          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary..."
            className="w-full rounded-lg border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <textarea
            rows={2}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            placeholder="Highlights (one per line)..."
            className="w-full rounded-lg border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <input
            type="text"
            value={stackText}
            onChange={(e) => setStackText(e.target.value)}
            placeholder="Tech stack (comma separated)"
            className="h-9 w-full rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-neutral-200/80 border-y border-neutral-200/80 dark:divide-neutral-800/80 dark:border-neutral-800/80">
        {visible.map((exp) => (
          <div key={exp.id} className="group py-5 space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-[15px] sm:text-base font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
                  {exp.role}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {exp.company} · {exp.location}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                <span>{exp.period}</span>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEdit(exp)}
                    aria-label={`Edit ${exp.role}`}
                    className="cursor-pointer p-0.5 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id)}
                    aria-label={`Delete ${exp.role}`}
                    className="cursor-pointer p-0.5 text-neutral-500 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[13.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {exp.summary}
            </p>

            {exp.highlights.length > 0 && (
              <ul className="space-y-1 text-[13px] text-neutral-500 dark:text-neutral-400">
                {exp.highlights.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {exp.stack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-0.5 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                {exp.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!formOpen && (
        <div className="flex items-center justify-end gap-3">
          {stored !== null && (
            <button
              type="button"
              onClick={() => writeLocalValue(EXP_KEY, null)}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={openNew}
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <Plus className="h-3 w-3" />
            <span>Add experience</span>
          </button>
        </div>
      )}
    </div>
  );
}

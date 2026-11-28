"use client";

import { useState } from "react";
import { Briefcase, MapPin, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
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
  const stored = raw ? parseStoredJson<ExperienceItem[]>(raw, EXPERIENCE_ITEMS) : null;
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
        <div className="flex items-center gap-2">
          {stored !== null && (
            <button
              type="button"
              onClick={() => writeLocalValue(EXP_KEY, null)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 px-2.5 py-1 text-[10.5px] font-mono text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={openNew}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10.5px] font-mono font-medium text-neutral-800 hover:border-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-white"
          >
            <Plus className="h-3 w-3" />
            <span>Add Experience</span>
          </button>
        </div>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-neutral-300 bg-white p-5 space-y-4 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {editingId ? "Edit Experience" : "Add Experience"}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role (e.g. Building Startup — CrossPnP)"
              className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Organization / Startup"
              className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Period (e.g. Present)"
              className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. India)"
              className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
          </div>

          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary..."
            className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <textarea
            rows={2}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            placeholder="Highlights (one per line)..."
            className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <input
            type="text"
            value={stackText}
            onChange={(e) => setStackText(e.target.value)}
            placeholder="Tech stack (comma separated: Next.js, PostgreSQL, AI)"
            className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-medium dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800 space-y-8">
        {visible.map((exp, idx) => (
          <div key={exp.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#FAFAFA] dark:border-[#0A0A0A] ${
                idx === 0
                  ? "bg-neutral-950 dark:bg-white"
                  : "bg-neutral-400 dark:bg-neutral-600"
              }`}
            />

            <div className="group rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      {exp.type}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-bold">{exp.role}</h3>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {exp.company}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="text-left sm:text-right">
                    <span className="inline-block rounded-full border border-neutral-300 px-2.5 py-0.5 text-[11px] font-mono dark:border-neutral-700">
                      {exp.period}
                    </span>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 sm:justify-end w-full">
                      <MapPin className="h-3 w-3" />
                      {exp.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(exp)}
                      aria-label={`Edit ${exp.role}`}
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id)}
                      aria-label={`Delete ${exp.role}`}
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-red-500 hover:text-red-500 dark:border-neutral-800 dark:text-neutral-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {exp.summary}
              </p>

              {exp.highlights.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {exp.highlights.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950 dark:bg-white" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {exp.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

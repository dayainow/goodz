import { useState, type FormEvent } from "react";
import type { CreateProductRequest } from "@goodz/types";
import { Button } from "@goodz/ui";

const emptyForm: CreateProductRequest = {
  name: "",
  price: 0,
  description: "",
  imageUrl: "",
  category: "stationery",
  stock: 0,
};

interface ProductCreateFormProps {
  onSubmit: (input: CreateProductRequest) => Promise<void>;
  onCancel: () => void;
}

export function ProductCreateForm({
  onSubmit,
  onCancel,
}: ProductCreateFormProps) {
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">새 상품 등록</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">상품명 *</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">카테고리 *</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="stationery">stationery</option>
            <option value="accessory">accessory</option>
            <option value="living">living</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">가격 (원) *</span>
          <input
            required
            type="number"
            min={1}
            value={form.price || ""}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">재고 *</span>
          <input
            required
            type="number"
            min={0}
            step={1}
            value={form.stock || ""}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">설명</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">이미지 URL</span>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="/images/placeholder.png"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "등록 중…" : "등록하기"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}

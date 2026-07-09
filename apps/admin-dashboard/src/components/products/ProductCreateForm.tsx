import { useState, type FormEvent } from "react";
import type { CreateProductRequest } from "@goodz/types";
import { Button } from "@goodz/ui";
import { CATEGORY_CONFIG, type ProductCategory } from "../../lib/categories";

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

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20";

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
      className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-900">새 상품 등록</h3>
      <p className="mt-1 text-sm text-slate-500">
        등록 후 쇼핑몰 API에 즉시 반영됩니다 (mock).
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-slate-700">
            상품명 *
          </span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="예: 굿즈 스티커 팩"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">
            카테고리 *
          </span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
          >
            {(Object.keys(CATEGORY_CONFIG) as ProductCategory[]).map((key) => (
              <option key={key} value={key}>
                {CATEGORY_CONFIG[key].label} ({key})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">
            가격 (원) *
          </span>
          <input
            required
            type="number"
            min={1}
            value={form.price || ""}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">
            재고 *
          </span>
          <input
            required
            type="number"
            min={0}
            step={1}
            value={form.stock || ""}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
            className={inputClass}
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-slate-700">설명</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className={inputClass}
            placeholder="상품 설명을 입력하세요"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-slate-700">
            이미지 URL
          </span>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="/images/placeholder.png"
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
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

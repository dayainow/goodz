export function NewsletterFooter() {
  return (
    <footer className="mt-16 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
      <p className="text-sm font-medium text-brand-violet">Goodz Newsletter</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight">
        새 굿즈 소식을 받아보세요
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        이메일을 입력하면 신상품·이벤트를 알려드려요 (mock)
      </p>
      <div className="mx-auto mt-6 flex max-w-md gap-2">
        <input
          type="email"
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20"
          readOnly
          aria-label="이메일 (데모)"
        />
        <button
          type="button"
          className="rounded-lg bg-brand-violet px-4 py-2 text-sm font-semibold text-white"
        >
          구독
        </button>
      </div>
    </footer>
  );
}

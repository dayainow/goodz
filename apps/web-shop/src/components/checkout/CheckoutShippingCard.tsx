export function CheckoutShippingCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-category-living-bg/40 p-6">
      <h2 className="text-lg font-bold">배송 정보</h2>
      <p className="mt-1 text-sm text-slate-500">MVP mock — 읽기 전용</p>
      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500">받는 사람</dt>
          <dd className="mt-1 rounded-lg border border-slate-200 bg-white px-4 py-3">
            홍길동
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">연락처</dt>
          <dd className="mt-1 rounded-lg border border-slate-200 bg-white px-4 py-3">
            010-0000-0000
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">주소</dt>
          <dd className="mt-1 rounded-lg border border-slate-200 bg-white px-4 py-3">
            서울특별시 강남구 테헤란로 123, 4층 (mock)
          </dd>
        </div>
      </dl>
    </section>
  );
}

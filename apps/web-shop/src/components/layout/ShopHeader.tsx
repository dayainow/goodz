import Link from "next/link";

export function ShopHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-brand-violet">
          Goodz
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/shop" className="text-slate-600 hover:text-brand-violet">
            Shop
          </Link>
          <Link href="/search" className="text-slate-600 hover:text-brand-violet">
            Search
          </Link>
          <Link href="/about" className="text-slate-600 hover:text-brand-violet">
            About
          </Link>
          <Link
            href="/cart"
            className="rounded-full bg-brand-violet px-4 py-2 text-white transition-colors hover:bg-brand-violet-hover"
          >
            장바구니
          </Link>
        </nav>
      </div>
    </header>
  );
}

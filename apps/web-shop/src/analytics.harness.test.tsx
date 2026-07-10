import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { CapturedGAEvent } from "ga-analytics-harness";
import {
  loadSpecFromFile,
  validateCapturedAgainstSpec,
  scanSourceCompliance,
  configureAnalytics,
} from "ga-analytics-harness";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ProductGrid } from "@/components/ProductGrid";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@goodz/types";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const captured: CapturedGAEvent[] = [];

const mockProduct: Product = {
  id: "gd-001",
  name: "굿즈 스티커 팩",
  price: 8900,
  description: "테스트",
  imageUrl: "/images/sticker.png",
  category: "stationery",
  stock: 10,
};

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/cart", () => ({
  addToCart: vi.fn().mockResolvedValue("cart-1"),
}));

describe("Goodz GA4 harness", () => {
  beforeAll(() => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: undefined,
      configurable: true,
    });
    configureAnalytics({
      measurementId: "G-GOODZTEST",
      transport: (url, params) => {
        captured.push({
          event_name: params.en ?? params.event_name ?? "",
          params: { ...params },
          url,
          timestamp: Date.now(),
        });
      },
    });
  });

  afterEach(() => {
    captured.length = 0;
  });

  it("events.spec.yaml ↔ src compliance", () => {
    const specPath = resolve(appRoot, "events.spec.yaml");
    const spec = loadSpecFromFile(specPath);
    const result = scanSourceCompliance(resolve(appRoot, "src"), spec);
    expect(result.ok).toBe(true);
  });

  it("상품 카드·장바구니 담기 이벤트 캡처", async () => {
    const spec = loadSpecFromFile(resolve(appRoot, "events.spec.yaml"));

    render(<ProductGrid products={[mockProduct]} />);
    fireEvent.click(screen.getByRole("link"));

    render(<AddToCartButton productId="gd-001" />);
    fireEvent.click(screen.getByRole("button", { name: "장바구니 담기" }));

    await waitFor(() => {
      expect(captured.length).toBeGreaterThanOrEqual(2);
    });

    const names = new Set(captured.map((c) => c.event_name));
    expect(names).toContain("product_card_click");
    expect(names).toContain("add_to_cart_click");

    const interactionSpec = spec.events.filter((e) =>
      ["product_card_click", "add_to_cart_click"].includes(e.event_name),
    );
    const result = validateCapturedAgainstSpec(captured, interactionSpec);
    expect(result.ok).toBe(true);
  });
});

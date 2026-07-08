"use client";

import { Button } from "@goodz/ui";
import { trackEvent } from "ga-analytics-harness/trackEvent";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({
  productId,
  redirectToCart = false,
}: {
  productId: string;
  redirectToCart?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      await addToCart(productId);
      trackEvent("add_to_cart_click", {
        page_path: `/products/${productId}`,
        component_name: "AddToCartButton",
      });
      setMessage("장바구니에 담았습니다");
      if (redirectToCart) {
        router.push("/cart");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "장바구니 담기에 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="primary"
        onClick={handleClick}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "담는 중…" : "장바구니 담기"}
      </Button>
      {message && (
        <p className="text-sm text-violet-700" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

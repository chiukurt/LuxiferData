var matomoLuxiSiteId = "1";
var matomoLuxiSampleSize = "100";
var _mtm = window._mtm = window._mtm || [];
var _paq = window._paq = window._paq || [];
_paq.push(['requireConsent']);

function pushLummmenCartEvent(a, cl) {
  const m = cl.merchandise ?? {};
  const p = {
    id: m.product?.id || "Unknown",
    title: m.product?.title || "Unknown",
    variant: m.title || "Unknown",
    type: m.product?.type || "Unknown",
    price: m.price?.amount || 0,
    count: cl.quantity || 1
  };
  window._paq.push(['trackEvent', 'Ecomm', a, JSON.stringify(p)]);
}

analytics.subscribe("checkout_completed", (event) => {
  const c = event.data.checkout;
  c.lineItems.forEach((li) =>
    window._paq.push(["addEcommerceItem",
      li.variant.id, li.title, li.variant.product.type,  li.variant.price.amount, li.quantity,
    ]),
  );
  
  window._paq.push(['trackEcommerceOrder',
    c.order.id, c.totalPrice.amount, c.subtotalPrice.amount, c.totalTax.amount, c.shippingLine.price.amount, 0,
  ]);
});

analytics.subscribe("product_added_to_cart", (event) => {
  pushLummmenCartEvent('AddToCart', event.data.cartLine);
});

analytics.subscribe("product_removed_from_cart", (event) => {
  pushLummmenCartEvent('RemoveFromCart', event.data.cartLine);
});

analytics.subscribe("product_viewed", ({ data, context }) => {
  const v = data.productVariant ?? {}, p = v.product ?? {};
  window._paq.push(["setEcommerceView",
    v.id || "Unknown", p.title || "Unknown", p.type || "Unknown", v.price?.amount ?? 0
  ]);
  window._paq.push(['setCustomUrl', context.window.location.href]);
  window._paq.push(['trackPageView']);
});

analytics.subscribe("collection_viewed", ({ data, context }) => {
  window._paq.push(['setEcommerceView', false, false, data.collection?.title ?? 'Unknown']);
  window._paq.push(['setCustomUrl', context.window.location.href]);
  window._paq.push(['trackPageView']);
});

(function() {
  var script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/gh/chiukurt/LuxiferData@1.4.00/shopify.min.js";
  script.integrity = "sha384-ilt76EKy86Zm6iYYfopn05yfYJO9uLf9+pOkuQCgBNJ7/Y97ebw3c6+hmAytf1wF";
  script.crossOrigin = "anonymous";
  script.async = true;
  document.head.appendChild(script);
})();

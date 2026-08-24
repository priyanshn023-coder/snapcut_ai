import React, { useEffect } from 'react';

type RazorpayCheckoutProps = {
  amount: number; // in INR (e.g., 199.99)
  currency?: string; // default INR
  name?: string; // business name
  description?: string;
  email?: string;
  contact?: string;
  // Optional: a server endpoint that creates an order and returns { id: string /*order_id*/ }
  createOrderEndpoint?: string;
  onSuccess?: (payload: any) => void;
  onError?: (err: any) => void;
};

const DEV_RAZORPAY_KEY = 'rzp_test_TTbcOSn72HCvBG';

function resolveRazorpayKey(): string | undefined {
  const configuredKey = import.meta.env.VITE_RAZORPAY_KEY;
  if (configuredKey && configuredKey.trim()) return configuredKey.trim();

  if (import.meta.env.DEV) {
    console.warn('VITE_RAZORPAY_KEY not configured. Using the bundled local test key for development only.');
    return DEV_RAZORPAY_KEY;
  }

  return undefined;
}

// Loads the Razorpay checkout script and returns a promise that resolves when loaded
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window is undefined'));
    if ((window as any).Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({ amount, currency = 'INR', name = 'SnapCut AI', description = 'Payment', email, contact, createOrderEndpoint, onSuccess, onError }: RazorpayCheckoutProps) {
  useEffect(() => {
    // Preload the script so the popup opens faster when user clicks
    loadRazorpayScript().catch(() => {
      // ignore preload failure; will surface during actual checkout
    });
  }, []);

  async function openCheckout() {
    try {
      await loadRazorpayScript();
    } catch (err) {
      onError?.(err);
      alert('Could not load payment gateway. Please try again later.');
      return;
    }

    const key = resolveRazorpayKey();
    if (!key) {
      const err = new Error('Razorpay key not configured. Set VITE_RAZORPAY_KEY in your environment.');
      onError?.(err);
      alert('Payment not configured. Contact the site administrator.');
      return;
    }

    // Razorpay expects amount in smallest currency unit (paise for INR)
    const amountPaise = Math.round(amount * 100);
    const orderEndpoint = createOrderEndpoint || (import.meta.env.DEV ? '/api/create-order' : undefined);

    let orderId: string | undefined;
    if (orderEndpoint) {
      try {
        const res = await fetch(orderEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountPaise, currency }),
        });
        if (!res.ok) throw new Error('Order creation failed');
        const data = await res.json();
        orderId = data?.id || data?.order_id || data?.orderId;
      } catch (err) {
        // If order creation fails, continue without orderId but inform developer
        console.warn('Order creation failed', err);
      }
    }

    const options: any = {
      key,
      amount: amountPaise,
      currency,
      name,
      description,
      prefill: { email, contact },
      theme: { color: '#5b2dff' },
      handler: function (response: any) {
        // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature (if order_id was used)
        onSuccess?.(response);
      },
      modal: {
        ondismiss: function () {
          // optional: do something when user closes the modal
        },
      },
    };

    if (orderId) options.order_id = orderId;

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      onError?.(err);
    }
  }

  return (
    <button onClick={openCheckout} className="button-primary">
      Pay {currency} {amount.toFixed(2)}
    </button>
  );
}

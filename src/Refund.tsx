import React from 'react';

export default function Refund() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <h1 className="section-heading">Refund & Cancellation</h1>
      <p className="mt-4 text-sm text-[#69738f]">Last updated: August 2026</p>
      <section className="mt-6">
        <h2 className="text-lg font-bold">Overview</h2>
        <p className="mt-2 text-sm text-[#6d7690]">At SnapCut AI we strive to ensure customer satisfaction. Refunds and cancellations are handled on a case-by-case basis. For payments processed via Razorpay, certain refund rules apply depending on the payment method.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Cancellation</h2>
        <p className="mt-2 text-sm text-[#6d7690]">If you wish to cancel a purchase, contact support@snapcut.ai with your order details. We will review and respond within 3 business days.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Refunds</h2>
        <p className="mt-2 text-sm text-[#6d7690]">Refunds may be issued at our discretion. For most payments, refunds are processed back to the original payment instrument and can take up to 7 business days depending on the bank or wallet provider.</p>
      </section>
    </main>
  );
}

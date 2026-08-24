import React from 'react';

export default function Terms() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <h1 className="section-heading">Terms & Conditions</h1>
      <p className="mt-4 text-sm text-[#69738f]">Last updated: August 2026</p>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Acceptance</h2>
        <p className="mt-2 text-sm text-[#6d7690]">By using SnapCut AI you agree to these terms. Please read them carefully.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Usage</h2>
        <p className="mt-2 text-sm text-[#6d7690]">You may use the service to process images in compliance with applicable law and our content rules.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Payments</h2>
        <p className="mt-2 text-sm text-[#6d7690]">Paid features are billed through our payment provider (Razorpay). Refunds and cancellations follow our Refund & Cancellation policy.</p>
      </section>
    </main>
  );
}

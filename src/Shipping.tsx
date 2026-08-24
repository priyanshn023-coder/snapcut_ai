import React from 'react';

export default function Shipping() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <h1 className="section-heading">Shipping & Delivery</h1>
      <p className="mt-4 text-sm text-[#69738f]">SnapCut AI delivers digital products (image downloads, credits) electronically — there is no physical shipping.</p>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Delivery</h2>
        <p className="mt-2 text-sm text-[#6d7690]">After a successful payment, downloadable assets and credits are delivered instantly via the website and to the email you provide. If you don't receive your download, check spam or contact support.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Processing times</h2>
        <p className="mt-2 text-sm text-[#6d7690]">Most purchases are processed immediately. In rare cases (bank delays, payment provider delays) fulfillment may take up to 24 hours.</p>
      </section>
    </main>
  );
}

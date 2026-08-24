import React from 'react';

export default function Privacy() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <h1 className="section-heading">Privacy Policy</h1>
      <p className="mt-4 text-sm text-[#69738f]">Last updated: August 2026</p>
      <section className="mt-6">
        <h2 className="text-lg font-bold">Introduction</h2>
        <p className="mt-2 text-sm text-[#6d7690]">SnapCut AI values your privacy. This policy explains what information we collect, how it is used, and your choices. Replace this content with your legally-reviewed privacy policy as needed.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Information We Collect</h2>
        <ul className="mt-2 list-disc pl-6 text-sm text-[#6d7690]">
          <li>Information you provide (email, contact) when signing up or purchasing.</li>
          <li>Image files uploaded for processing. We process images temporarily and do not store them long-term unless you opt in.</li>
          <li>Usage and analytics data to improve the service.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">How We Use Information</h2>
        <p className="mt-2 text-sm text-[#6d7690]">To process images, provide services, handle payments, send important updates, and improve our product.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Contact</h2>
        <p className="mt-2 text-sm text-[#6d7690]">For privacy questions, contact us at privacy@snapcut.ai</p>
      </section>
    </main>
  );
}

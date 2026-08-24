import React from 'react';

export default function Contact() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <h1 className="section-heading">Contact Us</h1>
      <p className="mt-4 text-sm text-[#69738f]">We're here to help — reach out anytime.</p>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Contact details</h2>
        <ul className="mt-2 list-none pl-0 text-sm text-[#6d7690]">
          <li><strong>Trade name:</strong> SnapCut AI</li>
          <li className="mt-2"><strong>Phone:</strong> +91 98765 43210</li>
          <li className="mt-2"><strong>Email:</strong> support@snapcut.ai</li>
          <li className="mt-2"><strong>Address:</strong> 123 Creative Ave, Suite 400, Bangalore, India</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Support</h2>
        <p className="mt-2 text-sm text-[#6d7690]">For billing or account issues, email billing@snapcut.ai. For general support, use support@snapcut.ai.</p>
      </section>
    </main>
  );
}

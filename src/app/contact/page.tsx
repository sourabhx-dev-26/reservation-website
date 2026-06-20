export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050507] px-6 py-12 text-[#fff8e7]">
      <section className="mx-auto max-w-3xl rounded-[32px] border border-[#d6b25e]/25 bg-white/[0.04] p-8">
        <p className="text-sm tracking-[0.35em] text-[#d6b25e]/70">DEMO RESTAURANT</p>
        <h1 className="mt-3 text-4xl font-black text-[#d6b25e]">Public Contact Details</h1>

        <div className="mt-8 space-y-5 text-white/75">
          <p><b>Business Name:</b> DEMO Restaurant Reservations</p>
          <p><b>Service:</b> Restaurant table, banquet, hall and event booking.</p>
          <p><b>Email:</b> support@demorestaurant.in</p>
          <p><b>Phone:</b> +91 90000 00000</p>
          <p><b>Address:</b> DEMO Restaurant, India</p>
          <p><b>Support Hours:</b> 10:00 AM to 10:00 PM</p>
        </div>
      </section>
    </main>
  );
}
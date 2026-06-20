export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050507] px-6 py-12 text-[#fff8e7]">
      <section className="mx-auto max-w-4xl rounded-[32px] border border-[#d6b25e]/25 bg-white/[0.04] p-8">
        <p className="text-sm tracking-[0.35em] text-[#d6b25e]/70">DEMO RESTAURANT</p>
        <h1 className="mt-3 text-4xl font-black text-[#d6b25e]">Terms and Conditions</h1>

        <div className="mt-8 space-y-5 leading-8 text-white/75">
          <p>All bookings submitted through this website are subject to availability and final confirmation by the restaurant reception team.</p>
          <p>Payment of the advance reservation amount does not guarantee final booking until the restaurant confirms the request.</p>
          <p>The restaurant may contact the customer using the submitted phone number for confirmation or booking updates.</p>
          <p>Customers must provide correct name, mobile number, date, time and guest count.</p>
          <p>For banquet, hall, birthday, function or private event booking, final pricing may vary depending on guest count, decoration, food package and event requirements.</p>
          <p>The restaurant reserves the right to reject, reschedule or cancel booking requests in case of unavailability, incorrect information or operational reasons.</p>
        </div>
      </section>
    </main>
  );
}
export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050507] px-6 py-12 text-[#fff8e7]">
      <section className="mx-auto max-w-4xl rounded-[32px] border border-[#d6b25e]/25 bg-white/[0.04] p-8">
        <p className="text-sm tracking-[0.35em] text-[#d6b25e]/70">DEMO RESTAURANT</p>
        <h1 className="mt-3 text-4xl font-black text-[#d6b25e]">Refund and Cancellation Policy</h1>

        <div className="mt-8 space-y-5 leading-8 text-white/75">
          <p>Reservation advance payments are collected to confirm genuine booking interest and reduce fake or no-show bookings.</p>
          <p>If the restaurant is unable to provide the requested table, room, banquet hall or event space, the customer may receive a refund or rescheduling option.</p>
          <p>If the customer cancels the booking, refund approval depends on restaurant policy, timing of cancellation and operational preparation already done.</p>
          <p>No-show bookings may not be eligible for refund.</p>
          <p>For banquet, hall, birthday, function and event bookings, cancellation and refund terms may vary depending on decoration, food preparation and event arrangements.</p>
          <p>Refunds, when approved, will be processed to the original payment method within the payment provider's standard processing timeline.</p>
        </div>
      </section>
    </main>
  );
}
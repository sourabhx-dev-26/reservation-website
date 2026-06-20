"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";

type BookingMode = "table" | "banquet";

type FormData = {
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  eventType: string;
  spaceType: string;
  requirements: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self" | "_blank" | "_top" | "_modal";
      }) => Promise<void>;
    };
  }
}

function loadCashfreeSdk() {
  return new Promise<void>((resolve, reject) => {
    if (window.Cashfree) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Cashfree SDK failed to load."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Cashfree SDK failed to load."));

    document.body.appendChild(script);
  });
}

const initialFormData: FormData = {
  customerName: "",
  phone: "+91 ",
  date: "",
  time: "",
  guests: "",
  eventType: "",
  spaceType: "",
  requirements: "",
};

export default function ReservationLanding() {
  const [bookingMode, setBookingMode] = useState<BookingMode>("table");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPaying, setIsPaying] = useState(false);

  const todayDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const selectedDay = useMemo(() => {
    if (!formData.date) return "";

    const [year, month, day] = formData.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
    });
  }, [formData.date]);

  const reservationAmount = bookingMode === "table" ? 299 : 1999;
  const reservationLabel = `₹${reservationAmount.toLocaleString("en-IN")}`;

  const modeTitle =
    bookingMode === "table" ? "Royal Table Reservation" : "Grand Event Booking";

  const modeDescription =
    bookingMode === "table"
      ? "Reserve a premium dining table with instant reception request."
      : "Book a private room, banquet hall or event space for celebrations.";

  const buttonText =
    bookingMode === "table"
      ? `Pay ${reservationLabel} & Request Table`
      : `Pay ${reservationLabel} & Request Hall`;

  const fieldClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-white outline-none placeholder:text-white/35 transition focus:border-[#d6b25e]/60 focus:bg-white/[0.08]";

  const errorClass = "mt-2 text-xs font-medium text-red-300/90";

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const handleNameChange = (value: string) => {
    const cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    updateField("customerName", cleanValue);
  };

  const handlePhoneChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "");
    const mobileDigits = onlyDigits.startsWith("91")
      ? onlyDigits.slice(2, 12)
      : onlyDigits.slice(0, 10);

    updateField("phone", `+91 ${mobileDigits}`);
  };

  const handleGuestsChange = (value: string) => {
    const maxDigits = bookingMode === "table" ? 2 : 3;
    const cleanValue = value.replace(/\D/g, "").slice(0, maxDigits);

    updateField("guests", cleanValue);
  };

  const getMobileDigits = () => {
    const onlyDigits = formData.phone.replace(/\D/g, "");

    if (onlyDigits.startsWith("91")) {
      return onlyDigits.slice(2);
    }

    return onlyDigits;
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const mobileDigits = getMobileDigits();
    const guestCount = Number(formData.guests);

    if (formData.customerName.trim().length < 2) {
      nextErrors.customerName = "Enter a valid customer name.";
    }

    if (mobileDigits.length !== 10) {
      nextErrors.phone = "Enter a valid 10 digit mobile number.";
    }

    if (!formData.date) {
      nextErrors.date = "Select reservation date.";
    } else if (formData.date < todayDate) {
      nextErrors.date = "Past date is not allowed.";
    }

    if (!formData.time) {
      nextErrors.time = "Select reservation time.";
    }

    if (!formData.guests || guestCount <= 0) {
      nextErrors.guests = "Enter number of guests.";
    } else if (bookingMode === "table" && guestCount > 20) {
      nextErrors.guests = "For more than 20 guests, choose hall booking.";
    } else if (bookingMode === "banquet" && guestCount > 300) {
      nextErrors.guests = "Maximum 300 guests allowed for request.";
    }

    if (bookingMode === "banquet" && !formData.eventType) {
      nextErrors.eventType = "Select event type.";
    }

    if (bookingMode === "banquet" && !formData.spaceType) {
      nextErrors.spaceType = "Select space type.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsPaying(true);

      const response = await fetch("/api/create-cashfree-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: reservationAmount,
          customerName: formData.customerName,
          customerPhone: formData.phone,
          bookingType: bookingMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cashfree order error:", data);
        alert(data.error || "Payment order creation failed.");
        return;
      }

      const paymentSessionId = data.paymentSessionId;

      if (!paymentSessionId) {
        console.error("Missing payment session:", data);
        alert("Payment session not received from Cashfree.");
        return;
      }

      await loadCashfreeSdk();

      if (!window.Cashfree) {
        alert("Cashfree SDK not loaded. Please refresh and try again.");
        return;
      }

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const switchMode = (mode: BookingMode) => {
    setBookingMode(mode);
    setErrors({});
    setIsPaying(false);

    setFormData((current) => ({
      ...current,
      guests: "",
      eventType: "",
      spaceType: "",
      requirements: "",
    }));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#030305] text-[#fff8e7]">
      <section className="relative min-h-screen px-4 py-5 sm:px-6 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(214,178,94,0.25),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(248,220,143,0.12),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(214,178,94,0.10),transparent_42%),linear-gradient(135deg,#050507,#0b0b12_45%,#020203)]" />

        <div className="pointer-events-none absolute left-[-120px] top-24 h-72 w-72 rounded-full bg-[#d6b25e]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-160px] top-1/2 h-96 w-96 rounded-full bg-[#f8dc8f]/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d6b25e]/40 bg-[#d6b25e]/10 text-[#d6b25e] shadow-[0_0_35px_rgba(214,178,94,0.22)]">
              ✦
            </div>

            <div>
              <p className="text-xs tracking-[0.35em] text-[#d6b25e]/70">
                DEMO
              </p>
              <h1 className="text-lg font-black">Luxury Reservations</h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/55 backdrop-blur-xl sm:block"
          >
            Table • Banquet • Private Events
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl grid-cols-1 items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_520px]">
          <motion.div
            initial={{ opacity: 0, y: 38 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <div className="mb-5 inline-flex rounded-full border border-[#d6b25e]/25 bg-[#d6b25e]/10 px-4 py-2 text-sm text-[#f8dc8f] shadow-[0_0_35px_rgba(214,178,94,0.14)]">
              Premium Reservation Experience
            </div>

            <h2 className="max-w-4xl text-[3.05rem] font-black leading-[0.9] tracking-[-0.06em] sm:text-6xl md:text-8xl">
              {bookingMode === "table" ? (
                <>
                  Reserve Your
                  <br />
                  <span className="text-[#d6b25e] drop-shadow-[0_0_35px_rgba(214,178,94,0.35)]">
                    Royal Table
                  </span>
                </>
              ) : (
                <>
                  Celebrate In
                  <br />
                  <span className="text-[#d6b25e] drop-shadow-[0_0_35px_rgba(214,178,94,0.35)]">
                    Grand Style
                  </span>
                </>
              )}
            </h2>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#b9ad93]">
              {modeDescription} Your request will reach reception as pending
              confirmation, then staff can confirm availability.
            </p>

            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[#d6b25e]/20 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.22)]">
                <p className="text-3xl font-black text-[#f8dc8f]">
                  {reservationLabel}
                </p>
                <p className="mt-2 text-xs text-white/45">Advance Amount</p>
              </div>

              <div className="rounded-3xl border border-[#d6b25e]/20 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.22)]">
                <p className="text-3xl font-black text-[#f8dc8f]">Live</p>
                <p className="mt-2 text-xs text-white/45">Reception Sync</p>
              </div>

              <div className="rounded-3xl border border-[#d6b25e]/20 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.22)]">
                <p className="text-3xl font-black text-[#f8dc8f]">VIP</p>
                <p className="mt-2 text-xs text-white/45">Priority Request</p>
              </div>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => switchMode("table")}
                className={`rounded-[28px] border p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 ${
                  bookingMode === "table"
                    ? "border-[#d6b25e]/50 bg-[#d6b25e]/15 shadow-[0_0_45px_rgba(214,178,94,0.18)]"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <p className="text-2xl">🍽️</p>
                <h3 className="mt-3 text-xl font-black text-[#fff8e7]">
                  Table Booking
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  Dinner, lunch, family dining, date night and VIP seating.
                </p>
              </button>

              <button
                type="button"
                onClick={() => switchMode("banquet")}
                className={`rounded-[28px] border p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 ${
                  bookingMode === "banquet"
                    ? "border-[#d6b25e]/50 bg-[#d6b25e]/15 shadow-[0_0_45px_rgba(214,178,94,0.18)]"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <p className="text-2xl">🏛️</p>
                <h3 className="mt-3 text-xl font-black text-[#fff8e7]">
                  Banquet / Hall Booking
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  Birthdays, functions, parties, corporate dinners and events.
                </p>
              </button>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 42, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85 }}
            className="relative overflow-hidden rounded-[30px] border border-[#d6b25e]/25 bg-black/45 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.62)] backdrop-blur-2xl sm:rounded-[40px] sm:p-6"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f8dc8f]/70 to-transparent" />
            <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-48 w-48 rounded-full bg-[#d6b25e]/10 blur-3xl" />

            <div className="mb-6">
              <p className="text-sm tracking-[0.3em] text-[#d6b25e]/70">
                {bookingMode === "table" ? "BOOK A TABLE" : "BOOK AN EVENT"}
              </p>
              <h3 className="mt-2 text-3xl font-black">{modeTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-white/40">
                Fill the details below. Payment will start after validation.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-2">
              <button
                type="button"
                onClick={() => switchMode("table")}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  bookingMode === "table"
                    ? "bg-gradient-to-r from-[#f8dc8f] via-[#d6b25e] to-[#9e6f28] text-black"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Table
              </button>

              <button
                type="button"
                onClick={() => switchMode("banquet")}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  bookingMode === "banquet"
                    ? "bg-gradient-to-r from-[#f8dc8f] via-[#d6b25e] to-[#9e6f28] text-black"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Hall / Room
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="text"
                  value={formData.customerName}
                  className={fieldClass}
                  placeholder="Customer Name"
                  onChange={(event) => handleNameChange(event.target.value)}
                />
                {errors.customerName && (
                  <p className={errorClass}>{errors.customerName}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  maxLength={14}
                  className={fieldClass}
                  placeholder="Phone number"
                  onFocus={() => {
                    if (!formData.phone.startsWith("+91 ")) {
                      updateField("phone", "+91 ");
                    }
                  }}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-[#f8dc8f]/45">
                      Reservation Date
                    </label>

                    <input
                      type="date"
                      min={todayDate}
                      value={formData.date}
                      onChange={(event) =>
                        updateField("date", event.target.value)
                      }
                      className="h-[58px] w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-[15px] font-black uppercase tracking-[0.06em] text-white outline-none [color-scheme:dark] transition focus:border-[#d6b25e]/60 focus:bg-white/[0.08] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80"
                    />

                    {errors.date && (
                      <p className={errorClass}>{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-[#f8dc8f]/45">
                      Day
                    </label>

                    <input
                      type="text"
                      value={selectedDay}
                      readOnly
                      placeholder="Day"
                      className="h-[58px] w-full rounded-2xl border border-[#d6b25e]/25 bg-[#d6b25e]/10 px-3 text-center text-sm font-black tracking-[0.04em] text-[#f8dc8f] outline-none placeholder:text-[#f8dc8f]/45"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-[#f8dc8f]/45">
                    Arrival Time
                  </label>

                  <input
                    type="time"
                    step={60}
                    value={formData.time}
                    onChange={(event) =>
                      updateField("time", event.target.value)
                    }
                    className="h-[58px] w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-[15px] font-black tracking-[0.06em] text-white outline-none [color-scheme:dark] transition focus:border-[#d6b25e]/60 focus:bg-white/[0.08]"
                  />

                  {errors.time && (
                    <p className={errorClass}>{errors.time}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.guests}
                  maxLength={bookingMode === "table" ? 2 : 3}
                  className={fieldClass}
                  placeholder={
                    bookingMode === "table"
                      ? "Number of guests"
                      : "Expected guests / crowd size"
                  }
                  onChange={(event) => handleGuestsChange(event.target.value)}
                />
                {errors.guests && (
                  <p className={errorClass}>{errors.guests}</p>
                )}
              </div>

              {bookingMode === "banquet" && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <select
                      value={formData.eventType}
                      onChange={(event) =>
                        updateField("eventType", event.target.value)
                      }
                      className={`${fieldClass} [color-scheme:dark] [&>option]:bg-[#050507]`}
                    >
                      <option value="">Select event type</option>
                      <option>Birthday Party</option>
                      <option>Family Function</option>
                      <option>Engagement / Ring Ceremony</option>
                      <option>Corporate Dinner</option>
                      <option>Anniversary Celebration</option>
                      <option>Private Gathering</option>
                      <option>Other Event</option>
                    </select>
                    {errors.eventType && (
                      <p className={errorClass}>{errors.eventType}</p>
                    )}
                  </div>

                  <div>
                    <select
                      value={formData.spaceType}
                      onChange={(event) =>
                        updateField("spaceType", event.target.value)
                      }
                      className={`${fieldClass} [color-scheme:dark] [&>option]:bg-[#050507]`}
                    >
                      <option value="">Select space type</option>
                      <option>Private Dining Room</option>
                      <option>Banquet Hall</option>
                      <option>Rooftop Setup</option>
                      <option>Premium Lounge</option>
                      <option>Full Restaurant Booking</option>
                    </select>
                    {errors.spaceType && (
                      <p className={errorClass}>{errors.spaceType}</p>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(event) =>
                      updateField("requirements", event.target.value)
                    }
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-white outline-none placeholder:text-white/35 transition focus:border-[#d6b25e]/60 focus:bg-white/[0.08]"
                    placeholder="Special requirements: decoration, cake table, music, buffet, projector..."
                  />
                </motion.div>
              )}

              <div className="rounded-3xl border border-[#d6b25e]/20 bg-[#d6b25e]/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.25em] text-[#f8dc8f]/55">
                      ADVANCE AMOUNT
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#f8dc8f]">
                      {reservationLabel}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      Adjustable as per restaurant policy
                    </p>
                  </div>

                  <div className="rounded-full border border-[#d6b25e]/25 bg-black/30 px-4 py-2 text-xs font-bold text-[#f8dc8f]/70">
                    Pending
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPaying}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#f8dc8f] via-[#d6b25e] to-[#9e6f28] px-6 py-5 font-black text-black shadow-[0_20px_70px_rgba(214,178,94,0.26)] transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPaying ? "Starting Secure Payment..." : buttonText}
              </button>

              <p className="text-center text-xs leading-6 text-white/40">
                Your request will reflect in reception after payment and will be
                confirmed manually by restaurant staff.
              </p>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
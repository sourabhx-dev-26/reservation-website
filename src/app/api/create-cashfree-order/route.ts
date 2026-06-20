import { NextResponse } from "next/server";

type CreateOrderBody = {
  amount: number;
  customerName: string;
  customerPhone: string;
  bookingType: "table" | "banquet";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const cashfreeEnv = process.env.CASHFREE_ENV || "sandbox";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Cashfree keys are missing in environment variables." },
        { status: 500 }
      );
    }

    if (!body.amount || !body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { error: "Missing required booking/payment details." },
        { status: 400 }
      );
    }

    const cleanPhone = body.customerPhone.replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid customer phone number." },
        { status: 400 }
      );
    }

    const orderId = `RES_${Date.now()}`;
    const baseUrl =
      cashfreeEnv === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const cashfreeResponse = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": "2025-01-01",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: body.amount,
        order_currency: "INR",
        customer_details: {
          customer_id: `CUST_${Date.now()}`,
          customer_name: body.customerName,
          customer_email: "customer@example.com",
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: `${siteUrl}/payment-status?order_id={order_id}`,
        },
        order_note:
          body.bookingType === "table"
            ? "Restaurant table reservation advance payment"
            : "Banquet hall / event booking advance payment",
      }),
    });

    const data = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      return NextResponse.json(
        {
          error: "Cashfree order creation failed.",
          details: data,
        },
        { status: cashfreeResponse.status }
      );
    }

    return NextResponse.json({
      orderId,
      paymentSessionId: data.payment_session_id || data.payment_sessions_id,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Something went wrong while creating Cashfree order.",
      },
      { status: 500 }
    );
  }
}
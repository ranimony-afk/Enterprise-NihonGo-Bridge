import { NextResponse } from "next/server";

// ------------------------------------------------------------------
// GET: Generate Compliant B2C/B2B Tax Invoice
// ------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const amount = parseFloat(searchParams.get("amount") || "1000");
    const currency = searchParams.get("currency")?.toUpperCase() || "INR";
    const userEmail = searchParams.get("email") || "learner@nihongobridge.com";
    const couponCode = searchParams.get("coupon") || null;

    // Billing math
    let discount = 0;
    if (couponCode) {
      discount = amount * 0.1; // 10% coupon discount
    }
    const netPaid = amount - discount;

    // GST Tax calculation (Only applicable for INR billing)
    const isInr = currency === "INR";
    const basePrice = isInr ? parseFloat((netPaid / 1.18).toFixed(2)) : netPaid;
    const gstAmount = isInr ? parseFloat((netPaid - basePrice).toFixed(2)) : 0;
    const cgst = isInr ? parseFloat((gstAmount / 2).toFixed(2)) : 0;
    const sgst = isInr ? parseFloat((gstAmount / 2).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      invoiceNumber: invoiceId,
      issuedAt: new Date().toISOString(),
      recipient: {
        email: userEmail,
        country: isInr ? "India" : "International"
      },
      lineItems: [
        {
          description: "Nihongo Bridge Premium Lifetime Access (LMS + Spaced Repetition + AI Shadowing)",
          quantity: 1,
          unitPrice: amount,
          totalPrice: amount
        }
      ],
      discounts: couponCode ? [{ code: couponCode, amount: discount }] : [],
      taxBreakdown: {
        isTaxable: isInr,
        taxType: isInr ? "Indian GST (18%)" : "VAT Exempt / Export",
        baseAmount: basePrice,
        appliedCgst_9: cgst,
        appliedSgst_9: sgst,
        totalTaxAmount: gstAmount
      },
      netTotalPaid: netPaid,
      currency: currency,
      paymentStatus: "PAID",
      corporateGstin: isInr ? "33AAAAA0000A1Z1 (Nihongo Bridge India)" : null,
      notes: "Thank you for supporting Nihongo Bridge! This invoice acts as a valid proof of purchase."
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

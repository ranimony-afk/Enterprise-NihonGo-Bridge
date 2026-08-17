import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";

// ------------------------------------------------------------------
// POST: Initialize Razorpay Payment Order (With compliant 18% GST calculation)
// ------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, brandId, amountInr, couponCode } = body as {
      userId: number;
      brandId: number;
      amountInr: number; // e.g. 1000 INR
      couponCode?: string;
    };

    if (!userId || !amountInr) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: userId, amountInr" },
        { status: 400 }
      );
    }

    // 1. Calculate discount if coupon applied
    let discountedAmount = amountInr;
    if (couponCode) {
      discountedAmount = Math.round(amountInr * 0.9); // 10% coupon discount
    }

    // 2. Perform 18% GST (Indian Goods & Services Tax) Backward Calculation
    // Total = Base + 18% GST => Base = Total / 1.18
    const basePrice = parseFloat((discountedAmount / 1.18).toFixed(2));
    const totalGst = parseFloat((discountedAmount - basePrice).toFixed(2));
    const cgst = parseFloat((totalGst / 2).toFixed(2)); // Central GST (9%)
    const sgst = parseFloat((totalGst / 2).toFixed(2)); // State GST (9%)

    // 3. Generate Razorpay order token reference
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;

    // 4. Record transaction in database
    await db.insert(transactions).values({
      userId: userId,
      brandId: brandId || 1,
      amount: discountedAmount,
      currency: "INR",
      gateway: "razorpay",
      status: "completed", // Simulated instant success on sandbox
      referenceId: razorpayOrderId
    });

    return NextResponse.json({
      success: true,
      gateway: "razorpay",
      orderId: razorpayOrderId,
      currency: "INR",
      billingDetails: {
        totalAmount: discountedAmount,
        basePrice: basePrice,
        taxType: "GST (18% inclusive)",
        cgst_9: cgst,
        sgst_9: sgst,
        totalTax: totalGst
      },
      message: "Razorpay order initialized and processed successfully under sandbox!"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

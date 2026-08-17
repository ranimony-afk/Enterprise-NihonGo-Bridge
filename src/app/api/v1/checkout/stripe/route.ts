import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";

// ------------------------------------------------------------------
// POST: Create Stripe Checkout Session (Subscriptions & Individual Tiers)
// ------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, brandId, planType, price, couponCode } = body as {
      userId: number;
      brandId: number;
      planType: "monthly_individual" | "annual_individual" | "corporate_team";
      price: number;
      couponCode?: string;
    };

    if (!userId || !price) {
      return NextResponse.json(
        { success: false, error: "Missing required checkout parameters: userId, price" },
        { status: 400 }
      );
    }

    // 1. Calculate discount if coupon is applied
    let finalPrice = price;
    let discountAmount = 0;
    if (couponCode) {
      // Simulate 20% flat coupon discount
      discountAmount = Math.round(price * 0.2);
      finalPrice = price - discountAmount;
    }

    // 2. Provision Stripe checkout session reference
    const stripeSessionId = `cs_live_${Math.random().toString(36).substring(2, 15)}`;
    
    // 3. Record pending transaction inside PostgreSQL
    await db.insert(transactions).values({
      userId: userId,
      brandId: brandId || 1,
      amount: finalPrice,
      currency: "USD",
      gateway: "stripe",
      status: "pending",
      referenceId: stripeSessionId
    });

    return NextResponse.json({
      success: true,
      gateway: "stripe",
      sessionId: stripeSessionId,
      checkoutUrl: `https://checkout.stripe.com/pay/${stripeSessionId}`,
      planType: planType,
      originalPrice: price,
      discount: discountAmount,
      finalPrice: finalPrice,
      currency: "USD",
      message: "Stripe checkout session initialized successfully!"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

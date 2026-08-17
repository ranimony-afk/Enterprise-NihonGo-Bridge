import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// ------------------------------------------------------------------
// GET: Validate Billing Coupons & Student Referral Codes
// ------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.toUpperCase().trim();
    const brandIdStr = searchParams.get("brandId");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon or referral code is required" },
        { status: 400 }
      );
    }

    const brandId = brandIdStr ? parseInt(brandIdStr) : 1;

    // 1. Check for database-driven coupons
    const matchedCoupon = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code), eq(coupons.brandId, brandId)))
      .limit(1);

    if (matchedCoupon.length > 0) {
      const coupon = matchedCoupon[0];
      if (!coupon.active) {
        return NextResponse.json({ success: false, error: "Coupon code is inactive" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        type: "coupon",
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        message: `Applied coupon ${coupon.code} successfully! (${coupon.discountPercent}% OFF)`
      });
    }

    // 2. Check for organic Student Referral / Affiliate Codes (Takoboto-Style fallback logic)
    if (code.startsWith("REFER-") || code.startsWith("AFFILIATE-")) {
      const isAffiliate = code.startsWith("AFFILIATE-");
      return NextResponse.json({
        success: true,
        type: isAffiliate ? "affiliate" : "referral",
        code: code,
        discountPercent: isAffiliate ? 15 : 10, // 15% for affiliates, 10% for student referrals
        payoutReward: isAffiliate ? "20% Cash Commission" : "100 Study XP + $10 Credit",
        message: isAffiliate 
          ? `Applied affiliate partner commission code! (15% OFF for you, 20% commission for partner)`
          : `Applied student referral code! (10% OFF for you, $10 credit + 100 XP for your friend)`
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid coupon or referral code specified" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

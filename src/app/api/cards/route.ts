import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const cards = await prisma.card.findMany({
            where: { userId },
            orderBy: { nickname: "asc" },
        });
        return NextResponse.json(cards);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        // Basic validation
        if (!body.nickname) {
            return NextResponse.json({ error: "Nickname is required" }, { status: 400 });
        }

        // Business Logic Validation for Fee Waived vs Negotiated
        if (body.annualFeeWaived && body.annualFeeNegotiated) {
            return NextResponse.json({ error: "Cannot be both waived and negotiated" }, { status: 400 });
        }

        const card = await prisma.card.create({
            data: {
                userId,
                nickname: body.nickname,
                issuer: body.issuer,
                network: body.network,
                pointsProgram: body.pointsProgram,
                last4: body.last4,
                annualFeeAmount: body.annualFeeAmount,
                annualFeeWaived: body.annualFeeWaived,
                annualFeeNegotiated: body.annualFeeNegotiated,
                negotiatedSavingsAmount: body.annualFeeWaived ? undefined : body.negotiatedSavingsAmount,
                negotiatedNewFeeAmount: body.annualFeeWaived ? 0 : body.negotiatedNewFeeAmount,
                nextAnnualFeeDate: body.nextAnnualFeeDate ? new Date(body.nextAnnualFeeDate) : null,
                statementCloseDate: body.statementCloseDate ? parseInt(body.statementCloseDate, 10) : null,
                paymentDueDate: body.paymentDueDate ? parseInt(body.paymentDueDate, 10) : null,
                creditLimit: body.creditLimit,
                status: body.status || "Active",
                retentionMethod: body.retentionMethod,
                notes: body.notes,
                openedDate: body.openedDate ? new Date(body.openedDate) : null,
                tradelineHistory: body.tradelineHistory,
                credits: body.credits,
                welcomeBonus: body.welcomeBonus,
                chase524Status: body.chase524Status || false,
            },
        });

        return NextResponse.json(card, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "A card with this nickname already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create card", details: error.message }, { status: 500 });
    }
}

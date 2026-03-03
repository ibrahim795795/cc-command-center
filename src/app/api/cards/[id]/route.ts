import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;
        const card = await prisma.card.findFirst({
            where: { id, userId },
            include: { documents: true, bonuses: true }
        });
        if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
        return NextResponse.json(card);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.card.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Forbidden", { status: 403 });

        const body = await request.json();

        if (body.annualFeeWaived && body.annualFeeNegotiated) {
            return NextResponse.json({ error: "Cannot be both waived and negotiated" }, { status: 400 });
        }

        const card = await prisma.card.update({
            where: { id },
            data: {
                nickname: body.nickname,
                issuer: body.issuer,
                network: body.network,
                pointsProgram: body.pointsProgram,
                last4: body.last4,
                annualFeeAmount: body.annualFeeAmount,
                annualFeeWaived: body.annualFeeWaived,
                annualFeeNegotiated: body.annualFeeNegotiated,
                negotiatedSavingsAmount: body.annualFeeWaived ? null : body.negotiatedSavingsAmount,
                negotiatedNewFeeAmount: body.annualFeeWaived ? 0 : body.negotiatedNewFeeAmount,
                nextAnnualFeeDate: body.nextAnnualFeeDate ? new Date(body.nextAnnualFeeDate) : null,
                statementCloseDate: body.statementCloseDate ? parseInt(body.statementCloseDate, 10) : null,
                paymentDueDate: body.paymentDueDate ? parseInt(body.paymentDueDate, 10) : null,
                creditLimit: body.creditLimit,
                status: body.status,
                retentionMethod: body.retentionMethod,
                notes: body.notes,
                openedDate: body.openedDate ? new Date(body.openedDate) : null,
                tradelineHistory: body.tradelineHistory,
                credits: body.credits,
                welcomeBonus: body.welcomeBonus,
                chase524Status: body.chase524Status ?? false,
            },
        });

        return NextResponse.json(card);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update card", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.card.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Forbidden", { status: 403 });

        await prisma.card.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
    }
}

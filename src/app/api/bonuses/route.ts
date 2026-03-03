import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const bonuses = await prisma.bonus.findMany({
            where: { userId },
            include: { card: { select: { nickname: true } } },
            orderBy: { spendDeadlineDate: "asc" }
        });
        return NextResponse.json(bonuses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bonuses" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await request.json();

        if (!body.cardId || !body.offerName) {
            return NextResponse.json({ error: "Card and Offer Name are required" }, { status: 400 });
        }

        // Security check: Verify card ownership first
        const existingCard = await prisma.card.findFirst({ where: { id: body.cardId, userId } });
        if (!existingCard) return new NextResponse("Forbidden", { status: 403 });

        const bonus = await prisma.bonus.create({
            data: {
                userId,
                cardId: body.cardId,
                offerName: body.offerName,
                minSpendAmount: body.minSpendAmount ? Number(body.minSpendAmount) : null,
                spendDeadlineDate: body.spendDeadlineDate ? new Date(body.spendDeadlineDate) : null,
                currentSpendProgress: body.currentSpendProgress ? Number(body.currentSpendProgress) : 0,
                bonusExpected: body.bonusExpected ? Number(body.bonusExpected) : null,
                bonusPosted: body.bonusPosted || false,
                postedDate: body.postedDate ? new Date(body.postedDate) : null,
                statusPipeline: body.statusPipeline || "In progress",
            },
        });

        return NextResponse.json(bonus, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to create bonus", details: error.message }, { status: 500 });
    }
}

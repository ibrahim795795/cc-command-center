import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { addMonths, startOfDay } from "date-fns";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const existingCard = await prisma.card.findFirst({ where: { userId } });
        if (existingCard) {
            return NextResponse.json({ error: "User already has data" }, { status: 400 });
        }

        const today = startOfDay(new Date());

        // Create Dummy Cards
        const card1 = await prisma.card.create({
            data: {
                userId,
                nickname: "Amex Plat / Ibrahim",
                issuer: "American Express",
                network: "Amex",
                pointsProgram: "Amex MR",
                last4: "8271",
                annualFeeAmount: 699,
                annualFeeWaived: false,
                annualFeeNegotiated: true,
                negotiatedSavingsAmount: 200,
                negotiatedNewFeeAmount: 499,
                nextAnnualFeeDate: addMonths(today, 2),
                statementCloseDate: 15,
                paymentDueDate: 5,
                creditLimit: null,
            }
        });

        const card2 = await prisma.card.create({
            data: {
                userId,
                nickname: "Aeroplan Reserve",
                issuer: "TD",
                network: "Visa",
                pointsProgram: "Aeroplan",
                last4: "4921",
                annualFeeAmount: 599,
                annualFeeWaived: true,
                annualFeeNegotiated: false,
                negotiatedNewFeeAmount: 0,
                nextAnnualFeeDate: addMonths(today, 8),
                statementCloseDate: 22,
                paymentDueDate: 12,
                creditLimit: 15000,
            }
        });

        const card3 = await prisma.card.create({
            data: {
                userId,
                nickname: "Cobalt Daily",
                issuer: "American Express",
                network: "Amex",
                pointsProgram: "Amex MR",
                last4: "1192",
                annualFeeAmount: 156,
                annualFeeWaived: false,
                annualFeeNegotiated: false,
                negotiatedNewFeeAmount: 156,
                nextAnnualFeeDate: addMonths(today, 1),
                statementCloseDate: 5,
                paymentDueDate: 25,
                creditLimit: 12000,
            }
        });

        // Create Bonuses
        await prisma.bonus.create({
            data: {
                userId,
                cardId: card1.id,
                offerName: "150k MR / $10k Spend",
                minSpendAmount: 10000,
                spendDeadlineDate: addMonths(today, 3),
                currentSpendProgress: 6500,
                bonusExpected: 150000,
                bonusPosted: false,
                statusPipeline: "In progress",
            }
        });

        // Create Points
        await prisma.pointsBalance.createMany({
            data: [
                { userId, program: "Amex MR", balance: 185000 },
                { userId, program: "Aeroplan", balance: 342500 },
                { userId, program: "Marriott Bonvoy", balance: 85000 },
                { userId, program: "Avion", balance: 45000 }
            ]
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to seed data", details: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMonths, startOfDay } from "date-fns";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const cards = await prisma.card.findMany({
            where: { status: "Active", userId }
        });

        const timeline: any[] = [];
        const now = startOfDay(new Date());
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        cards.forEach(card => {
            // Annual Fee Date (just the upcoming one if it's within the next year)
            if (card.nextAnnualFeeDate && !card.annualFeeWaived) {
                timeline.push({
                    id: `af-${card.id}`,
                    cardId: card.id,
                    cardName: card.nickname,
                    type: "Annual Fee",
                    date: new Date(card.nextAnnualFeeDate),
                    amount: card.annualFeeNegotiated ? card.negotiatedNewFeeAmount : card.annualFeeAmount,
                });
            }

            // Statement Close Dates (next 3 occurrences)
            if (card.statementCloseDate) {
                for (let i = 0; i < 4; i++) {
                    let stmtDate = new Date(currentYear, currentMonth + i, card.statementCloseDate);
                    if (stmtDate >= now) {
                        timeline.push({
                            id: `stmt-${card.id}-${stmtDate.getTime()}`,
                            cardId: card.id,
                            cardName: card.nickname,
                            type: "Statement Close",
                            date: stmtDate,
                        });
                    }
                }
            }

            // Payment Due Dates (next 3 occurrences)
            if (card.paymentDueDate) {
                for (let i = 0; i < 4; i++) {
                    let dueDate = new Date(currentYear, currentMonth + i, card.paymentDueDate);
                    if (dueDate >= now) {
                        timeline.push({
                            id: `due-${card.id}-${dueDate.getTime()}`,
                            cardId: card.id,
                            cardName: card.nickname,
                            type: "Payment Due",
                            date: dueDate,
                        });
                    }
                }
            }
        });

        // Bonuses
        const bonuses = await prisma.bonus.findMany({
            where: { bonusPosted: false, spendDeadlineDate: { not: null }, userId },
            include: { card: true }
        });

        bonuses.forEach(bonus => {
            if (bonus.spendDeadlineDate) {
                timeline.push({
                    id: `bonus-${bonus.id}`,
                    cardId: bonus.cardId,
                    cardName: bonus.card.nickname,
                    type: "Min Spend Deadline",
                    date: new Date(bonus.spendDeadlineDate),
                    amount: bonus.minSpendAmount,
                });
            }
        });

        // Tasks / Apply Events
        const tasks = await prisma.cardTask.findMany({
            where: { completed: false, dueDate: { not: null }, userId },
            include: { card: true }
        });

        tasks.forEach(task => {
            if (task.dueDate) {
                const isApply = task.title.toLowerCase().includes("apply");
                timeline.push({
                    id: `task-${task.id}`,
                    cardId: task.cardId,
                    cardName: task.card.nickname,
                    type: isApply ? "Apply" : "Task Reminder",
                    date: new Date(task.dueDate),
                    details: task.title
                });
            }
        });

        // Sort timeline by date ascending
        timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

        return NextResponse.json(timeline);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
    }
}

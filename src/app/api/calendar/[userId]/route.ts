import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, startOfDay } from "date-fns";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        if (!userId) {
            return new NextResponse("User ID required", { status: 400 });
        }

        // Fetch all cards and bonuses for this user, similar to the Timeline API
        const cards = await prisma.card.findMany({
            where: { status: "Active", userId }
        });

        const events: string[] = [];
        const now = startOfDay(new Date());
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const formatIcsDate = (date: Date) => {
            return format(date, "yyyyMMdd");
        };

        const addEvent = (uid: string, date: Date, summary: string, description: string) => {
            events.push(
                "BEGIN:VEVENT",
                `UID:${uid}@walletos.app`,
                `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
                `DTSTART;VALUE=DATE:${formatIcsDate(date)}`,
                `SUMMARY:${summary}`,
                `DESCRIPTION:${description}`,
                "END:VEVENT"
            );
        };

        // 1. Annual Fees
        cards.forEach(card => {
            if (card.nextAnnualFeeDate && !card.annualFeeWaived) {
                const amount = card.annualFeeNegotiated ? card.negotiatedNewFeeAmount : card.annualFeeAmount;
                addEvent(
                    `af-${card.id}`,
                    new Date(card.nextAnnualFeeDate),
                    `💳 Annual Fee: ${card.nickname}`,
                    `Fee: $${amount}`
                );
            }

            // 2. Statement Close Dates (next 2 months)
            if (card.statementCloseDate) {
                for (let i = 0; i < 2; i++) {
                    const stmtDate = new Date(currentYear, currentMonth + i, card.statementCloseDate);
                    if (stmtDate >= now) {
                        addEvent(
                            `stmt-${card.id}-${stmtDate.getTime()}`,
                            stmtDate,
                            `📄 Statement Close: ${card.nickname}`,
                            "Your statement closes today."
                        );
                    }
                }
            }

            // 3. Payment Due Dates (next 2 months)
            if (card.paymentDueDate) {
                for (let i = 0; i < 2; i++) {
                    const dueDate = new Date(currentYear, currentMonth + i, card.paymentDueDate);
                    if (dueDate >= now) {
                        addEvent(
                            `due-${card.id}-${dueDate.getTime()}`,
                            dueDate,
                            `💰 Payment Due: ${card.nickname}`,
                            "Your credit card payment is due today."
                        );
                    }
                }
            }
        });

        // 4. Bonuses
        const bonuses = await prisma.bonus.findMany({
            where: { bonusPosted: false, spendDeadlineDate: { not: null }, userId },
            include: { card: true }
        });

        bonuses.forEach(bonus => {
            if (bonus.spendDeadlineDate) {
                addEvent(
                    `bonus-${bonus.id}`,
                    new Date(bonus.spendDeadlineDate),
                    `🎯 Min Spend Deadline: ${bonus.card.nickname}`,
                    `Spend required: $${bonus.minSpendAmount}\nOffer: ${bonus.offerName}`
                );
            }
        });

        // 5. Tasks & Apply Events
        const tasks = await prisma.cardTask.findMany({
            where: { completed: false, dueDate: { not: null }, userId },
            include: { card: true }
        });

        tasks.forEach(task => {
            if (task.dueDate) {
                const isApply = task.title.toLowerCase().includes("apply");
                addEvent(
                    `task-${task.id}`,
                    new Date(task.dueDate),
                    `${isApply ? '📝 Apply for' : '✅ Task'}: ${task.card.nickname}`,
                    task.title
                );
            }
        });

        const vcalendar = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//WalletOS//Calendar Sync//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:WalletOS Deadlines",
            "X-WR-TIMEZONE:UTC",
            ...events,
            "END:VCALENDAR"
        ].join("\r\n");

        return new NextResponse(vcalendar, {
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": 'attachment; filename="walletos.ics"',
            }
        });

    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

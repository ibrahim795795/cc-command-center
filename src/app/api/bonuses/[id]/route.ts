import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.bonus.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Forbidden", { status: 403 });

        const body = await request.json();

        const bonus = await prisma.bonus.update({
            where: { id },
            data: {
                offerName: body.offerName,
                minSpendAmount: body.minSpendAmount ? Number(body.minSpendAmount) : null,
                spendDeadlineDate: body.spendDeadlineDate ? new Date(body.spendDeadlineDate) : null,
                currentSpendProgress: body.currentSpendProgress ? Number(body.currentSpendProgress) : 0,
                bonusExpected: body.bonusExpected ? Number(body.bonusExpected) : null,
                bonusPosted: body.bonusPosted || false,
                postedDate: body.postedDate ? new Date(body.postedDate) : null,
                statusPipeline: body.statusPipeline,
            },
        });

        return NextResponse.json(bonus);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update bonus", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.bonus.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Forbidden", { status: 403 });

        await prisma.bonus.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete bonus" }, { status: 500 });
    }
}

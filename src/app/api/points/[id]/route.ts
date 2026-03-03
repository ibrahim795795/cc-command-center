import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        const existing = await prisma.pointsBalance.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Forbidden", { status: 403 });

        const body = await request.json();

        const points = await prisma.pointsBalance.update({
            where: { id },
            data: {
                program: body.program,
                balance: Number(body.balance),
                notes: body.notes,
                lastUpdated: new Date()
            },
        });

        return NextResponse.json(points);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update points record", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        const existing = await prisma.pointsBalance.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Forbidden", { status: 403 });

        await prisma.pointsBalance.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete points record" }, { status: 500 });
    }
}

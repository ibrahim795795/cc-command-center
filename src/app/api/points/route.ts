import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const points = await prisma.pointsBalance.findMany({
            where: { userId },
            orderBy: { balance: "desc" },
        });
        return NextResponse.json(points);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await request.json();

        if (!body.program || body.balance === undefined) {
            return NextResponse.json({ error: "Program and balance are required" }, { status: 400 });
        }

        const points = await prisma.pointsBalance.create({
            data: {
                userId,
                program: body.program,
                balance: Number(body.balance),
                notes: body.notes,
                lastUpdated: new Date()
            },
        });

        return NextResponse.json(points, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "Program already exists" }, { status: 400 });
        return NextResponse.json({ error: "Failed to create points record", details: error.message }, { status: 500 });
    }
}

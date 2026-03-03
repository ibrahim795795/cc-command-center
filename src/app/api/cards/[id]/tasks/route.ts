import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify user owns card
        const card = await prisma.card.findFirst({ where: { id, userId } });
        if (!card) return new NextResponse("Not Found", { status: 404 });

        const tasks = await prisma.cardTask.findMany({
            where: { cardId: id, userId },
            orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }]
        });

        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify user owns card
        const card = await prisma.card.findFirst({ where: { id, userId } });
        if (!card) return new NextResponse("Not Found", { status: 404 });

        const body = await request.json();
        if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

        const task = await prisma.cardTask.create({
            data: {
                title: body.title,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                cardId: id,
                userId
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to create task", details: error.message }, { status: 500 });
    }
}

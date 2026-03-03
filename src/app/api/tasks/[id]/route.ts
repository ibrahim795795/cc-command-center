import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify user owns task
        const existing = await prisma.cardTask.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Not Found", { status: 404 });

        const body = await request.json();

        const task = await prisma.cardTask.update({
            where: { id },
            data: {
                title: body.title !== undefined ? body.title : existing.title,
                completed: body.completed !== undefined ? body.completed : existing.completed,
                dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate
            }
        });

        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update task", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify user owns task
        const existing = await prisma.cardTask.findFirst({ where: { id, userId } });
        if (!existing) return new NextResponse("Not Found", { status: 404 });

        await prisma.cardTask.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}

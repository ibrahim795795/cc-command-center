import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existingCard = await prisma.card.findFirst({ where: { id, userId } });
        if (!existingCard) return new NextResponse("Forbidden", { status: 403 });

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const tag = formData.get("tag") as string;
        const notes = formData.get("notes") as string;
        const statementMonthYear = formData.get("statementMonthYear") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save locally
        const uploadDir = join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignored if exists
        }

        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const uniqueFilename = `${Date.now()}-${sanitizedName}`;
        const path = join(uploadDir, uniqueFilename);
        const dbPath = `/uploads/${uniqueFilename}`;

        await writeFile(path, buffer);

        const document = await prisma.document.create({
            data: {
                userId,
                cardId: id,
                fileName: file.name,
                filePath: dbPath,
                tag: tag || "Other",
                notes: notes || null,
                statementMonthYear: statementMonthYear || null,
            },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to upload document", details: error.message }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;

        // Security check: Verify card ownership first
        const existingCard = await prisma.card.findFirst({ where: { id, userId } });
        if (!existingCard) return new NextResponse("Forbidden", { status: 403 });

        const documents = await prisma.document.findMany({
            where: { cardId: id, userId },
            orderBy: { uploadDate: "desc" },
        });
        return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

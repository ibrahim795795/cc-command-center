import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        // Find all cards with "offline-user" and update them to the current user
        const updatedCards = await prisma.card.updateMany({
            where: { userId: "offline-user" },
            data: { userId: userId }
        });

        // Also update documents attached with offline-user
        const updatedDocs = await prisma.document.updateMany({
            where: { userId: "offline-user" },
            data: { userId: userId }
        });

        return NextResponse.json({
            success: true,
            cardsUpdated: updatedCards.count,
            docsUpdated: updatedDocs.count
        });

    } catch (error: any) {
        console.error("Adopt cards error:", error);
        return NextResponse.json({ error: "Failed to adopt cards" }, { status: 500 });
    }
}

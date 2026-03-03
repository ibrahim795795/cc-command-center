import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ docId: string }> }) {
    try {
        const { docId } = await params;
        // Note: To be fully clean we should unlink the file from fs, but for MVP DB removal is sufficient.
        await prisma.document.delete({
            where: { id: docId },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }
}

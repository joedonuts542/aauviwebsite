import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { prisma } from "@/util/db";
import { ReportCategory, ReportType } from "@prisma/client";

export const POST = async (
    req: NextRequest
) => {
    try {
        const auth = await verifyAuth(req);
        if (auth) {
            const {
                description,
                category,
                type,
                targetId
            }: {
                description?: string,
                category?: ReportCategory
                type?: ReportType,
                targetId?: string,
            } = await req.json();

            if (
                description
                && category
                && type
                && targetId
                && description.length <= 100
            ) {
                await prisma.report.create({
                    data: {
                        description,
                        category,
                        type,
                        targetId,
                        createdBy: auth.id
                    }
                })
            } else {
                throw Error("Invalid body provided for report");
            }
        } else {
            throw Error("Invalid authorization token provided");
        }
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: (error as Error).message
            }),
            { status: 500 }
        )
    }
}
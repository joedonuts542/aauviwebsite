import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            groupId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const groupId = params.groupId;
        if (auth) {
            const types = await prisma.ticketType.findMany({
                where: {
                    groupId
                }
            })

            return new Response(
                JSON.stringify({
                    types
                }),
                { status: 200 }
            )
        } else {
            throw Error("Invalid authorization");
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
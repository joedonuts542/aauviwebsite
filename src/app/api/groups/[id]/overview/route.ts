import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupOwner } from "@/util/db/group";
import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const id = params.id;
        if (auth && id) {
            const group = await prisma.group.findFirstOrThrow({
                where: {
                    id
                },
                select: {
                    name: true,
                    groupId: true,
                    createdAt: true
                }
            });

            return new Response(
                JSON.stringify({
                    group
                }),
                { status: 200 }
            )
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
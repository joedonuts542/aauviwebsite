import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

export const GET = async (
    req: NextRequest,
    { 
        params
    }: {
        params: {
            id: string,
            robloxId: string,
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const robloxId = params.robloxId;
        const groupId = params.id;
        if (auth) {
            console.log(robloxId);
            const user = await prisma.user.findFirstOrThrow({
                where: {
                    robloxId,
                    groups: {
                        some: {
                            groupId
                        }
                    }
                },
                select: {
                    id: true
                }
            });

            return new Response(
                JSON.stringify({
                    user: user.id
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
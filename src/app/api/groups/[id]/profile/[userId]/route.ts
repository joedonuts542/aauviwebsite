import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            userId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const userId = params.userId;
        const id = params.id;
        if (auth && id && userId) {
            const role = await getGroupRole(id, auth.id);
            if (role && (
                role.role.admin
                || role.role.humanResources
                || role.role.publicRelations
                || role.role.developer
                || auth.id === userId
            )) {
                const groupUser = await prisma.groupUser.findFirstOrThrow({
                    where: {
                        groupId: id,
                        userId: userId
                    },
                    include: {
                        user: true,
                        role: true
                    }
                });

                return new Response(
                    JSON.stringify({
                        user: groupUser.user,
                        role: groupUser.role
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("You cannot view this user's profile")
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
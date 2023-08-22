import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

export const DELETE = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            messageId: string,
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const messageId = params.messageId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);

            if (
                user.role.admin
                || user.role.publicRelations
                || user.role.humanResources
                || user.role.developer
            ) {
                await prisma.groupMessage.delete({
                    where: {
                        id: messageId
                    }
                })

                return new Response(
                    JSON.stringify({
                        data: "Successfully deleted this message!"
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("You cannot manage this page");
            }
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

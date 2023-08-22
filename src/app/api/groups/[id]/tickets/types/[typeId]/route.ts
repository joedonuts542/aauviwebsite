import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            typeId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const typeId = params.typeId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
            ) {
                await prisma.ticketType.findFirstOrThrow({
                    where: {
                        id: typeId,
                        groupId
                    }
                });

                await prisma.ticketType.delete({
                    where: {
                        id: typeId,
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "Successfully removed ticket type!"
                    }),
                    { status: 200 }
                );
            } else {
                throw Error("You cannot view this page");
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
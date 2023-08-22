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
            placeId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const placeId = params.placeId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
            ) {
                await prisma.groupPlace.update({
                    where: {
                        id: placeId
                    },
                    data: {
                        isActive: false
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "Success!"
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

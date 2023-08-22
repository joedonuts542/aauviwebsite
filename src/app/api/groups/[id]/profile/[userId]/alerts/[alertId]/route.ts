import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";

export const DELETE = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            userId: string,
            alertId: string,
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const alertId = params.alertId;
        const userId = params.userId;
        const id = params.id;
        if (auth && id && userId && alertId) {
            const role = await getGroupRole(id, auth.id);
            if (role && (
                role.role.admin
                || role.role.humanResources
                || role.role.publicRelations
                || role.role.developer
            )) {
                await prisma.groupAlert.update({
                    where: {
                        id: alertId
                    },
                    data: {
                        isActive: false
                    }
                })

                return new Response(
                    JSON.stringify({
                        data: "Success!"
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("You cannot view this user's profile");
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

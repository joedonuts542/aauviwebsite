import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { DateTime, } from "luxon";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

export const DELETE = async (
    req: NextRequest,
    { 
        params
    }: {
        params: {
            id: string,
            timeId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const timeId = params.timeId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.humanResources
            ) {
                await prisma.groupTimes.delete({
                    where: {
                        id: timeId
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "This event time has been deleted"
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("You cannot create event times");
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

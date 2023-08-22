import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { GroupTicket, TicketType, User } from "@prisma/client";

export type TicketOverview = GroupTicket & {
    _count: {
        responses: number
    },
    type: TicketType,
    user: User
}

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
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
            ) {
                const tickets = await prisma.groupTicket.findMany({
                    where: {
                        groupId,
                        isActive: true
                    },
                    include: {
                        _count: {
                            select: {
                                responses: true
                            }
                        },
                        type: true,
                        user: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });

                return new Response(
                    JSON.stringify({
                        tickets
                    }),
                    { status: 200 }
                )
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

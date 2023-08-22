import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { getUser } from "@/util/db/user";

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
                const events = await prisma.groupEvent.findMany({
                    where: {
                        groupId: id,
                        isActive: true,
                        archived: false,
                        OR: [
                            {
                                createdBy: userId,
                            },
                            {
                                users: {
                                    some: {
                                        id: userId
                                    }
                                }
                            }
                        ]
                    },
                    include: {
                        author: true
                    }
                })

                const nextSession = await prisma.groupEvent.findFirst({
                    where: {
                        groupId: id,
                        isActive: true,
                        start: {
                            gte: new Date(Date.now())
                        },
                        type: "SESSION"
                    },
                    orderBy: {
                        start: "asc"
                    }
                });

                const nextTraining = await prisma.groupEvent.findFirst({
                    where: {
                        groupId: id,
                        isActive: true,
                        start: {
                            gte: new Date(Date.now())
                        },
                        type: "TRAINING"
                    },
                    orderBy: {
                        start: "asc"
                    }
                });
                
                const nextMeeting = await prisma.groupEvent.findFirst({
                    where: {
                        groupId: id,
                        isActive: true,
                        start: {
                            gte: new Date(Date.now())
                        },
                        type: "MEETING"
                    },
                    orderBy: {
                        start: "asc"
                    }
                });

                return new Response(
                    JSON.stringify({
                        events,
                        nextMeeting,
                        nextSession,
                        nextTraining
                    })
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
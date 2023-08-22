import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { DateTime, } from "luxon";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            eventId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const eventId = params.eventId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            const event = await prisma.groupEvent.findFirstOrThrow({
                where: {
                    id: eventId
                },
                include: {
                    author: true,
                    users: true
                }
            })

            return new Response(
                JSON.stringify({
                    event
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

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            eventId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const eventId = params.eventId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            const {
                join,
                targetId
            }: {
                join?: boolean,
                targetId?: string
            } = await req.json();

            const event = await prisma.groupEvent.findFirstOrThrow({
                where: {
                    id: eventId
                }
            })

            if (event.createdBy === auth.id || new Date(event.start).getTime() > Date.now()) {
                if (targetId && auth.id !== event.createdBy) {
                    throw Error("You cannot manage this event")
                } else if (event.createdBy === auth.id) {
                    throw Error("You cannot sign up for an event you are hosting");
                }

                if (join) {
                    await prisma.groupEvent.update({
                        where: {
                            id: eventId
                        },
                        data: {
                            users: {
                                connect: {
                                    id: targetId ? targetId : auth.id
                                }
                            }
                        }
                    })
                } else {
                    await prisma.groupEvent.update({
                        where: {
                            id: eventId
                        },
                        data: {
                            users: {
                                disconnect: {
                                    id: targetId ? targetId : auth.id
                                }
                            }
                        }
                    })
                }

                return new Response(
                    JSON.stringify({
                        data: "Successfully updated event!"
                    })
                )
            } else {
                throw Error("You cannot sign up for events from the past")
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
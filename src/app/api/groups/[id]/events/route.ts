import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { DateTime } from "luxon";

import { prisma } from "@/util/db";
import { getGroup } from "@/util/db/group";
import { EventType } from "@prisma/client";

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
            const startOfPeriod = DateTime.now().setZone("Etc/UTC").startOf("week");
            const endOfPeriod = startOfPeriod.plus({ week: 1 }).endOf("week");
            const events = await prisma.groupEvent.findMany({
                where: {
                    groupId,
                    isActive: true,
                    archived: false,
                    start: {
                        gte: startOfPeriod.toJSDate(),
                        lte: endOfPeriod.toJSDate()
                    }
                },
                orderBy: {
                    start: "asc"
                }
            });

            const times = await prisma.groupTimes.findMany({
                where: {
                    groupId
                }
            });

            return new Response(
                JSON.stringify({
                    events,
                    times
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
            id: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const groupId = params.id;
        if (auth) {
            const group = await getGroup(groupId);
            const response = await fetch(
                `https://groups.roblox.com/v2/users/${auth.robloxId}/groups/roles`
            );

            if (response.status === 200) {
                const body = await response.json() as any;
                if (body.data) {
                    let role = body.data.findIndex((r: {
                        role: {
                            id: number,
                            name: string,
                            rank: number
                        },
                        group: {
                            id: number
                        }
                    }) => r.group.id.toString() === group.groupId);

                    if (role >= 0) {
                        if (body.data[role].role.rank >= (group.hostEvents || 0)) {
                            const {
                                title,
                                description,
                                start,
                                end,
                                type,
                                location
                            }: {
                                title?: string,
                                description?: string,
                                start?: Date,
                                end?: Date,
                                type?: EventType,
                                location?: string
                            } = await req.json();

                            if (
                                title
                                && description
                                && start
                                && end
                                && type
                                && description.length <= 1000
                            ) {
                                const startOfPeriod = DateTime.now().startOf("week");
                                const endOfPeriod = DateTime.now().endOf("week").plus({ weeks: 1 });
                                if (
                                    new Date(start).getTime() > startOfPeriod.toMillis()
                                    && new Date(start).getTime() < endOfPeriod.plus({ weeks: 2 }).toMillis()
                                ) {
                                    if (
                                        !group.unlimited
                                        && new Date(start).getTime() > endOfPeriod.toMillis()
                                    ) {
                                        throw Error("You must upgrade to create an event past two-weeks out");
                                    }

                                    await prisma.groupEvent.create({
                                        data: {
                                            groupId,
                                            title,
                                            description,
                                            start: new Date(start),
                                            end: new Date(end),
                                            type,
                                            location,
                                            createdBy: auth.id
                                        }
                                    });
                                } else {
                                    throw Error("You cannot create an event this far out");
                                }

                                return new Response(
                                    JSON.stringify({
                                        data: "A new event has been created!"
                                    })
                                )
                            } else {
                                throw Error("A title, description, start, and, and type is required");
                            }
                        } else {
                            throw Error("You cannot host group events");
                        }
                    } else {
                        throw Error("Authenticated user is not in this group");
                    }
                } else {
                    throw Error(body.errors[0])
                }
            } else {
                throw Error("Unable to fetch group roles");
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
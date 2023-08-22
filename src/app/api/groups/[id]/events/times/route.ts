import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { DateTime, Duration } from "luxon";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

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
            const times = await prisma.groupTimes.findMany({
                where: {
                    groupId
                }
            });

            return new Response(
                JSON.stringify({
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
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.humanResources
            ) {
                const {
                    time
                }: {
                    time?: string
                } = await req.json();

                if (time) {
                    const display = DateTime.fromFormat(time, "T").toFormat("t ZZZZ");
                    const times = await prisma.groupTimes.findFirst({
                        where: {
                            groupId,
                            value: time
                        }
                    });

                    if (!times) {
                        await prisma.groupTimes.create({
                            data: {
                                groupId,
                                display,
                                value: time
                            }
                        });

                        return new Response(
                            JSON.stringify({
                                data: "Successfully added new time!"
                            }),
                            { status: 200 }
                        );
                    } else {
                        throw Error("This time has already been created");
                    }
                } else {
                    throw Error("You must provide a valid time");
                }
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

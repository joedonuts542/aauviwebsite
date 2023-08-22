import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupOwner, getGroupRole } from "@/util/db/group";
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
                const user = await getUser(userId);
                if (user) {
                    const records = await prisma.groupActivity.findMany({
                        where: {
                            robloxId: user.robloxId,
                            groupId: id,
                            archived: false
                        },
                    });

                    const total = await prisma.groupActivity.aggregate({
                        _sum: {
                            length: true
                        },
                        where: {
                            robloxId: user.robloxId,
                            isActive: true,
                            groupId: id
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            entries: records,
                            total: total._sum.length || 0
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("The target profile does not exist");
                }
            } else {
                throw Error("You cannot view this user's profile")
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

export const POST = async (
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
            )) {
                const user = await getUser(userId);
                if (user) {
                    const body: {
                        start: Date,
                        end: Date
                    } = await req.json();

                    if (body && body.start && body.end) {
                        const difference = new Date(body.end).getTime() - new Date(body.start).getTime()
                        if (difference > 0) {
                            await prisma.groupActivity.create({
                                data: {
                                    robloxId: user.robloxId,
                                    groupId: id,
                                    start: new Date(body.start),
                                    end: new Date(body.end),
                                    length: difference
                                }
                            })

                            return new Response(
                                JSON.stringify({
                                    data: "Successfully created new time entry"
                                }),
                                { status: 200 }
                            );
                        } else {
                            throw Error("The start time must occur before the end");
                        }
                    } else {
                        throw Error("Both a start and end time must be provided")
                    }
                } else {
                    throw Error("The target profile does not exist");
                }
            } else {
                throw Error("You cannot view this user's profile")
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

export const DELETE = async (
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
            )) {
                const user = await getUser(userId);
                if (user) {
                    const activityId = req.nextUrl.searchParams.get("activityId");
                    const pause = req.nextUrl.searchParams.get("pause");

                    if (activityId) {
                        if (pause === "true") {
                            const record = await prisma.groupActivity.findFirst({
                                where: {
                                    id: activityId
                                }
                            });

                            if (record) {
                                const difference = Date.now() - new Date(record.start).getTime();
                                await prisma.groupActivity.update({
                                    where: {
                                        id: activityId
                                    },
                                    data: {
                                        end: new Date(Date.now()),
                                        length: difference
                                    }
                                })
                            } else {
                                throw ("Time entry record could not be found");
                            }
                        } else {
                            await prisma.groupActivity.update({
                                where: {
                                    id: activityId
                                },
                                data: {
                                    isActive: false
                                }
                            })
                        }

                        return new Response(
                            JSON.stringify({
                                data: "Successfully modified time entry"
                            }),
                            { status: 200 }
                        );
                    } else {
                        throw Error("Both a start and end time must be provided")
                    }
                } else {
                    throw Error("The target profile does not exist");
                }
            } else {
                throw Error("You cannot view this user's profile")
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
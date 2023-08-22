import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getUserRank } from "@/util/roblox/group.server";

import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest
) => {
    try {
        const auth = await verifyAuth(req);
        if (auth) {
            const response = await prisma.groupUser.findMany({
                where: {
                    userId: auth.id,
                },
                include: {
                    group: true
                }
            });

            return new Response(
                JSON.stringify(response.map(g => g.group)),
                { status: 200 }
            );
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
    req: NextRequest
) => {
    try {
        const auth = await verifyAuth(req);
        const data = await req.json();
        if (auth && data) {
            if (
                data.groupId
                && data.name
            ) {
                const groups = await prisma.groupUser.findMany({
                    where: {
                        userId: auth.id,
                        role: {
                            level: 1000
                        }
                    }
                });

                if (groups.length < 2) {
                    const rank = await getUserRank(data.groupId, auth.robloxId);
                    if (rank > 0) {
                        await prisma.group.create({
                            data: {
                                name: data.name,
                                groupId: data.groupId.toString(),
                                description: data.description,
                                discordUrl: data.discordUrl,
                                users: {
                                    create: {
                                        user: {
                                            connect: {
                                                id: auth.id
                                            }
                                        },
                                        role: {
                                            connect: {
                                                level: 1000
                                            }
                                        }
                                    }
                                },
                                syncedAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
                            }
                        });

                        const response = await prisma.groupUser.findMany({
                            where: {
                                userId: auth.id,
                            },
                            include: {
                                group: true
                            }
                        });

                        return new Response(
                            JSON.stringify(response.map(g => g.group)),
                            { status: 200 }
                        );
                    } else {
                        throw Error("You must be a member of this group");
                    }
                } else {
                    throw Error("You may only create two neuro groups at this time.");
                }
            } else {
                throw Error("Both `groupId` and `name` are required");
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
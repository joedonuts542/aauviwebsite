import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

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
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.publicRelations
                || user.role.humanResources
                || user.role.developer
            ) {
                const users = await prisma.groupUser.findMany({
                    where: {
                        groupId,
                        role: {
                            OR: [
                                {
                                    admin: true
                                },
                                {
                                    humanResources: true
                                },
                                {
                                    publicRelations: true
                                },
                                {
                                    developer: true
                                }
                            ],
                            level: {
                                lt: 1000
                            }
                        }
                    },
                    include: {
                        user: true,
                        role: true
                    }
                });

                return new Response(
                    JSON.stringify({
                        users: {
                            admins: users.filter(u => u.role.admin).map(u => u.user),
                            humanResources: users.filter(u => u.role.humanResources && (!u.role.admin)).map(u => u.user),
                            publicRelations: users.filter(u => u.role.humanResources && (!u.role.admin)).map(u => u.user),
                            developers: users.filter(u => u.role.developer && (!u.role.admin)).map(u => u.user)
                        }
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
            const {
                level,
                userId
            }: {
                level: number,
                userId: string
            } = await req.json();
            const user = await getGroupRole(groupId, auth.id);
            if (
                (
                    user.role.admin
                    || user.role.publicRelations
                    || user.role.humanResources
                    || user.role.developer
                ) && level && userId
            ) {
                if (user.role.level > level) {
                    const target = await prisma.user.findFirstOrThrow({
                        where: {
                            id: userId
                        },
                        include: {
                            groups: {
                                where: {
                                    groupId,
                                },
                                include: {
                                    role: true
                                }
                            }
                        }
                    });

                    if (target.groups[0].role.level < level) {
                        await prisma.groupUser.update({
                            where: {
                                id: target.groups[0].id
                            },
                            data: {
                                role: {
                                    connect: {
                                        level: level
                                    }
                                }
                            }
                        })

                        return new Response(
                            JSON.stringify({
                                data: `${target.name}'s role has been updated!`
                            }),
                            { status: 200 }
                        )
                    } else {
                        throw Error("This user cannot be moved down permissions");
                    }
                } else {
                    throw Error("You cannot add permissions to this user.");
                }
            } else {
                throw Error("You must provide all parameters required");
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
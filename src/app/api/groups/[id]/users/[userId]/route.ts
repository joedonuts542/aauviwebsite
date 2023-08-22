import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

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
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                (
                    user.role.admin
                    || user.role.publicRelations
                    || user.role.humanResources
                    || user.role.developer
                )
            ) {
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

                    if (target.groups[0].role.level < user.role.level) {
                        await prisma.groupUser.update({
                            where: {
                                id: target.groups[0].id
                            },
                            data: {
                                role: {
                                    connect: {
                                        level: 100
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
                        throw Error("You cannot manage this user's permissions");
                    }
            } else {
                throw Error("You cannot manage user permissions");
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
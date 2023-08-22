import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { CardStatus, CardType } from "@prisma/client";

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
                const cards = await prisma.groupCard.findMany({
                    where: {
                        groupId
                    },
                    include: {
                        author: true,
                        tasks: true
                    }
                })

                return new Response(
                    JSON.stringify({
                        cards
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
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
            ) {
                const {
                    title,
                    description,
                    type,
                    links,
                    dueAt,
                    tasks
                }: {
                    title?: string,
                    description?: string,
                    type?: CardType,
                    links?: string[],
                    dueAt?: string,
                    tasks?: string[]
                } = await req.json();

                if (
                    title
                    && description
                    && description.length <= 3000
                    && type
                    && (links ? links.length <= 3 : true)
                    && (tasks ? tasks.length <= 10 : true)
                ) {
                    await prisma.groupCard.create({
                        data: {
                            groupId,
                            title,
                            description,
                            type,
                            links,
                            dueAt: dueAt ? new Date(dueAt) : undefined,
                            createdBy: auth.id,
                            tasks: tasks ? {
                                createMany: {
                                    data: tasks.map(t => ({
                                        name: t
                                    }))
                                }
                            } : undefined
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "Successfully created a new card!"
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Invalid data provided.");
                }
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

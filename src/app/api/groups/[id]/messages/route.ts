import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupMessages, getGroupOwner, getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";

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
        if (auth) {
            const id = params.id;
            const skip = req.nextUrl.searchParams.get("skip");

            const messages = await getGroupMessages(
                id,
                skip ? Number(skip) : undefined
            );

            return new Response(
                JSON.stringify({
                    messages
                }),
                { status: 200 }
            )
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
            id: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const id = params.id;
        if (auth && id) {
            const body = await req.json();
            const role = await getGroupRole(id, auth.id);
            if (
                role.role.admin
                || role.role.developer
                || role.role.humanResources
                || role.role.publicRelations
            ) {
                if (
                    body.title
                    && body.body
                    && body.body.length <= 1000
                ) {
                    const messages = await prisma.groupMessage.findMany({
                        where: {
                            groupId: id
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    });

                    if (messages.length >= 10) {
                        const toDelete = messages.splice(9);
                        await prisma.groupMessage.deleteMany({
                            where: {
                                groupId: id,
                                id: {
                                    in: toDelete.map(d => d.id)
                                }
                            },
                        });
                    }

                    await prisma.groupMessage.create({
                        data: {
                            title: body.title,
                            body: body.body,
                            link: body.link ? body.link : undefined,
                            author: {
                                connect: {
                                    id: auth.id
                                }
                            },
                            group: {
                                connect: {
                                    id: id
                                }
                            }
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "Success!"
                        }),
                        { status: 200 }
                    );
                } else {
                    throw Error("Both `title` and `body` are required");
                }
            } else {
                throw Error("You cannot post messages for this group");
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
import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest,
) => {
    try {
        const auth = await verifyAuth(req);
        if (auth) {
            const tickets = await prisma.groupTicket.findMany({
                where: {
                    createdBy: auth.id
                },
                include: {
                    _count: {
                        select: {
                            responses: true
                        }
                    },
                    type: true,
                    group: {
                        select: {
                            id: true,
                            groupId: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            return new Response(
                JSON.stringify({
                    tickets
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
) => {
    try {
        const auth = await verifyAuth(req);
        if (auth) {
            const {
                groupId,
                title,
                description,
                type
            }: {
                groupId?: string,
                title?: string,
                description?: string,
                type?: string
            } = await req.json();

            if (
                groupId
                && title
                && description
                && type
            ) {
                const existing = await prisma.groupTicket.findFirst({
                    where: {
                        createdBy: auth.id,
                        groupId,
                        isActive: true
                    }
                });

                if (existing) {
                    throw Error("You already have an open ticket for this group");
                } 

                await prisma.ticketType.findFirstOrThrow({
                    where: {
                        id: type,
                        groupId,
                    }
                });

                const ticket = await prisma.groupTicket.create({
                    data: {
                        title,
                        description,
                        typeId: type,
                        groupId,
                        createdBy: auth.id
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: ticket.id
                    }),
                    { status: 200 }
                );
            } else {
                throw Error("Invalid or missing body parameters");
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
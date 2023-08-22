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
                || user.role.developer
            ) {
                const types = await prisma.ticketType.findMany({
                    where: {
                        groupId
                    }
                });

                return new Response(
                    JSON.stringify({
                        types
                    }),
                    { status: 200 }
                );
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
                    name
                }: {
                    name: string
                } = await req.json();

                if (name) {
                    const types = await prisma.ticketType.count({
                        where: {
                            groupId
                        },
                    });

                    if (types < 50) {
                        await prisma.ticketType.create({
                            data: {
                                name,
                                groupId
                            }
                        });

                        return new Response(
                            JSON.stringify({
                                data: `Successfully added new type: ${name.substring(0, 15)}${name.length > 15 ? "..." : ""}`
                            }),
                            { status: 200 }
                        )
                    } else {
                        throw Error("This group has exceeded the maximum number of types");
                    }
                } else {
                    throw Error("A type name must be specified");
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

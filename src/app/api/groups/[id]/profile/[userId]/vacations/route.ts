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
                const vacations = await prisma.groupVacation.findMany({
                    where: {
                        groupId: id,
                        createdBy: userId,
                    }
                });

                return new Response(
                    JSON.stringify({
                        vacations
                    }),
                    { status: 200 }
                )
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
                || role.role.publicRelations
                || role.role.developer
            )) {
                const {
                    description,
                    start,
                    end,
                }: {
                    description?: string,
                    start?: Date,
                    end?: Date
                } = await req.json();

                if (
                    start
                    && description
                    && description.length <= 500
                    && end
                ) {
                    await prisma.groupVacation.create({
                        data: {
                            description,
                            start,
                            end,
                            createdBy: auth.id,
                            groupId: id
                        }
                    })

                    return new Response(
                        JSON.stringify({
                            data: "Success!"
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Missing request details");
                }
            } else {
                throw Error("You cannot view this user's profile");
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
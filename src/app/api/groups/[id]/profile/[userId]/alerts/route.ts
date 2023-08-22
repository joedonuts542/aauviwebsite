import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupOwner, getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { getUser } from "@/util/db/user";
import { DateTime } from "luxon";
import { AlertType, GroupAlert, User } from "@prisma/client";

export type alertContext = GroupAlert & {
    author: User
}

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
                const minDate = DateTime.fromMillis(Date.now()).setZone("Etc/UTC").minus({ months: 3 });
                const alerts = await prisma.groupAlert.findMany({
                    where: {
                        groupId: id,
                        targetId: userId,
                        isActive: true,
                        start: {
                            gte: minDate.toJSDate()
                        }
                    },
                    include: {
                        author: true
                    }
                });

                return new Response(
                    JSON.stringify({
                        alerts
                    }),
                    { status: 200 }
                )
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
                    title,
                    description,
                    type,
                    start,
                    end,
                }: {
                    title?: string,
                    description?: string,
                    type?: AlertType,
                    start?: Date,
                    end?: Date
                } = await req.json();

                if (
                    title
                    && description
                    && description.length <= 500
                    && type
                ) {
                    if (type === "SUSPENSION"
                        && (!start || !end)
                    ) {
                        throw Error("Suspensions require a start and end date");
                    }

                    await prisma.groupAlert.create({
                        data: {
                            title,
                            description,
                            type,
                            start,
                            end,
                            targetId: userId,
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
import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { GroupApplication } from "@prisma/client";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            appId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const appId = params.appId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
                || user.role.publicRelations
                || user.role.humanResources
            ) {
                const app = await prisma.groupApplication.findFirstOrThrow({
                    where: {
                        groupId,
                        id: appId
                    },
                })

                return new Response(
                    JSON.stringify({
                        app
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
            id: string,
            appId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const appId = params.appId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
                || user.role.publicRelations
                || user.role.humanResources
            ) {
                const app: GroupApplication = await req.json();
                if (
                    app.title
                    && app.description
                    && app.submitText
                ) {
                    await prisma.groupApplication.update({
                        where: {
                            id: appId
                        },
                        data: {
                            title: app.title,
                            description: app.description,
                            submitText: app.submitText,
                            isActive: app.isActive
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "Successfully updated this application"
                        }),
                        { status: 200 }
                    );
                } else {
                    throw Error("Missing required application fields")
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
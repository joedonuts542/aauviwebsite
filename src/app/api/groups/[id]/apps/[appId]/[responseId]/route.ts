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
            id: string,
            appId: string,
            responseId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const responseId = params.responseId;
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
                const app = await prisma.applicationInstance.findFirstOrThrow({
                    where: {
                        id: responseId
                    },
                    include: {
                        questions: {
                            include: {
                                question: {
                                    select: {
                                        title: true,
                                        weight: true,
                                        required: true,
                                    }
                                }
                            }
                        },
                        application: {
                            include: {
                                group: {
                                    select: {
                                        groupId: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });

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
            appId: string,
            responseId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const responseId = params.responseId;
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
                const status = req.nextUrl.searchParams.get("status") || "DENIED";
                const application = await prisma.groupApplication.findFirstOrThrow({
                    where: {
                        groupId,
                        id: appId,
                        instances: {
                            some: {
                                id: responseId
                            }
                        }
                    }
                });

                await prisma.applicationInstance.update({
                    where: {
                        id: responseId
                    },
                    data: {
                        status: status === "ACCEPTED"
                            ? "ACCEPTED"
                            : "DENIED"
                    }
                })

                return new Response(
                    JSON.stringify({
                        data: "Successully updated this application!"
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
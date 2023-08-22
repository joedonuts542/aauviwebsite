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
                const questions = await prisma.applicationQuestion.findMany({
                    where: {
                        applicationId: appId
                    }
                });

                return new Response(
                    JSON.stringify({
                        questions
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
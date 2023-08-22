import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            taskId: string,
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const taskId = params.taskId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);

            if (
                user.role.admin
                || user.role.developer
            ) {
                const {
                    completed
                }: {
                    completed?: boolean
                } = await req.json();

                if (
                    typeof completed !== "undefined"
                ) {
                    await prisma.cardTask.update({
                        where: {
                            id: taskId
                        },
                        data: {
                            completed
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "Successfully updated this card!"
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

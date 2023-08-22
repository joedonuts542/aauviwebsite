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
                (
                    user.role.admin
                    || user.role.humanResources
                )
            ) {
                const {
                    maxHelpers,
                    terminateAlerts,
                    defaultWarning,
                    defaultTermination
                }: {
                    maxHelpers?: number,
                    terminateAlerts: number,
                    defaultWarning: string,
                    defaultTermination: string
                } = await req.json();

                if (
                    terminateAlerts
                    && defaultWarning
                    && defaultWarning.length <= 3000
                    && defaultTermination
                    && defaultTermination.length <= 3000
                ) {
                    await prisma.group.update({
                        where: {
                            id: groupId
                        },
                        data: {
                            maxHelpers: maxHelpers ? maxHelpers : undefined,
                            terminateAlerts,
                            defaultWarning,
                            defaultTermination
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "This group has been updated!"
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("All required body parameters must be provided")
                }
            } else {
                throw Error("You cannot manage user permissions");
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
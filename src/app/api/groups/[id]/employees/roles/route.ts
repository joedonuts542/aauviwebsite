import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import fetch from "node-fetch";
import { getGroup, getGroupRole } from "@/util/db/group";

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
            const group = await getGroup(groupId);
            const user = await getGroupRole(groupId, auth.id);
            if (
                group
                && user
            ) {
                const response = await fetch(
                    `https://groups.roblox.com/v1/groups/${group.groupId}/roles`
                );

                if (response.status === 200) {
                    const body = await response.json() as any;
                    return new Response(
                        JSON.stringify({
                            ...body
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Unable to fetch group roles");
                }
            } else {
                throw Error("You cannot load this group's information")
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
import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupOwner, getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { getUser } from "@/util/db/user";
import fetch from "node-fetch";

export const GET = async (
    req: NextRequest,
    { 
        params
    }: {
        params: {
            userId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const userId = Number(params.userId);
        const filter = req.nextUrl.searchParams.get("noFilter");
        if (auth) {
            const response = await fetch(
                `https://groups.roblox.com/v2/users/${userId}/groups/roles`
            );

            if (response.status === 200) {
                const body: {
                    data: {
                        group: {
                            id: number,
                            name: string,
                            memberCount: number
                        }
                    }[]
                } = await response.json() as any;

                if (body && body.data) {
                    return new Response(
                        JSON.stringify({
                            groups: filter ? body.data : body.data.map(d => d.group)
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Unable to load Roblox groups body");
                }
            } else {
                throw Error("Failed to fetch user groups");
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
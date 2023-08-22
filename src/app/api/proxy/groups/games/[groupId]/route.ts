import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import fetch from "node-fetch";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            groupId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const groupId = Number(params.groupId);
        if (auth) {
            const response = await fetch(
                `https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=1&limit=50`
            );

            if (response.status === 200) {
                const body: {
                    data: {
                        id: number,
                        name: string,
                    }[]
                } = await response.json() as any;

                if (body && body.data) {
                    return new Response(
                        JSON.stringify({
                            games: body.data
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Unable to load Roblox group games");
                }
            } else {
                throw Error("Failed to fetch group games");
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
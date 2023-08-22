import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { createHash, randomBytes } from "crypto";

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
        const id = params.id;
        const token = req.nextUrl.searchParams.get("token");
        if (id && token) {
            const group = await prisma.group.findFirstOrThrow({
                where: {
                    id
                }
            })
            const hash = createHash("sha256");
            hash.update(token);

            if (group.apiToken && group.apiToken === hash.digest("hex")) {
                return new Response(
                    JSON.stringify({
                        data: group.trackingRank
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("Unable to verify access token")
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
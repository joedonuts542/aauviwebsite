import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest
) => {
    try {
        const auth = await verifyAuth(req);
        if (auth) {
            const query = req.nextUrl.searchParams.get("query");
            const groupId = req.nextUrl.searchParams.get("groupId");
            if (groupId && query && query.length > 3) {
                const matches = await prisma.groupUser.findMany({
                    where: {
                        groupId: groupId,
                        user: {
                            OR: [
                                {
                                    name: {
                                        startsWith: query
                                    }
                                },
                                {
                                    nickname: {
                                        startsWith: query
                                    }
                                },
                                {
                                    preferredUsername: {
                                        startsWith: query
                                    }
                                }
                            ]
                        }
                    },
                    include: {
                        user: true
                    }
                });

                return new Response(
                    JSON.stringify({
                        users: matches.map(m => m.user)
                    }),
                    { status: 200 }
                );
            } else {
                throw Error("Query must be longer than three characters")
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
import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { DateTime } from "luxon";

import { prisma } from "@/util/db";
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
            const user = await getGroupRole(groupId, auth.id);
            const from = req.nextUrl.searchParams.get("from");
            const to = req.nextUrl.searchParams.get("to");
            const startOfPeriod = new Date(Number(from) || Date.now());
            const endOfPeriod = new Date(Number(to) || Date.now());

            const vacations = await prisma.groupVacation.findMany({
                where: {
                    groupId,
                    AND: [
                      {
                        OR: [
                            {
                                start: {
                                    gte: startOfPeriod,
                                    lte: endOfPeriod
                                }
                            },
                            {
                                end: {
                                    gte: startOfPeriod,
                                    lte: endOfPeriod
                                }
                            },
                        ]
                      },
                      {
                        OR: [
                            {
                                status: "PENDING",
                                createdBy: (user.role.admin || user.role.humanResources) ? undefined : auth.id
                            },
                            {
                                status: "APPROVED"
                            }
                        ]
                      }
                    ]
                },
                include: {
                    author: true,
                    modifier: true
                }
            });

            return new Response(
                JSON.stringify({
                    vacations
                }),
                { status: 200 }
            )
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
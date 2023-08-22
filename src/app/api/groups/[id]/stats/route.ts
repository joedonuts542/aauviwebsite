import { NextRequest } from "next/server";
import { DateTime } from "luxon";

import { verifyAuth } from "@/util/db/auth";
import { prisma } from "@/util/db";

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
        if (auth) {
            const id = params.id;

            const times = await prisma.groupActivity.findMany({
                where: {
                    robloxId: auth.robloxId,
                    groupId: id,
                    isActive: true,
                    archived: false
                },
                select: {
                    start: true,
                    end: true,
                    length: true
                }
            });

            const users = await prisma.groupActivity.findMany({
                where: {
                    groupId: id,
                    isActive: true,
                    archived: false,
                    end: null,
                    length: null
                },
                select: {
                    robloxId: true
                }
            });

            let condensed: {
                date: string,
                length: number,
            }[] = [];
            let isActive = false;
            let total = 0;

            times.forEach(t => {
                if (!t.end || !t.length) {
                    isActive = true
                } else {
                    total += t.length;

                    let fixedDate = DateTime.fromJSDate(t.start).toFormat("LLLL dd, yyyy");
                    let foundIndex = condensed.findIndex(c => c.date === fixedDate);
                    if (foundIndex >= 0) {
                        condensed[foundIndex].length += t.length;
                    } else {
                        condensed.push({
                            date: fixedDate,
                            length: t.length
                        })
                    }
                }
            })

            const vacations = await prisma.groupVacation.findMany({
                where: {
                    createdBy: auth.id,
                    groupId: id,
                    start: {
                        gt: new Date(Date.now())
                    },
                },
                take: 4
            });

            const events = await prisma.groupEvent.findMany({
                where: {
                    OR: {
                        createdBy: auth.id,
                        users: {
                            some: {
                                id: auth.id
                            }
                        }
                    },
                    groupId: id,
                    start: {
                        gt: new Date(Date.now())
                    },
                    isActive: true
                },
                take: 4
            })

            return new Response(
                JSON.stringify({
                    isActive,
                    topDay: condensed.sort((a, b) => a.length - b.length)[0],
                    total,
                    events,
                    vacations,
                    users: users.map(u => u.robloxId)
                }),
                { status: 200 }
            )
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
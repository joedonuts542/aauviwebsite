import { NextRequest } from "next/server";

import { getGroup } from "@/util/db/group";
import { prisma } from "@/util/db";
import { createHash, randomBytes } from "crypto";
import { DateTime } from "luxon";

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
        const id = params.id;
        const body = await req.json();
        if (id && body) {
            const {
                userCount,
                employeeCount,
                avgTime,
                avgChats,
                token
            }: {
                userCount?: number,
                employeeCount?: number,
                avgTime?: number,
                avgChats?: number,
                token: string
            } = body;

            const group = await prisma.group.findFirstOrThrow({
                where: {
                    id
                }
            });
            const hash = createHash("sha256");
            hash.update(token);

            if (
                group.apiToken 
                && group.apiToken === hash.digest("hex")
                && userCount
                && employeeCount
                && avgTime
                && avgChats
            ) {
                const startOfHour = DateTime.now().startOf("hour");
                const record = await prisma.groupMonitor.findFirst({
                    where: {
                        groupId: id,
                        createdAt: {
                            gt: startOfHour.minus({ minutes: 1 }).toJSDate(),
                            lt: startOfHour.plus({ minutes: 1 }).toJSDate()
                        }
                    }
                });

                if (record) {
                    await prisma.groupMonitor.update({
                        where: {
                            id: record.id,
                        },
                        data: {
                            userCount: Math.round(((record.userCount * record.avgCount) + userCount) / record.avgCount + 1),
                            employeeCount: Math.round(((record.employeeCount * record.avgCount) + employeeCount) / record.avgCount + 1),
                            avgTime: Math.round(((record.avgTime * record.avgCount) + avgTime) / record.avgCount + 1),
                            avgChats: Math.round(((record.avgChats * record.avgCount) + avgChats) / record.avgCount + 1),
                            avgCount: record.avgCount + 1
                        }
                    })
                } else {
                    await prisma.groupMonitor.create({
                        data: {
                            groupId: id,
                            userCount,
                            employeeCount,
                            avgTime,
                            avgChats,
                            createdAt: startOfHour.toJSDate()
                        }
                    })
                }

                return new Response(
                    JSON.stringify({
                        data: "Successfully submitted new analytic"
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
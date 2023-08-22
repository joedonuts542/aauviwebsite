import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { DateTime } from "luxon";
import { GroupMonitor } from "@prisma/client";

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
            if (
                user.role.admin
                || user.role.developer
            ) {
                const lastWeek = DateTime.now().setZone("Etc/UTC").startOf("day").minus({ days: 7 }).toJSDate()
                const yesterday = DateTime.now().setZone("Etc/UTC").startOf("hour").minus({ day: 1 }).toJSDate();
                const pastDay = await prisma.groupMonitor.findMany({
                    where: {
                        groupId,
                        createdAt: {
                            gte: yesterday
                        }
                    }
                });

                const pastWeek = await prisma.groupMonitor.findMany({
                    where: {
                        groupId,
                        createdAt: {
                            gte: lastWeek
                        }
                    }
                });

                let startOfDay = DateTime.now().setZone("Etc/UTC").startOf("day");
                let days: GroupMonitor[][] = [];
                for (let i = 0; i < 7; i++) {
                    let date = startOfDay.minus({ days: i });
                    days[i] = pastWeek.filter(w => 
                        (
                            date.toMillis() >= new Date(w.createdAt).getTime() 
                            && date.endOf("day").toMillis() < new Date(w.createdAt).getTime()
                        )
                    );
                }

                return new Response(
                    JSON.stringify({
                        pastDay,
                        pastWeek: days.map(d => ({
                            userCount: d.map(c => c.userCount).reduce((a, b) => a + b, 0) / d.length,
                            employeeCount: d.map(c => c.employeeCount).reduce((a, b) => a + b, 0) / d.length,
                            avgChats: d.map(c => c.avgChats).reduce((a, b) => a + b, 0) / d.length,
                            avgTime: d.map(c => c.avgTime).reduce((a, b) => a + b, 0) / d.length,
                        }))
                    }),
                    { status: 200 }
                )
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

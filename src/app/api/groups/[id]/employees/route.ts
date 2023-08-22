import { NextRequest } from "next/server";
import fetch from "node-fetch";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { DateTime } from "luxon";

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
            const roleSetId = req.nextUrl.searchParams.get("roleSetId");
            const cursor = req.nextUrl.searchParams.get("cursor");
            if (roleSetId) {
                const group = await getGroup(groupId);
                const user = await getGroupRole(groupId, auth.id);
                if (
                    group
                    && user
                ) {
                    const response = await fetch(
                        `https://groups.roblox.com/v1/groups/${group.groupId}/roles/${roleSetId}/users?limit=50${cursor ? `&cursor=${cursor}` : ""}`
                    );

                    if (response.status === 200) {
                        const body: {
                            previousPageCursor: string,
                            nextPageCursor: string,
                            data: {
                                buildersClubMembershipType: number,
                                hasVerifiedBadge: boolean,
                                userId: number,
                                username: string,
                                displayName: string
                            }[]
                        } = await response.json() as any;

                        let startOfPeriod = DateTime.now().setZone("Etc/UTC").minus({ days: 7 }).startOf("day").toJSDate();
                        const users = await prisma.user.findMany({
                            where: {
                                robloxId: {
                                    in: body.data ? body.data.map(d => d.userId.toString()) : []
                                }
                            },
                            include: {
                                events: {
                                    where: {
                                        isActive: true,
                                        archived: false,
                                        groupId: groupId,
                                        end: {
                                            lt: new Date(Date.now())
                                        }
                                    },
                                },
                                vacations: {
                                    where: {
                                        status: "APPROVED",
                                        groupId: groupId,
                                        OR: [
                                            {
                                                start: {
                                                    gte: startOfPeriod,
                                                    lt: new Date(Date.now())
                                                }
                                            },
                                            {
                                                end: {
                                                    gte: startOfPeriod,
                                                    lt: new Date(Date.now())
                                                }
                                            }
                                        ]
                                    }
                                }
                            },
                            
                        });

                        const activities = await prisma.groupActivity.findMany({
                            where: {
                                robloxId: {
                                    in: users.map(u => u.robloxId)
                                },
                                groupId: groupId,
                                isActive: true,
                                archived: false
                            }
                        });

                        let employees = [];
                        for (let i = 0; i < activities.length; i++) {
                            let activity = activities[i];
                            let index = employees.findIndex(e => e.robloxId === activity.robloxId);
                            if (index >= 0) {
                                employees[index].activites.push(activity)
                            } else {
                                let userIndex = users.findIndex(u => u.robloxId === activity.robloxId);
                                if (userIndex >= 0) {
                                    employees.push({
                                        ...users[userIndex],
                                        activites: [activity]
                                    })
                                }
                            }
                        }

                        for (let i = 0; i < users.length; i++) {
                            let user = users[i];
                            let index = employees.findIndex(e => e.robloxId === user.robloxId);
                            if (index < 0) {
                                employees.push({
                                    ...user,
                                    activites: []
                                });
                            }
                        }

                        return new Response(
                            JSON.stringify({
                                nextCursor: body.nextPageCursor,
                                previousCursor: body.previousPageCursor,
                                users: employees
                            })
                        )
                    } else {
                        throw Error("Unable to fetch users in role");
                    }
                } else {
                    throw Error("You cannot load this group's information")
                }
            } else {
                throw Error("A roleset id is required for a user search");
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
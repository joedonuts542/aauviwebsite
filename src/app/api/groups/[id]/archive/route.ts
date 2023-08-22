import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupRole, updateUsers } from "@/util/db/group";
import { prisma } from "@/util/db";
import { DateTime } from "luxon";
import { GroupActivity, GroupAlert, GroupEvent, GroupVacation, User } from "@prisma/client";

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
        const auth = await verifyAuth(req);
        const groupId = params.id;
        if (auth) {
            const group = await getGroup(groupId);
            const user = await getGroupRole(groupId, auth.id);

            if (
                user
                && (
                    user.role.admin
                    || user.role.humanResources
                )
            ) {
                const archive = await prisma.groupArchive.findFirst({
                    where: {
                        groupId
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });

                const lastDate = archive ? new Date(archive.createdAt).getTime() : (Date.now() - (1000 * 60 * 60 * 25));
                if (Date.now() - lastDate > (1000 * 60 * 60 * 24)) {
                    if (group.activityRequirement || group.sessionRequirement) {
                        const startOfPeriod = DateTime.now().setZone("Etc/UTC").minus({ days: 7 }).startOf("day").toJSDate();
                        const startOfThreeMonthPeriod = DateTime.now().setZone("Etc/UTC").minus({ months: 3 }).startOf("day").toJSDate();
                        let users: (User & {
                            events: GroupEvent[],
                            createdEvents: GroupEvent[],
                            activities?: GroupActivity[],
                            vacations: GroupVacation[],
                            alerts: GroupAlert[]
                        })[] = await prisma.user.findMany({
                            where: {
                                groups: {
                                    some: {
                                        groupId,
                                        role: {
                                            admin: false,
                                            publicRelations: false,
                                            humanResources: false,
                                            developer: false
                                        }
                                    }
                                },
                            },
                            include: {
                                vacations: {
                                    where: {
                                        groupId,
                                        OR: [
                                            {
                                                start: {
                                                    gte: startOfPeriod,
                                                    lte: new Date(Date.now())
                                                }
                                            },
                                            {
                                                end: {
                                                    gte: startOfPeriod,
                                                    lte: new Date(Date.now())
                                                }
                                            }
                                        ]
                                    }
                                },
                                events: {
                                    where: {
                                        archived: false,
                                        isActive: true,
                                        end: {
                                            lte: new Date(Date.now())
                                        },
                                        groupId
                                    },
                                },
                                createdEvents: {
                                    where: {
                                        archived: false,
                                        isActive: true,
                                        end: {
                                            lte: new Date(Date.now())
                                        },
                                        groupId
                                    }
                                },
                                alerts: {
                                    where: {
                                        type: "WARNING",
                                        createdAt: {
                                            gte: startOfThreeMonthPeriod,
                                            lte: new Date(Date.now())
                                        },
                                        groupId,
                                        isActive: true
                                    }
                                }
                            }
                        });

                        users = users.filter(u => u.vacations.length < 1);
                        if (
                            group.activityRequirement
                        ) {
                            const activities = await prisma.groupActivity.findMany({
                                where: {
                                    groupId,
                                    robloxId: {
                                        in: users.map(u => u.robloxId)
                                    },
                                    archived: false,
                                    end: {
                                        not: null
                                    },
                                    length: {
                                        not: null
                                    }
                                }
                            });

                            for (let i = 0; i < activities.length; i++) {
                                let activity = activities[i];
                                let index = users.findIndex(u => u.robloxId === activity.robloxId);
                                if (index >= 0) {
                                    if (users[index].activities) {
                                        users[index].activities!.push(activity)
                                    } else {
                                        users[index].activities = [
                                            activity
                                        ]
                                    }
                                }
                            }

                            if (!group.sessionRequirement) {
                                users = users.filter(u => 
                                    (
                                        u.activities
                                            ? (
                                                u.activities.map(a => a.length).reduce((a, b) => (a ? a : 0) + (b ? b : 0), 0)
                                                || 0
                                            ) / (1000 * 60 * 60)
                                            : 0
                                    ) < (group.activityRequirement || 0)
                                )
                            } else {
                                const activityRequirement = (group.activityRequirement || 0);
                                const sessionRequirement = (group.sessionRequirement || 0);
                                users = users.filter(u => (
                                    (
                                        (
                                            u.activities
                                                ? (
                                                    u.activities.map(a => a.length).reduce((a, b) => (a ? a : 0) + (b ? b : 0), 0)
                                                    || 0
                                                ) / (1000 * 60 * 60)
                                                : 0
                                        ) < (activityRequirement)
                                    ) || (
                                        (u.createdEvents.length + u.events.length) < (sessionRequirement)
                                    )
                                ));
                            }
                        } else if (
                            group.sessionRequirement
                        ) {
                            users = users.filter(u => (u.events.length + u.createdEvents.length) < (group.sessionRequirement || 0))
                        }

                        let toWarn = [];
                        let toTerminate = [];
                        for (let i = 0; i < users.length; i++) {
                            let user = users[i];
                            if (user.alerts.length >= (group.terminateAlerts - 1)) {
                                toTerminate.push(user);
                            } else {
                                toWarn.push(user);
                            }
                        }

                        await prisma.groupAlert.createMany({
                            data: toWarn.map(u => ({
                                groupId,
                                title: `Inactivity Warning`,
                                description: group.defaultWarning,
                                type: "WARNING",
                                targetId: u.id,
                                createdBy: auth.id
                            }))
                        });

                        await prisma.groupAlert.createMany({
                            data: toTerminate.map(u => ({
                                groupId,
                                title: `Inactivity Termination`,
                                description: group.defaultTermination,
                                type: "TERMINATION",
                                targetId: u.id,
                                createdBy: auth.id
                            }))
                        });

                        await prisma.groupArchive.create({
                            data: {
                                groupId,
                                terminateCount: toTerminate.length,
                                alertCount: toWarn.length,
                                createdBy: auth.id
                            }
                        });

                        await prisma.groupActivity.updateMany({
                            where: {
                                groupId,
                                archived: false,
                                end: {
                                    not: null
                                },
                                length: {
                                    not: null
                                }
                            },
                            data: {
                                archived: true
                            }
                        })

                        await prisma.groupEvent.updateMany({
                            where: {
                                groupId,
                                archived: false,
                                end: {
                                    lte: new Date(Date.now())
                                }
                            },
                            data: {
                                archived: true
                            }
                        })

                        return new Response(
                            JSON.stringify({
                                data: "Your archive has successfully run!"
                            }),
                            { status: 200 }
                        )
                    } else {
                        throw Error("There is no activity or event requirement set for this group");
                    }
                } else {
                    throw Error("You can only run an archive every twenty-four hours");
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
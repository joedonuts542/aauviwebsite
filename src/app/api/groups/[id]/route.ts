import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupOwner, getGroupRole, updateUsers } from "@/util/db/group";
import { prisma } from "@/util/db";
import { Group } from "@prisma/client";

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
        const id = params.id;
        if (auth && id) {
            const group = await getGroup(id);
            const owner = await getGroupOwner(id);

            const user = await prisma.groupUser.findFirstOrThrow({
                where: {
                    userId: auth.id,
                    groupId: id
                },
                include: {
                    role: true
                }
            });

            return new Response(
                JSON.stringify({
                    group,
                    owner,
                    user
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
                const editableGroup: Group & { sync?: boolean } = await req.json();

                if (
                    editableGroup
                ) {
                    await prisma.group.update({
                        where: {
                            id: groupId
                        },
                        data: {
                            name: editableGroup.name,
                            description: editableGroup.description,
                            discordUrl: editableGroup.discordUrl,
                            nodeTracking: editableGroup.nodeTracking,
                            nodeEvents: editableGroup.nodeEvents,
                            nodeVacations: editableGroup.nodeVacations,
                            nodeAlerts: editableGroup.nodeAlerts,
                            nodePartners: editableGroup.nodePartners,
                            nodeApplications: group.unlimited ? editableGroup.nodeApplications : false,
                            nodeAnalytics: editableGroup.nodeAnalytics,
                            nodeBoard: editableGroup.nodeBoard,
                            nodeFeedback: group.unlimited ? editableGroup.nodeFeedback : false,
                            nodeHelpdesk: group.unlimited ? editableGroup.nodeHelpdesk : false,
                            nodeAbuse: group.unlimited ? editableGroup.nodeAbuse : false,
                            trackingRank: editableGroup.trackingRank,
                            hostEvents: editableGroup.hostEvents,
                            joinEvents: editableGroup.joinEvents,
                            maxHelpers: editableGroup.maxHelpers,
                            activityRequirement: editableGroup.activityRequirement,
                            sessionRequirement: editableGroup.sessionRequirement,
                            suspensionRank: editableGroup.suspensionRank,
                            terminateAlerts: editableGroup.terminateAlerts,
                            defaultWarning: editableGroup.defaultWarning,
                            defaultTermination: editableGroup.defaultTermination,
                        }
                    });

                    if (
                        editableGroup.sync
                        && Date.now() - new Date(group.syncedAt).getTime() > (1000 * 60 * 60)
                        && editableGroup.trackingRank
                    ) {
                        await updateUsers(groupId, editableGroup.trackingRank);
                        await prisma.group.update({
                            where: {
                                id: groupId
                            },
                            data: {
                                syncedAt: new Date(Date.now())
                            }
                        });

                        return new Response(
                            JSON.stringify({
                                data: `${group.name} has been successfully synced!`
                            }),
                            { status: 200 }
                        );
                    }

                    return new Response(
                        JSON.stringify({
                            data: `${group.name} has been updated.`
                        })
                    );
                } else {
                    throw Error("Invalid group settings provided, all roles must be provided.");
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
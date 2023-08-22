import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { GroupFeedback } from "@prisma/client";

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
                const feedback = await prisma.groupFeedback.findMany({
                    where: {
                        groupId,
                        isActive: true
                    }
                });

                const response = await fetch(
                    `https://users.roblox.com/v1/users`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            userIds: feedback.map(f => Number(f.createdBy)),
                            excludeBannedUsers: false
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                if (response.status === 200) {
                    const body: {
                        data: {
                            hasVerifiedBadge: boolean,
                            id: number,
                            name: string,
                            displayName: string
                        }[]
                    } = await response.json() as any;

                    let mutatedFeedback: (GroupFeedback & { userName: string, displayName: string })[] = [];
                    for (let i = 0; i < feedback.length; i++) {
                        let post = feedback[i];
                        let index = body.data.findIndex(d => d.id === Number(post.createdBy));
                        if (index >= 0) {
                            mutatedFeedback.push({
                                ...post,
                                userName: body.data[index].name,
                                displayName: body.data[index].displayName
                            });
                        } else {
                            mutatedFeedback.push({
                                ...post,
                                userName: "Username",
                                displayName: "Display Name"
                            });
                        }
                    }

                    return new Response(
                        JSON.stringify({
                            feedback: mutatedFeedback
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Unable to load Roblox usernames");
                }
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

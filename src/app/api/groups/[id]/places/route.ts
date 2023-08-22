import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

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
            if (
                user.role.admin
                || user.role.developer
            ) {
                const places = await prisma.groupPlace.findMany({
                    where: {
                        groupId,
                        isActive: true
                    }
                });

                return new Response(
                    JSON.stringify({
                        places
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
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
            ) {
                const group = await getGroup(groupId);
                const { placeId }: {
                    placeId: string
                } = await req.json();

                if (placeId) {
                    const place = await prisma.groupPlace.findFirst({
                        where: {
                            groupId,
                            placeId
                        }
                    });

                    if (place) {
                        await prisma.groupPlace.update({
                            where: {
                                id: place.id
                            },
                            data: {
                                isActive: true
                            }
                        })
                    } else {
                        const response = await fetch(
                            `https://games.roblox.com/v2/groups/${group.groupId}/games?accessFilter=1&limit=50`
                        );
            
                        if (response.status === 200) {
                            const body: {
                                data: {
                                    id: number,
                                    name: string,
                                }[]
                            } = await response.json() as any;
            
                            if (body && body.data) {
                                let index = body.data.findIndex(d => d.id === Number(placeId));
                                if (index >= 0) {
                                    await prisma.groupPlace.create({
                                        data: {
                                            placeId,
                                            placeName: body.data[index].name,
                                            groupId
                                        }
                                    });
                                } else {
                                    throw Error("This place must be in the group");
                                }
                            } else {
                                throw Error("Unable to load Roblox group games");
                            }
                        } else {
                            throw Error("Failed to fetch group games");
                        }
                    }

                    return new Response(
                        JSON.stringify({
                            data: "Success!"
                        }),
                        { status: 200 }
                    );
                } else {
                    throw Error("You must provide a place ID");
                }
            } else {
                throw Error("You cannot manage this setting");
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

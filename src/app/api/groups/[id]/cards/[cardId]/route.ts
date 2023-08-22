import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { CardStatus } from "@prisma/client";

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            cardId: string,
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const cardId = params.cardId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);

            if (
                user.role.admin
                || user.role.developer
            ) {
                const {
                    status,
                }: {
                    status?: CardStatus
                } = await req.json();

                if (status) {
                    await prisma.groupCard.update({
                        where: {
                            id: cardId
                        },
                        data: {
                            status
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "Successfully marked this card as " + status,
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("A status is required");
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


export const DELETE = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            cardId: string,
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const cardId = params.cardId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);

            if (
                user.role.admin
                || user.role.developer
            ) {
                await prisma.cardTask.deleteMany({
                    where: {
                        cardId
                    }
                });

                await prisma.groupCard.delete({
                    where: {
                        id: cardId
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "Successfully deleted this card!"
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

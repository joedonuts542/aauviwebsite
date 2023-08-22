import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";

export const DELETE = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            feedbackId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const feedbackId = params.feedbackId;
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
            ) {
                const resolve = req.nextUrl.searchParams.get("resolve") === "true" ? true : false;
                if (resolve) {
                    const feedback = await prisma.groupFeedback.findFirstOrThrow({
                        where: {
                            id: feedbackId,
                            isActive: true
                        }
                    });

                    const place = await prisma.groupPlace.findFirstOrThrow({
                        where: {
                            id: feedback.placeId
                        }
                    });

                    await prisma.groupPlace.update({
                        where: {
                            id: feedback.placeId
                        },
                        data: {
                            averageRating: parseFloat((((place.averageRating * place.ratingEntries) + feedback.rating) / (place.ratingEntries + 1)).toFixed(1)),
                            ratingEntries: place.ratingEntries + 1
                        }
                    });
                }

                await prisma.groupFeedback.update({
                    where: {
                        id: feedbackId
                    },
                    data: {
                        isActive: false
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "Success!"
                    }),
                    { status: 200 }
                );
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

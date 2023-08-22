import { NextRequest } from "next/server";

import { getGroup } from "@/util/db/group";
import { prisma } from "@/util/db";
import { createHash, randomBytes } from "crypto";
import { Duration } from "luxon";

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
                token,
                users,
                placeId
            }: {
                token: string,
                users: {
                    id: number,
                    type: "join" | "leave",
                    timestamp?: number
                }[],
                placeId: number
            } = body;

            const group = await prisma.group.findFirstOrThrow({
                where: {
                    id
                }
            });
            const hash = createHash("sha256");
            hash.update(token);

            let successful: {
                id: number,
                data: string
            }[] = [];

            if (group.apiToken && group.apiToken === hash.digest("hex")) {
                for (let i = 0; i < users.length; i++) {
                    let u = users[i];
                    let exists = await prisma.groupActivity.findFirst({
                        where: {
                            robloxId: u.id.toString(),
                            end: null,
                            groupId: id
                        },
                    });

                    if (exists && u.type === "leave") {
                        let endDate = u.timestamp ? new Date(u.timestamp) : new Date(Date.now());
                        await prisma.groupActivity.update({
                            where: {
                                id: exists.id,
                            },
                            data: {
                                end: endDate,
                                length: endDate.getTime() - new Date(exists.start).getTime()
                            }
                        });
                    } else if (u.type === "join") {
                        successful.push({
                            id: u.id,
                            data: "Your time is now being logged on neuro."
                        })

                        let startDate = u.timestamp ? new Date(u.timestamp) : new Date(Date.now());
                        await prisma.groupActivity.create({
                            data: {
                                robloxId: u.id.toString(),
                                start: startDate,
                                groupId: id,
                                placeId: placeId ? placeId.toString() : undefined
                            }
                        });
                    }
                }

                return new Response(
                    JSON.stringify({
                        data: successful
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
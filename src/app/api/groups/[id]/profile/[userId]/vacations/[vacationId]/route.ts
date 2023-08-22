import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { VacationStatus } from "@prisma/client";

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string,
            userId: string,
            vacationId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const vacationId = params.vacationId;
        const userId = params.userId;
        const id = params.id;
        if (auth && id && userId && vacationId) {
            const role = await getGroupRole(id, auth.id);
            if (role && (
                role.role.admin
                || role.role.humanResources
                || role.role.publicRelations
                || role.role.developer
            )) {
                const {
                    status
                }: {
                    status?: VacationStatus
                } = await req.json();

                if (
                    status
                ) {
                    await prisma.groupVacation.update({
                        where: {
                            id: vacationId,
                        },
                        data: {
                            status
                        }
                    });

                    return new Response(
                        JSON.stringify({
                            data: "Success!"
                        }),
                        { status: 200 }
                    )
                } else {
                    throw Error("Missing request details");
                }
            } else {
                throw Error("You cannot modify this user's profile");
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
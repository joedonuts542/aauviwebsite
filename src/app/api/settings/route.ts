import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { prisma } from "@/util/db";

export const POST = async (
    req: NextRequest
) => {
    try {
        const auth = await verifyAuth(req);
        if (auth) {
            const {
                email
            }: {
                email?: string
            } = await req.json();

            if (email) {
                await prisma.user.update({
                    where: {
                        id: auth.id
                    },
                    data: {
                        email
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "Successfully updated user!"
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("An email is required to update your user");
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
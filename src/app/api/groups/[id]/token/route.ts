import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { createHash, randomBytes } from "crypto";

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
        const id = params.id;
        if (auth && id) {
            const role = await getGroupRole(id, auth.id);
            if (role.role.level >= 1000) {
                let rawToken = randomBytes(32);
                let hash = createHash("sha256");

                hash.update(rawToken.toString("hex"));

                await prisma.group.update({
                    where: {
                        id
                    },
                    data: {
                        apiToken: hash.digest("hex")
                    }
                });

                return new Response(
                    JSON.stringify({
                        token: rawToken.toString("hex")
                    }),
                    { status: 200 }
                );
            } else {
                throw Error("You cannot generate group secrets");
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
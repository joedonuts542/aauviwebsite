import { getRobloxContext, refreshTokens, robloxUserInfo } from "@/util/roblox/auth.server";
import type { User } from "@prisma/client";

import { NextRequest } from "next/server";
import { prisma } from "..";
import { decryptCookie } from "@/util/crypto.server";

export const verifyAuth = async (
    req: NextRequest,
    noBeta?: true
): Promise<User | false> => {
    try {
        const clientCookie = req.cookies.get("neuro-client-id");
        const userCookie = req.cookies.get("neuro-user-id");
        
        if (clientCookie && userCookie) {
            const session = await prisma.userSession.findFirstOrThrow({
                where: {
                    id: userCookie.value
                },
            });

            if (
                !session.expired
                || Date.now() < new Date(session.expiresAt).getTime()
            ) {
                const decrypted = await decryptCookie(session.cookie, session.iv);
                if (decrypted === clientCookie.value) {
                    const user = await prisma.user.findFirstOrThrow({
                        where: {
                            id: session.userId
                        }
                    });

                    return user;
                } else {
                    return false;
                }
            } else {
                if (!session.expired) {
                    await prisma.userSession.update({
                        where: {
                            id: userCookie.value
                        },
                        data: {
                            expired: true
                        }
                    })
                }

                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}
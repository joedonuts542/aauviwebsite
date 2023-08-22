import { encryptCookie } from "@/util/crypto.server";
import { prisma } from "@/util/db";
import { getRobloxContext, getTokens } from "@/util/roblox/auth.server";

import { randomBytes } from "crypto";
import { NextRequest } from "next/server";

export const GET = async (
    req: NextRequest
) => {
    try {
        const params = req.nextUrl.searchParams;
        const code = params.get("code");

        if (code) {
            let tokens = await getTokens(code);
            if (!tokens) { throw Error("Unable to fetch tokens: expired auth code") }

            let userInfo = await getRobloxContext(tokens.access_token);
            if (!userInfo) { throw Error("Unable to load user data: insufficient permissions") }

            try {
                const record = await prisma.user.findFirst({
                    where: {
                        robloxId: userInfo.sub
                    }
                })

                if (!record) {
                    await prisma.user.create({
                        data: {
                            robloxId: userInfo.sub,
                            status: "ONLINE",
                            name: userInfo.name,
                            nickname: userInfo.nickname,
                            preferredUsername: userInfo.preferred_username
                        }
                    })
                }
            } catch (error) {
                console.log("Failed to create account: user already exists");
            }

            const session = randomBytes(128).toString("hex");
            const encrypted = await encryptCookie(session)
            const sessionObject = await prisma.userSession.create({
                data: {
                    cookie: encrypted.secret,
                    iv: encrypted.iv,
                    expiresAt: new Date(Date.now() + (1000 * 60 * 60 * 24)),
                    user: {
                        connect: {
                            robloxId: userInfo.sub
                        }
                    }
                }
            });

            return new Response(
                JSON.stringify({
                    data: "Success!"
                }),
                {
                    status: 200,
                    headers: {
                        "Set-Cookie": `neuro-client-id=${session}; Max-Age=${60 * 60 * 24}; Path=/, neuro-user-id=${sessionObject.id}; Max-Age=${60 * 60 * 24}; Path=/`
                    }
                }
            );
        } else {
            throw Error("No authorization code provided");
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
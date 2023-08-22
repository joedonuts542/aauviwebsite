"use server";

import { verifyAuth } from "@/util/db/auth";
import { NextRequest } from "next/server";

export const GET = async (
    req: NextRequest
) => {
    try {
        const auth = await verifyAuth(req, true);
        if (auth) {
            return new Response(
                JSON.stringify({
                    data: auth
                }),
                { status: 200 }
            )
        } else {
            throw Error("Invalid authorization");
        }
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: (error as Error).message,
            }),
            { status: 500 }
        )
    }
}
import { NextRequest } from "next/server";
import fetch from "node-fetch";

export const GET = async (
    req: NextRequest
) => {
    try {
        const target = new URL(`https://thumbnails.roblox.com/v1/users/avatar-headshot?${req.nextUrl.searchParams.toString()}`)
        const response = await fetch(
            target,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        )

        if (response.status === 200) {
            const body = await response.json() as { data: any[] };
            return new Response(
                JSON.stringify(body),
                { status: 200 }
            )
        } else {
            throw Error("Unable to fetch user avatar headshow...");
        }
    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({
                error: (error as Error).message
            })
        ),
        { status: 500 }
    }
}
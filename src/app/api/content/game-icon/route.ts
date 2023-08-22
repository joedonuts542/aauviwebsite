import { NextRequest } from "next/server";
import fetch from "node-fetch";

export const GET = async (
    req: NextRequest
) => {
    try {
        const placeId = req.nextUrl.searchParams.get("placeId");
        const response = await fetch(
            `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
        );

        if (response.status === 200) {
            const body: {
                universeId: number
            } = await response.json() as { universeId: number };

            if (body && body.universeId) {
                const universeId: number = body.universeId;
                const target = new URL(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&${req.nextUrl.searchParams.toString()}`)
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
                    throw Error("Unable to fetch group logo...");
                }
            } else {
                throw Error("Unable to load Roblox universe body");
            }
        } else {
            throw Error("Failed to fetch place universe");
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
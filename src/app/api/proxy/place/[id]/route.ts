import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";
import { getGroup, getGroupOwner, getGroupRole } from "@/util/db/group";
import { prisma } from "@/util/db";
import { getUser } from "@/util/db/user";
import fetch from "node-fetch";

export const GET = async (
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
        const placeId = Number(params.id);
        if (auth) {
            const response = await fetch(
                `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
            );

            if (response.status === 200) {
                const body: {
                    universeId: number
                } = await response.json() as { universeId: number };

                if (body && body.universeId) {
                    const universeId: number = body.universeId;
                    const mediaResponse = await fetch(`https://games.roblox.com/v2/games/${universeId}/media`);
                    const contentResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);

                    if (mediaResponse.status === 200 && contentResponse.status === 200) {
                        const mediaBody: any = await mediaResponse.json();
                        const contentBody: any = await contentResponse.json();
                        if (mediaBody && contentBody) {
                            const assetId = mediaBody.data.filter((d: { assetTypeId: number }) => d.assetTypeId === 1)[0].imageId;

                            let imageUrl = "";
                            let name = contentBody.data[0].name;

                            const thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/games/${universeId}/thumbnails?thumbnailIds=${assetId}&format=png&size=768x432`);
                            if (thumbnailResponse) {
                                const thumbnailBody: any = await thumbnailResponse.json();
                                console.log(thumbnailBody);
                                if (thumbnailBody &&  thumbnailBody.data && thumbnailBody.data.length > 0) {
                                    imageUrl = thumbnailBody.data[0].imageUrl
                                }
                            }

                            return new Response(
                                JSON.stringify({
                                    name,
                                    imageUrl
                                })
                            )
                        } else {
                            throw Error("Unable to load Roblox game body");
                        }
                    } else  {
                        throw Error("Failed to fetch place media and content");
                    }
                } else {
                    throw Error("Unable to load Roblox universe body");
                }
            } else {
                throw Error("Failed to fetch place universe");
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
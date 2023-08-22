import dotenv from "dotenv";

export const GET = () => {
    return new Response(
        JSON.stringify({
            data: `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.ROBLOX_APP}&redirect_uri=${process.env.HOST}/auth/redirect&scope=openid+profile&response_type=Code&prompts=login+consent&nonce=12345&state=6789`
        }),
        { status: 200 }
    )
}
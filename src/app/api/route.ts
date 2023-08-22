import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    return new Response(
        JSON.stringify({
            success: true,
            message: "All services online :: status check passed",
            errors: []
        }),
        { status: 200 }
    )
}
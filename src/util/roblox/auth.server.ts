import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export type tokenObject = {
    access_token: string,
    refresh_token: string,
    token_type: string,
    expires_in: number,
    id_token: string,
    scop: string
};

export type robloxUserInfo = {
    sub: string,
    name: string,
    nickname: string,
    preferred_username: string,
    created_at: number,
    profile: string
};

export const getTokens = async (
    code: string
): Promise<tokenObject | null> => {
    try {
        const form = new URLSearchParams();
        form.set("code", code);
        form.set("client_id", process.env.ROBLOX_APP as string);
        form.set("client_secret", process.env.ROBLOX_SECRET as string);
        form.set("grant_type", "authorization_code");
        console.log(form.get("grant_type"));

        let response = await fetch("https://apis.roblox.com/oauth/v1/token", {
            body: form,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        if (response.status === 200) {
            const data = await response.json() as any;
            if (data.access_token) {
                return data as tokenObject
            } else {
                throw Error()
            }
        } else {
            throw Error();
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const refreshTokens = async (
    refresh: string
): Promise<tokenObject | null> => {
    try {
        const form = new URLSearchParams();
        form.append("refresh_token", refresh);
        form.append("client_id", process.env.ROBLOX_APP as string);
        form.append("client_secret", process.env.ROBLOX_SECRET as string);
        form.append("grant_type", "refresh_token");

        let response = await fetch("https://apis.roblox.com/oauth/v1/token", {
            body: form,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        if (response.status === 200) {
            const data = await response.json() as any;
            if (data.access_token) {
                return data as tokenObject
            } else {
                throw Error()
            }
        } else {
            throw Error();
        }
    } catch (error) {
        return null;
    }
}

export const getRobloxContext = async (
    token: string
): Promise<robloxUserInfo | null> => {
    try {
        let response = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        if (response.status === 200) {
            const data = await response.json() as any;
            if (data.sub) {
                return data as robloxUserInfo
            } else {
                throw Error()
            }
        } else {
            throw Error();
        }
    } catch (error) {
        return null;
    }
}
import dotenv from "dotenv";
import { 
    randomBytes, 
    createCipheriv, 
    createDecipheriv,
} from "crypto";

dotenv.config();

export const encryptCookie = async (
    cookie: string
): Promise<{ secret: string, iv: string }> => {
    try {
        const iv = randomBytes(16);
        const secret = process.env.COOKIE_KEY;
        let cipher = createCipheriv(
            "aes-256-cbc",
            Buffer.from(secret!, "hex"),
            iv
        )

        let encrypted = cipher.update(cookie, "utf-8", "hex");
        encrypted = encrypted + cipher.final("hex")

        return {
            secret: encrypted,
            iv: iv.toString("hex")
        }
    } catch (error) {
        console.log(error);
        throw Error();
    }
}

export const decryptCookie = async (
    cookie: string,
    iv: string
): Promise<string> => {
    try {
        const secret = process.env.COOKIE_KEY;
        let decipher = createDecipheriv(
            "aes-256-cbc",
            Buffer.from(secret!, "hex"),
            Buffer.from(iv, "hex")
        );

        let decrypted = decipher.update(cookie, "hex", "utf-8");
        decrypted = decrypted + decipher.final("utf-8");
        return decrypted;
    } catch (error) {
        throw Error();
    }
}
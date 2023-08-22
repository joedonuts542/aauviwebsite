import { prisma } from "..";

export const getUser = async (
    userId: string
) => {
    try {
        return await prisma.user.findFirstOrThrow({
            where: {
                id: userId
            }
        })
    } catch (error) {
        return null;
    }
}
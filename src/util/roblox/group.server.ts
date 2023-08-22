import fetch from "node-fetch";

export const getUserRank = async (
    groupId: string,
    userId: string
): Promise<number> => {
    try {
        const response = await fetch(
            `https://groups.roblox.com/v2/users/${userId}/groups/roles`
        );

        const body = await response.json() as any;
        if (body.data && Array.isArray(body.data)) {
            let foundIndex = body.data.findIndex((g: any) => g.group.id === groupId);
            if (foundIndex >= 0) {
                return body.data[foundIndex].role.rank
            } else {
                return 0;
            }
        } else {
            throw Error();
        }
    } catch (error) {
        return 0;
    }
}
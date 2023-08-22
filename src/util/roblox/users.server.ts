import fetch from "node-fetch";

export type rolesResponse = {
    groupId: number;
    roles: {
        id: number;
        name: string;
        description: string;
        rank: number;
        memberCount: number
    }[];
}

export type usersResponse = {
    previousPageCursor?: string;
    nextPageCursor?: string;
    data: {
        buildersClubMembershipType: number,
        hasVerifiedBadge: boolean,
        userId: number,
        username: string,
        displayName: string
    }[];
}

export const getGroupRoles = async (
    id: number
) => {
    try {
        const response = await fetch(
            `https://groups.roblox.com/v1/groups/${id}/roles`
        );

        if (response.status === 200) {
            const body = await response.json() as rolesResponse;
            return body
        } else {
            throw Error("Unable to fetch group roles");
        }
    } catch (error) {
        return `${error}`;
    }
}

export const getUsersInRole = async (
    id: number,
    role: number,
    cursor?: string
) => {
    try {
        const response = await fetch(
            `https://groups.roblox.com/v1/groups/${id}/roles/${role}/users?limit=100${cursor ? `&cursor=${cursor}` : ""}`
        );

        if (response.status === 200) {
            const body = await response.json() as usersResponse;
            console.log(body);
            return body
        } else {
            throw Error("Unable to fetch group roles");
        }
    } catch (error) {
        return null;
    }
}

export const getUsersInGroup = async (
    id: number,
    minRank: number
) => {
    try {
        const roles = await getGroupRoles(id);
        if (typeof roles === "string") {
            throw Error(roles);
        } else {
            const groupRoles = roles.roles.filter(r => r.rank >= minRank);
            const totalMembers = groupRoles.map(r => r.memberCount).reduce((a, b) => a + b, 0);
            if (totalMembers <= 1000) {
                let users: usersResponse["data"] = [];
                for (let i = 0; i < groupRoles.length; i++) {
                    let role = groupRoles[i];
                    let usersInRole: usersResponse["data"] = [];
                    let response = await getUsersInRole(id, role.id);
                    if (response) {
                        usersInRole.push(...response.data);
                        while (response?.nextPageCursor) {
                            response = await getUsersInRole(id, role.id, response.nextPageCursor)
                            if (response) {
                                usersInRole.push(...response.data);
                            }
                        }
                    }

                    users = [...users, ...usersInRole]
                }

                return users;
            } else {
                throw Error("Groups are limited to 1000 members right now");
            }
        }
    } catch (error) {
        return `${error}`
    }
}
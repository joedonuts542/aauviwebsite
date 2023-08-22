import type { 
    Group, GroupMessage, User 
} from "@prisma/client";

import { prisma } from "..";
import { getUsersInGroup, usersResponse } from "@/util/roblox/users.server";

export type NewGroup = {
    name?: string
    description?: string,
    groupId?: number,
    discordUrl?: string
}

export type NewGroupMessage = {
    title?: string,
    body?: string,
    link?: string
}

export type GroupDetails = Group & {
    _count: {
        users: number
    }
}

export type GroupMessageDetails = GroupMessage & {
    author: User
}

export const getGroup = async (
    id: string
) => {
    try {
        const group = await prisma.group.findFirstOrThrow({
            where: {
                id: id
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                },
            }
        });

        return {
            ...group,
            apiToken: null
        }
    } catch (error) {
        throw Error();
    }
}

export const getGroupOwner = async (
    id: string,
) => {
    try {
        return await prisma.user.findFirstOrThrow({
            where: {
                groups: {
                    some: {
                        groupId: id,
                        role: {
                            level: 1000
                        }
                    }
                }
            }
        });
    } catch (error) {
        throw Error();
    }
}

export const getGroupMessages = async (
    id: string,
    skip?: number
) => {
    try {
        return await prisma.groupMessage.findMany({
            where: {
                groupId: id,
                isActive: true
            },
            include: {
                author: true,
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: skip,
            take: 10
        });
    } catch (error) {
        throw Error();
    }
}

export const getGroupRole = async (
    id: string,
    userId: string
) => {
    try {
        return await prisma.groupUser.findFirstOrThrow({
            where: {
                groupId: id,
                userId
            },
            include: {
                role: true
            }
        });
    } catch (error) {
        throw Error();
    }
}

export const getGroupUsers = async (
    id: string
) => {
    try {
        return await prisma.groupUser.findMany({
            where: {
                groupId: id,
            },
            include: {
                user: true,
                role: true
            }
        });
    } catch (error) {
        throw Error();
    }
}

export const updateUsers = async (
    groupId: string,
    minRank: number
) => {
    try {
        const group = await getGroup(groupId);
        const existingUsers = await getGroupUsers(groupId);
        const users = await getUsersInGroup(Number(group.groupId), minRank);
        if (Array.isArray(users)) {
            let toDelete: string[] = [];
            let toAdd: usersResponse["data"] = [];
            for (let i = 0; i < existingUsers.length; i++) {
                let user = existingUsers[i];
                let index = users.findIndex(u => u.userId === Number(user.user.robloxId))
                if (index < 0 && !user.role.admin && user.role.level < 1000) {
                    toDelete.push(user.userId);
                }
            }

            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let index = existingUsers.findIndex(u => u.user.robloxId.toString() === user.userId.toString());
                if (index < 0) {
                    toAdd.push(user);
                }
            }

            let neuroUsers = await prisma.user.findMany({
                where: {
                    robloxId: {
                        in: toAdd.map(u => u.userId.toString())
                    }
                }
            });

            let toCreate: usersResponse["data"] = [];
            for (let i = 0; i < toAdd.length; i++) {
                let user = toAdd[i];
                let existingUser = neuroUsers.findIndex(u => u.robloxId === user.userId.toString())
                if (existingUser < 0) {
                    toCreate.push(user);
                }
            }

            await prisma.user.createMany({
                data: toCreate.map(u => ({
                    robloxId: u.userId.toString(),
                    name: u.displayName ? u.displayName : u.username,
                    nickname: u.displayName ? u.displayName : u.username,
                    preferredUsername: u.username,
                    status: "OFFLINE"
                }))
            });

            neuroUsers = await prisma.user.findMany({
                where: {
                    robloxId: {
                        in: toAdd.map(u => u.userId.toString())
                    }
                }
            });

            let userIds: string[] = [];
            for (let i = 0; i < toAdd.length; i++) {
                let user = toAdd[i];
                let existingUser = neuroUsers.findIndex(u => u.robloxId === user.userId.toString())
                if (existingUser >= 0) {
                    userIds.push(neuroUsers[existingUser].id)
                }
            }

            const roleId = await prisma.userRole.findFirstOrThrow({
                where: {
                    level: 100
                },
                select: {
                    id: true
                }
            })

            await prisma.groupUser.createMany({
                data: userIds.map(uid => ({
                    userId: uid,
                    groupId: groupId,
                    roleId: roleId.id
                }))
            });

            await prisma.groupUser.deleteMany({
                where: {
                    id: {
                        in: toDelete
                    }
                }
            });
        } else {
            throw Error(users);
        }
    } catch (error) {
        throw Error(`${error}`);
    }
}
"use client";

import { createContext, useState, useContext } from "react";

import type { GroupDetails } from "@/util/db/group";
import { GroupUser, User, UserRole } from "@prisma/client";

export type UserScope = GroupUser & {
    role: UserRole
}

export type groupContext = {
    group: GroupDetails | null,
    user: UserScope | null,
    owner: User | null,
    setGroup: React.Dispatch<React.SetStateAction<GroupDetails | null>> | null,
    setUser: React.Dispatch<React.SetStateAction<UserScope | null>> | null,
    setOwner: React.Dispatch<React.SetStateAction<User | null>> | null,
}

const authContext = createContext<groupContext>({
    group: null,
    user: null,
    owner: null,
    setGroup: null,
    setUser: null,
    setOwner: null
})

export const GroupProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [user, setUser] = useState<UserScope | null>(null);
    const [owner, setOwner] = useState<User | null>(null);
    return <authContext.Provider
        value={{
            group, 
            user,
            owner,
            setGroup,
            setUser,
            setOwner
        }}
    >
        {children}
    </authContext.Provider>
}

export const useGroup = () => useContext(authContext)
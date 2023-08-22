"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";

import { HiX } from "react-icons/hi";
import { useAuth } from "./auth";
import { Avatar } from "@/components/content/Avatar";
import { GroupList } from "@/components/client/GroupList";
import { MoonLoader } from "react-spinners";

export default function ClientPage() {
    const auth = useAuth();

    const [state, setState] = useState<boolean>(false);
    const cache = useSWR(`/api`, fetch);

    return auth.user
        ? (
            <div
                className="flex flex-col gap-12"
            >
                <div
                    className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
                >
                    <div
                        className="flex flex-row my-auto gap-8"
                    >
                        <Avatar
                            className="w-8 h-8 rounded-full my-auto"
                            userId={auth.user!.robloxId}
                            onError={() => (
                                <></>
                            )}
                        />
                        <span
                            className="text-indigo-950 text-md my-auto"
                        >Welcome back to neuro, <b>{auth.user?.name}!</b></span>
                    </div>
                </div>
                <GroupList />
            </div>
        )
        : (
            <div
                className="w-full h-screen"
            >
                <MoonLoader
                    size={32}
                    className={"flex mx-auto my-auto"}
                    color={"#6366f1"}
                />
            </div>
        )
}
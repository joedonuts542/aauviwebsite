"use client";

import { useGroup } from "../../group";
import { useAuth } from "@/app/client/auth";
import { GroupApps } from "@/components/client/application/GroupApps";

import { GroupHeader } from "@/components/client/GroupHeader";
import { MoonLoader } from "react-spinners";

export default function Page() {
    const group = useGroup();
    const auth = useAuth();

    return (
        group.group && group.owner
    ) ? (
        <div
            className="flex flex-col gap-12"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <GroupApps />
        </div>
    ) : (
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
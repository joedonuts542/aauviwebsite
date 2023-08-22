"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";

import { GroupHeader } from "@/components/client/GroupHeader";
import { GroupStats } from "@/components/client/GroupStats";
import { GroupSwimlanes } from "@/components/client/GroupSwimlanes";
import { GroupMonitors } from "@/components/client/GroupMonitor";

export default function GroupPage() {
    const group = useGroup();
    const path = usePathname();
    const auth = useAuth();

    return (
        group.group && group.owner
    ) ? (
        <div
            className="flex flex-col gap-4"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <GroupMonitors />
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
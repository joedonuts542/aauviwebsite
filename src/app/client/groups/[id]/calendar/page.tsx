"use client";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";
import { GroupHeader } from "@/components/client/GroupHeader";
import { GroupCalendar } from "@/components/client/GroupCalendar";

export default function GroupPage() {
    const group = useGroup();
    const auth = useAuth();

    return (
        group.group
        && group.owner
        && group.user
    ) ? (
        <div
            className="flex flex-col gap-4"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <GroupCalendar 
                group={group.group}
            />
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
"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";

import { GroupHeader } from "@/components/client/GroupHeader";
import { GroupHelpdesk } from "@/components/client/GroupHelpdesk";

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
            <GroupHelpdesk />
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
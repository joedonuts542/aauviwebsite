"use client";

import { CreateApp } from "@/components/client/application/CreateApp";
import { useGroup } from "../../../group";
import { useAuth } from "@/app/client/auth";

import { GroupHeader } from "@/components/client/GroupHeader";
import { MoonLoader } from "react-spinners";

export default function Page() {
    const group = useGroup();
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
            <CreateApp />
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
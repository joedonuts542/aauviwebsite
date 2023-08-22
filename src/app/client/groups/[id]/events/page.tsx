"use client";

import useSWR from "swr";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";
import { GroupHeader } from "@/components/client/GroupHeader";
import { toast } from "react-hot-toast";
import { Input, Select } from "@/components/form/TextInput";
import { DateTime } from "luxon";
import { HiDownload } from "react-icons/hi";
import { GroupEvents } from "@/components/client/GroupEvents";

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
            <GroupEvents 
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
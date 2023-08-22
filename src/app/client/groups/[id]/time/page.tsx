"use client";

import useSWR from "swr";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { toast } from "react-hot-toast";

import {
    HiChatAlt,
    HiDotsVertical,
    HiTrash
} from "react-icons/hi";

import { MoonLoader } from "react-spinners";

import { Logo } from "@/components/content/Logo";
import { GroupMessages } from "@/components/client/GroupMessages";
import { Dropdown } from "@/components/form/Dropdown";
import { GroupHeader } from "@/components/client/GroupHeader";
import { GroupStats } from "@/components/client/GroupStats";
import { GroupEmployees } from "@/components/client/GroupEmployees";

export default function GroupPage() {
    const group = useGroup();
    const path = usePathname();
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
            <GroupEmployees
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
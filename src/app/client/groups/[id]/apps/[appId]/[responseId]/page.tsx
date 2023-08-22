"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { useGroup } from "../../../../group";

import { GroupHeader } from "@/components/client/GroupHeader";
import { MoonLoader } from "react-spinners";
import { Tabs } from "@/components/form/Tabs";
import { AppDetails } from "@/components/client/application/AppDetails";
import { AppQuestions } from "@/components/client/application/AppQuestions";
import { AppResponses } from "@/components/client/application/AppResponses";
import { AppResponse } from "@/components/client/application/AppResponse";

export default function Page() {
    const group = useGroup();

    return (
        group.group
        && group.owner
    ) ? (
        <div
            className="flex flex-col gap-4"
        >
            <AppResponse
                type={"GROUP"}
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
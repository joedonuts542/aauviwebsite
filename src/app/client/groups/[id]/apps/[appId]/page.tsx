"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { useGroup } from "../../../group";

import { GroupHeader } from "@/components/client/GroupHeader";
import { MoonLoader } from "react-spinners";
import { Tabs } from "@/components/form/Tabs";
import { AppDetails } from "@/components/client/application/AppDetails";
import { AppQuestions } from "@/components/client/application/AppQuestions";
import { AppResponses } from "@/components/client/application/AppResponses";

export default function Page() {
    const group = useGroup();

    return (
        group.group
        && group.owner
    ) ? (
        <div
            className="flex flex-col gap-4"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <Tabs
                tabs={[
                    {
                        key: "overview",
                        display: "General Details",
                        content: (
                            <AppDetails />
                        )
                    },
                    {
                        key: "questions",
                        display: "Questions",
                        content: (
                            <AppQuestions />
                        )
                    },
                    {
                        key: "pending",
                        display: "Pending Applications",
                        content: (
                            <AppResponses status="PENDING" />
                        )
                    },
                    {
                        key: "approved",
                        display: "Approved Applications",
                        content: (
                            <AppResponses status="ACCEPTED" />
                        )
                    },
                    {
                        key: "declined",
                        display: "Declined Applications",
                        content: (
                            <AppResponses status="DENIED" />
                        )
                    }
                ]}
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
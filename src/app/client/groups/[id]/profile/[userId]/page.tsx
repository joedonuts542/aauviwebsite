"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "../../../../auth";
import { useGroup } from "../../../group";

import { MoonLoader } from "react-spinners";

import { ProfileHeader } from "@/components/client/ProfileHeader";
import { Tabs } from "@/components/form/Tabs";

import { Time } from "@/components/client/profile/Time";
import { Events } from "@/components/client/profile/Events";
import { Alerts } from "@/components/client/profile/Alerts";
import { Vacations } from "@/components/client/profile/Vacations";

export default function ProfilePage() {
    const group = useGroup();
    const auth = useAuth();
    const path = usePathname();

    const [userId, setUserId] = useState<string>();
    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        setUserId(path.split("/")[5] || "");
    }, [path])

    return (
        group.group && group.owner && group.user && auth.user && userId
    ) ? (
        <div
            className="flex flex-col gap-4"
        >
            <ProfileHeader
                user={group.user}
                auth={auth.user}
                group={group.group}
                userId={userId}
            />
            <Tabs
                tabs={[
                    {
                        key: "time",
                        display: "Time Entries",
                        content: (
                            <Time
                                group={group}
                                auth={auth}
                                version={version}
                                id={userId}
                                refresh={() => {
                                    setVersion(version + 1);
                                }}
                            />
                        )
                    },
                    {
                        key: "events",
                        display: "Events",
                        content: (
                            <Events
                                group={group}
                                auth={auth}
                                version={version}
                                id={userId}
                                refresh={() => {
                                    setVersion(version + 1);
                                }}
                            />
                        )
                    },
                    {
                        key: "alerts",
                        display: "Alerts",
                        content: (
                            <Alerts
                                group={group}
                                auth={auth}
                                version={version}
                                id={userId}
                                refresh={() => {
                                    setVersion(version + 1);
                                }}
                            />
                        )
                    },
                    {
                        key: "vacations",
                        display: "Vacations",
                        content: (
                            <Vacations
                                group={group}
                                auth={auth}
                                version={version}
                                id={userId}
                                refresh={() => {
                                    setVersion(version + 1);
                                }}
                            />
                        )
                    }
                ]}
            />
        </div >
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
import useSWR from "swr";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { useGroup } from "@/app/client/groups/group";
import { MoonLoader } from "react-spinners";

import { ApplicationInstance, ApplicationQuestion, GroupApplication, QuestionInstance } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Avatar } from "@/components/content/Avatar";
import { Logo } from "@/components/content/Logo";

type RobloxGroup = {
    group: {
        id: number,
        name: string,
        memberCount: number,
        hasVerifiedBadge: boolean
    },
    role: {
        id: number,
        name: string,
        rank: number
    }
}

export const AppResponse = (props: {
    type: "USER" | "GROUP"
}) => {
    const { appId, responseId } = useParams();
    const group = useGroup();

    const [groups, setGroups] = useState<RobloxGroup[]>([]);
    const [app, setApp] = useState<(
        ApplicationInstance & {
            questions: (QuestionInstance & {
                question: ApplicationQuestion
            })[],
            application: (GroupApplication & {
                group: {
                    groupId: string,
                    name: string
                }
            })
        }
    )>();

    const appsCache = useSWR(
        `/api/groups/${group.group?.id}/apps/${appId}/${responseId}`,
        fetch
    );

    useEffect(() => {
        if (
            !appsCache.isLoading
            && appsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await appsCache.data!.json();
                    if (body.app) {
                        setApp(body.app);
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [appsCache]);

    const groupsCache = useSWR(
        () => {
            return app && app.userId ? `/api/proxy/groups/${app.userId}?noFilter=true` : null
        },
        fetch
    );

    useEffect(() => {
        if (
            !groupsCache.isLoading
            && groupsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await groupsCache.data!.json();
                    if (body.groups) {
                        setGroups(body.groups);
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [groupsCache]);



    const [saving, setSaving] = useState<boolean>(false);
    const save = async (type: "ACCEPTED" | "DENIED") => {
        if (!saving && group.group) {
            setSaving(true);
            const response = await fetch(
                `/api/groups/${group.group.id}/apps/${appId}/${responseId}?status=${type}`,
                {
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        toast.success(body.data)
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot run a new archive.")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setSaving(false);
            }
        }
    }

    return (app) ? (
        <div
            className="flex flex-col gap-4"
        >
            {
                props.type === "USER"
                    ? <div
                        className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
                    >
                        <div
                            className="flex flex-row my-auto gap-8"
                        >
                            <Logo
                                className="w-16 h-16 rounded-lg my-auto"
                                groupId={app.application.group.groupId}
                                onError={() => (
                                    <></>
                                )}
                            />
                            <div
                                className="flex flex-col my-auto"
                            >
                                <span
                                    className="text-indigo-950 text-lg font-bold"
                                >{app.application.group.name}</span>
                                <span
                                    className="text-indigo-950 text-sm"
                                >submitted on {new Date(app.createdAt).toDateString()}</span>
                            </div>
                        </div>
                    </div>
                    : <div
                        className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
                    >
                        <div
                            className="flex flex-row my-auto gap-8"
                        >
                            {
                                app.userId
                                && <Avatar
                                    className="w-16 h-16 rounded-lg my-auto"
                                    userId={app.userId}
                                    onError={() => (
                                        <></>
                                    )}
                                />
                            }
                            <div
                                className="flex flex-col my-auto"
                            >
                                <span
                                    className="text-indigo-950 text-lg font-bold"
                                >{app.userName || "Anonymous Application"}</span>
                                <span
                                    className="text-indigo-950 text-sm"
                                >submitted on {new Date(app.createdAt).toDateString()}</span>
                            </div>
                        </div>
                    </div>
            }
            <div
                className="flex flex-col lg:flex-row w-full gap-4"
            >
                <div
                    className="flex flex-col w-full gap-4"
                >
                    {
                        app.questions.map((q, i) => (
                            <div
                                key={i}
                                className="flex flex-col w-full bg-indigo-50 shadow-md rounded-md p-8"
                            >
                                <div
                                    className="flex flex-row gap-2 mb-4"
                                >
                                    <span
                                        className="flex flex-col text-indigo-50 text-lg font-semibold rounded-full bg-indigo-500 w-8 h-8 my-auto text-center justify-center"
                                    >
                                        {i + 1}
                                    </span>
                                    <span
                                        className="text-indigo-950 text-md font-semibold my-auto"
                                    >{q.question.title}</span>
                                </div>
                                <span
                                    className="text-indigi-950 text-sm"
                                >{q.response}</span>
                                <span
                                    className="text-indigo-950 text-xs"
                                >Weight: {q.question.weight || 0}{q.question.required ? ` - Required` : ""}</span>
                            </div>
                        ))
                    }
                </div>
                <div
                    className="flex flex-col gap-4 w-full lg:w-[26rem]"
                >
                    {
                        props.type === "GROUP"
                        && <div
                            className="flex flex-row gap-4 rounded-md shadow-md p-8 bg-indigo-50 w-full"
                        >
                            <button
                                type="button"
                                className="flex flex-row w-full justify-center py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-green-500 text-indigo-50 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-default transition duration-200 font-semibold"
                                onClick={() => save("ACCEPTED")}
                                disabled={saving}
                            >APPROVE</button>
                            <button
                                type="button"
                                className="flex flex-row w-full justify-center py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-red-500 text-indigo-50 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-default transition duration-200 font-semibold"
                                onClick={() => save("DENIED")}
                                disabled={saving}
                            >DECLINE</button>
                        </div>
                    }
                    {
                        groups.length > 0
                            ? <div
                                className="flex flex-col min-h-36 max-h-96 overflow-y-auto w-full gap-4"
                            >
                                {
                                    groups.sort((a, b) => b.group.id.toString() === app.application.group.groupId ? 1 : -1).map((g) => (
                                        <div
                                            key={g.group.id}
                                            className="flex flex-col rounded-md shadow-md p-8 bg-indigo-50 w-full"
                                        >
                                            <div
                                                className="flex flex-row gap-2 w-full"
                                            >
                                                <Logo
                                                    groupId={g.group.id.toString()}
                                                    onError={() => (
                                                        <></>
                                                    )}
                                                    className="my-auto rounded-md w-12 h-12"
                                                />
                                                <div
                                                    className="flex flex-col my-auto"
                                                >
                                                    <div
                                                        className="flex flex-row gap-4"
                                                    >
                                                        <span
                                                            className="text-indigo-950 text-md font-semibold my-auto"
                                                        >{g.group.name}</span>
                                                        {
                                                            g.group.hasVerifiedBadge
                                                            && <span
                                                                className="text-indigo-50 rounded-full px-2 py-1 text-xs font-semibold bg-indigo-500"
                                                            >VERIFIED</span>
                                                        }
                                                    </div>
                                                    <span
                                                        className="text-indigo-950 text-xs"
                                                    >{g.role.name}</span>
                                                </div>
                                            </div>
                                            <span
                                                className="text-indigo-950 text-xs mt-4"
                                            >{g.group.memberCount.toLocaleString()} member(s)</span>
                                        </div>
                                    ))
                                }
                            </div>
                            : <div
                                className="mx-auto"
                            >
                                <MoonLoader
                                    size={32}
                                    className={"flex mx-auto my-auto"}
                                    color={"#6366f1"}
                                />
                            </div>
                    }
                </div>
            </div>
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
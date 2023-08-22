"use client";

import useSWR from "swr";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";
import { GroupHeader } from "@/components/client/GroupHeader";
import { toast } from "react-hot-toast";
import { Input, Select, TextArea } from "@/components/form/TextInput";
import { DateTime } from "luxon";
import { HiDownload, HiX } from "react-icons/hi";
import { Group, User } from "@prisma/client";
import { UserAutofill } from "@/components/form/UserAutofill";

export default function GroupPage() {
    const group = useGroup();
    const path = usePathname();
    const auth = useAuth();

    const [users, setUsers] = useState<{
        admins: User[];
        humanResources: User[];
        publicRelations: User[];
        developers: User[];
    }>();

    const usersCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/users` : null
        },
        fetch
    );

    useEffect(() => {
        if (!usersCache.isLoading
            && usersCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await usersCache.data?.json();
                    if (body.users) {
                        setUsers(body.users);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [usersCache]);

    const [admin, setAdmin] = useState<string>();
    const [humanResources, setHumanResources] = useState<string>();
    const [publicRelations, setPublicRelations] = useState<string>();
    const [developer, setDeveloper] = useState<string>();

    const [editableGroup, setEditableGroup] = useState<Group>();
    const [saving, setSaving] = useState<boolean>(false)
    const save = async (
        type: string
    ) => {
        if (!saving) {
            setSaving(true)
            if (
                group.group
                && group.user
            ) {
                const response = await fetch(
                    `/api/groups/${group.group.id}/config/${type}`,
                    {
                        method: "POST",
                        body: JSON.stringify(editableGroup)
                    }
                );
    
                try {
                    const body = await response.json();
                    if (body && body.data) {
                        toast.success(body.data);
                    } else if (body.error) {
                        toast.error(body.error);
                    }
                } catch (error) {
                    toast.error(`${error}`)
                }
            }
        }
    }

    const add = async (
        role: number
    ) => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/users`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        level: role,
                        userId: admin || humanResources || publicRelations || developer
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    usersCache.mutate();
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    }

    const remove = async (
        id: string
    ) => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/users/${id}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    usersCache.mutate()
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    };

    useEffect(() => {
        if (group.group) {
            setEditableGroup(group.group)
        }
    }, [group])

    return (
        group.group
        && group.owner
        && group.user
        && (
            group.user.role.admin
            || group.user.role.humanResources
            || group.user.role.publicRelations
            || group.user.role.developer
        )
        && editableGroup
    ) ? (
        <div
            className="flex flex-col gap-12"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <div
                className={"grid grid-cols-2 gap-4 w-full"}
            >
                <div
                    className="flex flex-col w-full bg-indigo-50 rounded-md shadow-md p-8 gap-4"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Admin Users</span>
                    <div
                        className="flex flex-col w-full gap-2"
                    >
                        {
                            group.user.role.level >= 1000
                            && <div
                                className="flex flex-row w-full gap-4"
                            >
                                <UserAutofill
                                    groupId={group.group.id}
                                    label={"New User"}
                                    onChange={setAdmin}
                                />
                                <button
                                    className="text-indigo-50 text-sm font-semibold mt-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                    onClick={() => {
                                        add(900)
                                    }}
                                >Add</button>
                            </div>
                        }
                        <div
                            className="flex flex-wrap gap-2"
                        >
                            {
                                users?.admins.map(t => (
                                    <div
                                        key={t.id}
                                        className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                    >
                                        <span
                                            className="text-indigo-50 text-xs font-semibold my-auto"
                                        >{t.name}</span>
                                        {
                                            group.user!.role.level >= 1000
                                            && <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    remove(t.id);
                                                }}
                                            />
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div
                    className="grid w-full bg-indigo-50 rounded-md shadow-md p-8 gap-4"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Developer Users</span>
                    <div
                        className="col-span-2 flex flex-col w-full gap-2"
                    >
                        {
                            group.user.role.level >= 900
                            && <div
                                className="flex flex-row w-full gap-4"
                            >
                                <UserAutofill
                                    groupId={group.group.id}
                                    label={"New User"}
                                    onChange={setDeveloper}
                                />
                                <button
                                    className="text-indigo-50 text-sm font-semibold mt-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                    onClick={() => {
                                        add(600)
                                    }}
                                >Add</button>
                            </div>
                        }
                        <div
                            className="flex flex-wrap gap-2"
                        >
                            {
                                users?.developers.map(t => (
                                    <div
                                        key={t.id}
                                        className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                    >
                                        <span
                                            className="text-indigo-50 text-xs font-semibold my-auto"
                                        >{t.name}</span>
                                        {
                                            group.user!.role.level >= 900
                                            && <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    remove(t.id);
                                                }}
                                            />
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div
                    className="grid w-full bg-indigo-50 rounded-md shadow-md p-8 gap-4"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Human Resources Users</span>
                    <div
                        className="col-span-2 flex flex-col w-full gap-2"
                    >
                        {
                            group.user.role.level >= 600
                            && <div
                                className="flex flex-row w-full gap-4"
                            >
                                <UserAutofill
                                    groupId={group.group.id}
                                    label={"New User"}
                                    onChange={setHumanResources}
                                />
                                <button
                                    className="text-indigo-50 text-sm font-semibold mt-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                    onClick={() => {
                                        add(500)
                                    }}
                                >Add</button>
                            </div>
                        }
                        <div
                            className="flex flex-wrap gap-2"
                        >
                            {
                                users?.humanResources.map(t => (
                                    <div
                                        key={t.id}
                                        className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                    >
                                        <span
                                            className="text-indigo-50 text-xs font-semibold my-auto"
                                        >{t.name}</span>
                                        {
                                            group.user!.role.level >= 600
                                            && <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    remove(t.id);
                                                }}
                                            />
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div
                    className="grid grid-cols-2 w-full bg-indigo-50 rounded-md shadow-md p-8 gap-4"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Public Relations Users</span>
                    <div
                        className="col-span-2 flex flex-col w-full gap-2"
                    >
                        {
                            group.user.role.level >= 500
                            && <div
                                className="flex flex-row w-full gap-4"
                            >
                                <UserAutofill
                                    groupId={group.group.id}
                                    label={"New User"}
                                    onChange={setPublicRelations}
                                />
                                <button
                                    className="text-indigo-50 text-sm font-semibold mt-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                    onClick={() => {
                                        add(500)
                                    }}
                                >Add</button>
                            </div>
                        }
                        <div
                            className="flex flex-wrap gap-2"
                        >
                            {
                                users?.publicRelations.map(t => (
                                    <div
                                        key={t.id}
                                        className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                    >
                                        <span
                                            className="text-indigo-50 text-xs font-semibold my-auto"
                                        >{t.name}</span>
                                        {
                                            group.user!.role.level >= 600
                                            && <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    remove(t.id);
                                                }}
                                            />
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
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
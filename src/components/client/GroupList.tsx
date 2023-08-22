import {
    HiDotsVertical
} from "react-icons/hi";

import useSWR from "swr";
import { useState, useEffect } from "react";

import Link from "next/link";

import { useAuth } from "@/app/client/auth";

import type { Group } from "@prisma/client";
import { Modal } from "../form/Modal";
import { Input, Select, TextArea } from "../form/TextInput";
import { NewGroup } from "@/util/db/group";
import { toast } from "react-hot-toast";
import Image from "next/image";

export const GroupList = () => {
    const auth = useAuth();
    const response = useSWR("/api/groups", fetch);

    const [userGroups, setUserGroups] = useState<{
        id: Number,
        name: string
    }[]>([]);

    const groupsCache = useSWR(
        `/api/proxy/groups/${auth.user?.robloxId}`,
        fetch
    );

    useEffect(() => {
        if (!groupsCache.isLoading
            && groupsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await groupsCache.data?.json();
                    if (body.groups) {
                        setUserGroups(body.groups);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [groupsCache, auth])

    const [addModal, setAddModal] = useState<boolean>(false);
    const [groups, setGroups] = useState<Group[]>([]);

    const [newGroup, setNewGroup] = useState<NewGroup>({});
    const [creating, setCreating] = useState<boolean>(false);
    const create = async () => {
        if (!creating) {
            setCreating(true);
            try {
                const newGroupResponse = await fetch(
                    `/api/groups`,
                    {
                        method: "POST",
                        body: JSON.stringify(newGroup),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const body = await newGroupResponse.json();
                setCreating(false);
                if (newGroupResponse.status === 200) {
                    if (Array.isArray(body)) {
                        setGroups(body as Group[]);
                        toast.success(`${newGroup.name} has been successfully created.`);
                        setNewGroup({});
                        setAddModal(false);
                    } else {
                        throw Error("Unexpected error while submitting group, please try again.");
                    }
                } else {
                    throw Error(body.error);
                }
            } catch (error) {
                setCreating(false);
                toast.error((error as Error).message);
            }
        }
    }

    useEffect(() => {
        if (response.data && !response.isLoading) {
            const tryJson = async () => {
                try {
                    const body = await response.data?.json();
                    if (Array.isArray(body)) {
                        setGroups(body as Group[]);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [response])

    return (
        <div
            className="flex flex-col w-full gap-2"
        >
            <div
                className="flex flex-row justify-between"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold my-auto"
                >Groups</span>
                <span
                        className="text-indigo-50 bg-indigo-500 rounded-full shadow-sm px-4 py-2 text-sm font-semibold cursor-pointer hover:shadow-md hover:bg-indigo-600 transition duration-200"
                        onClick={() => {
                            setAddModal(true)
                        }}
                    > + New Group </span>
            </div>
            <div
                className="flex flex-wrap gap-2 w-full"
            >
                {
                    groups.length > 0
                        ? groups.map((g) => (
                            <Link
                                key={g.id}
                                className="w-fit min-w-[20rem] max-w-[24rem] flex flex-col bg-indigo-50 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                                href={`/client/groups/${g.id}`}
                            >
                                <div
                                    className="relative flex flex-row w-full justify-between rounded-t-md shadow-sm p-4"
                                    style={{
                                        backgroundColor: g.primaryColor
                                    }}
                                >
                                    <span
                                        className="text-indigo-50 text-lg font-semibold max-w-[80%] my-auto"
                                    >{g.name}</span>
                                    <div
                                        className="flex flex-col my-auto rounded-full p-1 bg-interit text-indigo-50 hover:bg-indigo-50 hover:text-inherit transition duration-200 cursor-pointer"
                                    >
                                        <HiDotsVertical
                                            className="my-auto mx-auto"
                                        />
                                    </div>
                                </div>
                                <div
                                    className="flex flex-col p-4 "
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        {
                                            g.verified
                                            && <span
                                                className="bg-indigo-500 text-indigo-50 rounded-full text-xs py-1 px-2 w-fit font-semibold"
                                            >VERIFIED</span>
                                        }
                                        {
                                            g.discordUrl
                                            && <Link
                                                href={`https://discord.com/invite/${g.discordUrl}`}
                                                className="text-indigo-500 text-xs font-semibold my-auto"
                                            >Discord</Link>
                                        }
                                        <Link
                                            href={`https://www.roblox.com/groups/${g.groupId}/data`}
                                            className="text-indigo-500 text-xs font-semibold my-auto"
                                        >Roblox Group</Link>
                                    </div>
                                    <span
                                        className="text-indigo-950 text-sm line-clamp-3 mt-4"
                                    >{g.description || "No description provided"}</span>
                                </div>
                            </Link>
                        ))
                        : <div
                            className="flex flex-col py-24 gap-4 w-full"
                        >
                            <Image
                                width={256}
                                height={256}
                                src={"/static/NoGroups.svg"}
                                alt={"no groups"}
                                className="w-full object-fit max-w-[425px] mx-auto"
                            />
                            <span
                                className="text-indigo-950 text-md font-semibold mx-auto"
                            >No Groups</span>
                        </div>
                }
            </div>
            {
                <Modal
                    isOpen={addModal}
                    title={"New Group"}
                    body={
                        <>
                            <div
                                className="grid grid-cols-2 w-full gap-4"
                            >
                                <Input
                                    label={"Name"}
                                    type={"name"}
                                    className={"col-span-2"}
                                    value={newGroup.name || ""}
                                    onChange={(event) => {
                                        setNewGroup({
                                            ...newGroup,
                                            name: event.target.value
                                        })
                                    }}
                                />
                                <Select
                                    options={userGroups.map(g => ({
                                        value: g.id.toString(),
                                        display: g.name
                                    }))}
                                    label={"Group"}
                                    value={newGroup.groupId?.toString() || ""}
                                    onChange={(event) => {
                                        setNewGroup({
                                            ...newGroup,
                                            groupId: Number(event.target.value)
                                        })
                                    }}
                                />
                                <Input
                                    label={"Discord Invite"}
                                    type={"url"}
                                    value={newGroup.discordUrl || ""}
                                    onChange={(event) => {
                                        setNewGroup({
                                            ...newGroup,
                                            discordUrl: event.target.value
                                        })
                                    }}
                                />
                                <TextArea
                                    label={"Description"}
                                    className={"col-span-2"}
                                    helper={"A meaningful overview"}
                                    value={newGroup.description || ""}
                                    onChange={(event) => {
                                        setNewGroup({
                                            ...newGroup,
                                            description: event.target.value
                                        })
                                    }}
                                />
                            </div>
                        </>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                                onClick={create}
                                disabled={creating}
                            >Create</button>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                                onClick={() => {
                                    setAddModal(false);
                                    setNewGroup({});
                                }}
                            >Cancel</button>
                        </>
                    }
                    onClose={() => {
                        setAddModal(false);
                    }}
                />
            }
        </div>
    )
}
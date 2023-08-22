"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "@/app/client/auth";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Group, TicketType } from "@prisma/client";
import { Modal } from "@/components/form/Modal";
import { Input, Select, TextArea } from "@/components/form/TextInput";
import { MoonLoader } from "react-spinners";
import { Logo } from "@/components/content/Logo";

export const CreateTicket = (props: {
    isOpen: boolean,
    onClose: () => void,
    groupId: string
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();

    const [group, setGroup] = useState<Group>();
    const [types, setTypes] = useState<TicketType[]>([]);
    const typesCache = useSWR(
        () => {
            return `/api/tickets/types/${props.groupId}`
        },
        fetch
    );

    const groupCache = useSWR(
        () => {
            return `/api/groups/${props.groupId}/overview`
        },
        fetch
    );

    const [title, setTitle] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const post = async () => {
        if (
            !saving
            && title
            && message
            && type
        ) {
            setSaving(true);

            const response = await fetch(
                `/api/tickets/`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        description: message,
                        title,
                        type,
                        groupId: pathname.split("/")[4]
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    router.replace(`/client/tickets/${body.data}`);
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            } finally {
                setSaving(false);
            }
        }
    }

    useEffect(() => {
        if (!typesCache.isLoading
            && typesCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await typesCache.data?.json();
                    if (body.types) {
                        setTypes(body.types);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [typesCache]);

    useEffect(() => {
        if (!groupCache.isLoading
            && groupCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await groupCache.data?.json();
                    if (body.group) {
                        setGroup(body.group);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [groupCache]);

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={"Open Ticket"}
            body={
                group
                    ? <div
                        className="grid grid-cols-2 gap-4"
                    >
                        <Input
                            label={"Title"}
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value);
                            }}
                        />
                        <Select
                            options={types.map(t => ({
                                display: t.name,
                                value: t.id
                            }))}
                            label={"Type"}
                            value={type}
                            onChange={(event) => {
                                setType(event.target.value);
                            }}
                        />
                        <TextArea
                            label={"Description"}
                            value={message}
                            onChange={(event) => {
                                setMessage(event.target.value);
                            }}
                            className="col-span-2"
                        />
                        <div
                            className="flex flex-row justify-between w-full bg-white rounded-md p-4 col-span-2"
                        >
                            <div
                                className="flex flex-row my-auto gap-8"
                            >
                                <Logo
                                    className="w-12 h-12 rounded-lg my-auto"
                                    groupId={group.groupId}
                                    onError={() => (
                                        <></>
                                    )}
                                />
                                <div
                                    className="flex flex-col my-auto"
                                >
                                    <span
                                        className="text-indigo-950 text-sm font-bold"
                                    >{group.name}</span>
                                    <span
                                        className="text-indigo-950 text-xs"
                                    >Created on {new Date(group.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    : <div
                        className="w-full flex flex-row col-span-2"
                    >
                        <MoonLoader
                            size={32}
                            className={"flex mx-auto my-auto"}
                            color={"#6366f1"}
                        />
                    </div>
            }
            footer={
                <>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-100 text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        onClick={props.onClose}
                    >Cancel</button>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                        onClick={post}
                        disabled={saving}
                    >Create</button>
                </>
            }
        />
    )
}
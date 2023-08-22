import {
    HiChatAlt,
    HiDotsVertical,
    HiTrash
} from "react-icons/hi";

import { useState } from "react";

import { Modal } from "../form/Modal";
import { Input, TextArea } from "../form/TextInput";

import {
    GroupDetails,
    GroupMessageDetails,
    NewGroupMessage
} from "@/util/db/group";

import { toast } from "react-hot-toast";
import { Avatar } from "../content/Avatar";
import { Dropdown } from "../form/Dropdown";
import { useGroup } from "@/app/client/groups/group";
import { CreateReport } from "./modals/CreateReport";

export const GroupMessages = (props: {
    group: GroupDetails,
    messages: GroupMessageDetails[],
    setLoad: React.Dispatch<React.SetStateAction<number>>,
    reload: () => void;
}) => {
    const group = useGroup();

    const [menu, setMenu] = useState<string>();
    const [addModal, setAddModal] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<NewGroupMessage>({});

    const [reportModal, setReportModal] = useState<boolean>(false);
    const [reportTarget, setReportTarget] = useState<string>();

    const [creating, setCreating] = useState<boolean>(false);
    const create = async () => {
        if (!creating) {
            setCreating(true);
            try {
                const newGroupResponse = await fetch(
                    `/api/groups/${props.group.id}/messages`,
                    {
                        method: "POST",
                        body: JSON.stringify(newMessage),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const body = await newGroupResponse.json();
                if (newGroupResponse.status === 200) {
                    setCreating(false);
                    if (body.data) {
                        toast.success(`Your message has been successfully posted.`);
                        props.reload();
                        setNewMessage({});
                        setAddModal(false);
                    } else {
                        throw Error("Unexpected error while submitting message, please try again.");
                    }
                } else {
                    setCreating(false);
                    throw Error(body.error);
                }
            } catch (error) {
                setCreating(false)
                toast.error((error as Error).message);
            }
        }
    }

    const [deleting, setDeleting] = useState<boolean>(false);
    const deleteMessage = async (
        messageId: string
    ) => {
        if (!deleting) {
            setDeleting(true);
            try {
                const response = await fetch(
                    `/api/groups/${props.group.id}/messages/${messageId}`,
                    {
                        method: "DELETE",
                    }
                );

                const body = await response.json();
                if (response.status === 200) {
                    setDeleting(false);
                    if (body.data) {
                        toast.success(`Your message has been successfully deleted.`);
                        props.reload();
                    } else {
                        throw Error("Unexpected error while deleting message, please try again.");
                    }
                } else {
                    setDeleting(false);
                    throw Error(body.error);
                }
            } catch (error) {
                setDeleting(false)
                toast.error((error as Error).message);
            }
        }
    }

    return (
        <div
            className="flex flex-col w-full gap-2"
        >
            <div
                className="flex flex-row justify-between"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold my-auto"
                >Feed</span>
                <span
                    className="text-indigo-50 bg-indigo-500 rounded-full shadow-sm px-4 py-2 text-sm font-semibold cursor-pointer hover:shadow-md hover:bg-indigo-600 transition duration-200"
                    onClick={() => {
                        setAddModal(true)
                    }}
                > + New Message </span>
            </div>
            <div
                className="flex flex-col gap-2 w-full"
            >
                {
                    props.messages.map((m) => (
                        <div
                            key={m.id}
                            className="w-full flex flex-col bg-indigo-50 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                        >
                            <div
                                className="flex flex-row w-full justify-between p-4"
                            >
                                <div
                                    className="flex flex-row gap-4"
                                >
                                    <Avatar
                                        userId={m.author.robloxId}
                                        className="w-12 h-12 my-auto rounded-full"
                                        onError={() => (
                                            <></>
                                        )}
                                    />
                                    <div
                                        className="flex flex-col my-auto"
                                    >
                                        <div
                                            className="flex flex-row gap-2"
                                        >
                                            <span
                                                className="text-indigo-950 text-lg font-semibold"
                                            >{m.title}</span>
                                            {
                                                (Date.now() < new Date(m.createdAt).getTime() + (1000 * 60 * 60 * 24))
                                                && <span
                                                    className="px-2 py-1 text-indigo-50 text-xs bg-indigo-500 rounded-full font-semibold my-auto"
                                                >NEW</span>
                                            }
                                        </div>
                                        <span
                                            className="text-indigo-950 text-xs"
                                        >by {m.author.name}</span>
                                    </div>
                                </div>
                                <div
                                    className="relative flex flex-col my-auto rounded-full p-2 bg-interit text-indigo-500 hover:bg-indigo-500 hover:text-indigo-50 transition duration-200 cursor-pointer"
                                >
                                    <HiDotsVertical
                                        className="my-auto mx-auto"
                                        onClick={() => {
                                            setMenu(menu === m.id ? undefined : m.id);
                                        }}
                                    />
                                    <Dropdown
                                        isOpen={menu === m.id}
                                        onClose={() => {
                                            setMenu(undefined);
                                        }}
                                        options={[
                                            {
                                                key: "report",
                                                display: (
                                                    <div
                                                        className="flex flex-row gap-2"
                                                    >
                                                        <HiChatAlt className="my-auto" />
                                                        <span>Report</span>
                                                    </div>
                                                ),
                                                onClick: (onClose) => {
                                                    setReportModal(true);
                                                    setReportTarget(m.id);
                                                    onClose()
                                                }
                                            },
                                            (
                                                group.user?.role.admin
                                                || group.user?.role.publicRelations
                                                || group.user?.role.humanResources
                                                || group.user?.role.developer
                                            ) ? (
                                                {
                                                    key: "delete",
                                                    display: (
                                                        <div
                                                            className="flex flex-row gap-2"
                                                        >
                                                            <HiTrash className="my-auto" />
                                                            <span>Delete</span>
                                                        </div>
                                                    ),
                                                    onClick: (onClose) => {
                                                        deleteMessage(m.id);
                                                        onClose();
                                                    }
                                                }
                                            ) : (
                                                {
                                                    key: "delete",
                                                    display: (
                                                        <></>
                                                    ),
                                                    onClick: (onClose) => {
                                                        
                                                    }
                                                }
                                            )
                                        ]}
                                    />
                                </div>
                            </div>
                            <div
                                className="flex flex-col p-4 "
                            >
                                <span
                                    className="text-indigo-950 text-sm"
                                >{m.body}</span>
                                <span
                                    className="text-indigo-900 text-xs mt-2"
                                >{new Date(m.createdAt).toDateString()}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
            {
                <Modal
                    isOpen={addModal}
                    title={"New Message"}
                    body={
                        <>
                            <div
                                className="grid grid-cols-2 w-full gap-4"
                            >
                                <Input
                                    label={"Title"}
                                    className={"col-span-2"}
                                    value={newMessage.title || ""}
                                    onChange={(event) => {
                                        setNewMessage({
                                            ...newMessage,
                                            title: event.target.value
                                        })
                                    }}
                                />
                                <TextArea
                                    label={"Body"}
                                    className={"col-span-2"}
                                    helper={`${newMessage.body?.toString().length || 0}/3000`}
                                    value={newMessage.body || ""}
                                    onChange={(event) => {
                                        if (event.target.value.length <= 3000) {
                                            setNewMessage({
                                                ...newMessage,
                                                body: event.target.value
                                            })
                                        }
                                    }}
                                />
                                <Input
                                    label={"Link"}
                                    className={"col-span-2"}
                                    value={newMessage.link || ""}
                                    onChange={(event) => {
                                        setNewMessage({
                                            ...newMessage,
                                            link: event.target.value
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
                            >Post</button>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                                onClick={() => {
                                    setAddModal(false);
                                    setNewMessage({});
                                }}
                            >Cancel</button>
                        </>
                    }
                    onClose={() => {
                        setAddModal(false);
                    }}
                />
            }
            {
                reportTarget
                && <CreateReport
                    isOpen={reportModal}
                    onClose={() => {
                        setReportModal(false)
                    }}
                    type={"MESSAGE"}
                    targetId={reportTarget}
                />
            }
        </div>
    )
}
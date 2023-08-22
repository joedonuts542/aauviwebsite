import type {
    AlertType
} from "@prisma/client";

import { useState, useEffect } from "react";

import { Modal } from "@/components/form/Modal";
import { Input, Select, TextArea } from "@/components/form/TextInput";
import { UserAutofill } from "@/components/form/UserAutofill";
import { groupContext } from "@/app/client/groups/group";
import toast from "react-hot-toast";
import { DateTime } from "luxon";

type newGroupAlert = {
    title?: string,
    description?: string,
    type?: AlertType,
    start?: Date,
    end?: Date,
    targetId?: string
}

export const CreateAlert = (props: {
    isOpen: boolean,
    onClose: () => void,
    refresh: () => void,
    userId?: string,
    group: groupContext
}) => {
    const [creating, setCreating] = useState<boolean>(false);
    const [newAlert, setNewAlert] = useState<newGroupAlert>({});

    useEffect(() => {
        if (props.userId) {
            setNewAlert({
                ...newAlert,
                targetId: props.userId
            })
        }
    }, [props.userId])

    const create = async () => {
        if (!creating && newAlert.targetId && props.group.group) {
            setCreating(true);
            const response = await fetch(
                `/api/groups/${props.group.group.id}/profile/${newAlert.targetId}/alerts`,
                {
                    body: JSON.stringify({
                        ...newAlert
                    }),
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        props.refresh();
                        props.onClose();
                        setNewAlert({});
                        toast.success("Successfully created a new alert!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot create new alert")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    return (props.group.group) ? (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={"New Alert"}
            body={
                <div
                    className="grid grid-cols-2 gap-4"
                >
                    <Input
                        label={"Title"}
                        value={newAlert.title || ""}
                        onChange={(event) => {
                            setNewAlert({
                                ...newAlert,
                                title: event.target.value
                            })
                        }}
                        className={"col-span-2"}
                    />
                    <UserAutofill
                        groupId={props.group.group.id}
                        label={"User"}
                        value={newAlert.targetId}
                        defaultValue={newAlert.targetId}
                        onChange={(event) => {
                            setNewAlert({
                                ...newAlert,
                                targetId: event
                            })
                        }}
                    />
                    <Select
                        label={"Type"}
                        options={["WARNING", "TERMINATION", "SUSPENSION"].map(t => ({
                            display: `${t[0]}${t.substring(1).toLowerCase()}`,
                            value: t
                        }))}
                        value={newAlert.type}
                        onChange={(event) => {
                            setNewAlert({
                                ...newAlert,
                                type: event.target.value as AlertType
                            })
                        }}
                    />
                    {
                        (newAlert.type === "SUSPENSION")
                        && <Input
                            label={"Start Day"}
                            type={"date"}
                            value={newAlert.start ? DateTime.fromJSDate(newAlert.start).toFormat("yyyy-MM-dd") : undefined}
                            onChange={(event) => {
                                setNewAlert({
                                    ...newAlert,
                                    start: DateTime.fromFormat(event.target.value, "yyyy-MM-dd").toJSDate()
                                })
                            }}
                        />
                    }
                    {
                        (newAlert.type === "SUSPENSION")
                        && <Input
                            label={"End Day"}
                            type={"date"}
                            value={newAlert.end ? DateTime.fromJSDate(newAlert.end).toFormat("yyyy-MM-dd") : undefined}
                            onChange={(event) => {
                                setNewAlert({
                                    ...newAlert,
                                    end: DateTime.fromFormat(event.target.value, "yyyy-MM-dd").toJSDate()
                                })
                            }}
                        />
                    }
                    <TextArea
                        label={"Reason"}
                        value={newAlert.description || ""}
                        onChange={(event) => {
                            setNewAlert({
                                ...newAlert,
                                description: event.target.value
                            })
                        }}
                        className={"col-span-2"}
                    />
                </div>
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
                            props.onClose();
                            setNewAlert({});
                        }}
                    >Cancel</button>
                </>
            }
        />
    ) : undefined
}
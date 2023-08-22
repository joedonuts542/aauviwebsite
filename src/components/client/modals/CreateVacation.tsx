import { useState } from "react";

import { Modal } from "@/components/form/Modal";
import { Input, TextArea } from "@/components/form/TextInput";
import { groupContext } from "@/app/client/groups/group";
import { userContext } from "@/app/client/auth";

import toast from "react-hot-toast";
import { DateTime } from "luxon";

type newGroupVacation = {
    description?: string,
    start?: Date,
    end?: Date,
}

export const CreateVacation = (props: {
    isOpen: boolean,
    onClose: () => void,
    refresh: () => void,
    auth: userContext,
    group: groupContext
}) => {
    const [creating, setCreating] = useState<boolean>(false);
    const [newVacation, setNewVacation] = useState<newGroupVacation>({});

    const create = async () => {
        if (!creating && props.auth.user && props.group.group) {
            setCreating(true);
            const response = await fetch(
                `/api/groups/${props.group.group.id}/profile/${props.auth.user.id}/vacations`,
                {
                    body: JSON.stringify({
                        ...newVacation
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
                        setNewVacation({});
                        toast.success("Successfully created a new vacation!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot create new vacation")
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
            title={"New Vacation"}
            body={
                <div
                    className="grid grid-cols-2 gap-4"
                >
                    <Input
                        label={"Start Day"}
                        type={"date"}
                        value={newVacation.start ? DateTime.fromJSDate(newVacation.start).toFormat("yyyy-MM-dd") : undefined}
                        onChange={(event) => {
                            setNewVacation({
                                ...newVacation,
                                start: DateTime.fromFormat(event.target.value, "yyyy-MM-dd").toJSDate()
                            })
                        }}
                    />
                    <Input
                        label={"End Day"}
                        type={"date"}
                        value={newVacation.end ? DateTime.fromJSDate(newVacation.end).toFormat("yyyy-MM-dd") : undefined}
                        onChange={(event) => {
                            setNewVacation({
                                ...newVacation,
                                end: DateTime.fromFormat(event.target.value, "yyyy-MM-dd").toJSDate()
                            })
                        }}
                    />
                    <TextArea
                        label={"Reason"}
                        value={newVacation.description || ""}
                        onChange={(event) => {
                            setNewVacation({
                                ...newVacation,
                                description: event.target.value
                            })
                        }}
                        className="col-span-2"
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
                    >Request</button>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        onClick={() => {
                            props.onClose();
                            setNewVacation({});
                        }}
                    >Cancel</button>
                </>
            }
        />
    ) : undefined
}
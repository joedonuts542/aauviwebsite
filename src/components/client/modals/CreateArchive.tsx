import { useState } from "react";

import { Modal } from "@/components/form/Modal";
import { Input, TextArea } from "@/components/form/TextInput";
import { groupContext } from "@/app/client/groups/group";
import { userContext } from "@/app/client/auth";

import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { GroupDetails } from "@/util/db/group";

export const CreateArchive = (props: {
    isOpen: boolean,
    onClose: () => void,
    refresh: () => void,
    group: GroupDetails
}) => {
    const [creating, setCreating] = useState<boolean>(false);
    const create = async () => {
        if (!creating && props.group) {
            setCreating(true);
            toast.loading("Trying to run group-wide archive...");

            const response = await fetch(
                `/api/groups/${props.group.id}/archive`,
                {
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        props.refresh();
                        props.onClose();
                        toast.success("Successfully ran archive!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot run a new archive.")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    return (props.group) ? (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={"Run Archive"}
            body={
                <div
                    className="flex flex-col gap-4"
                >
                    <span
                        className="text-indigo-950 text-sm"
                    >Are you sure you want to run a new archive? This will discard ALL time entires and events for the current period, but will continue storing them. Users that do not meet the requirements will be given a new alert warning. Users that reach the maximum alert warnings will be terminated. <b>This action CANNOT be undone.</b></span>
                    <span
                        className="text-indigo-950 text-xs mt-4"
                    >Admins, users in a department, and users with an approved vacation in the past week will not be given an alert if they do not meet the requirements.</span>
                </div>
            }
            footer={
                <>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                        onClick={create}
                        disabled={creating}
                    >Run</button>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        onClick={() => {
                            props.onClose();
                        }}
                    >Cancel</button>
                </>
            }
        />
    ) : undefined
}
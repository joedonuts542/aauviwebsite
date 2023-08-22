import { userContext } from "@/app/client/auth";
import { groupContext } from "@/app/client/groups/group";
import { GroupVacation } from "@prisma/client";

import { Modal } from "@/components/form/Modal";

import { toast } from "react-hot-toast";

export const setVacationStatus = async (
    vacationId: string,
    groupId: string,
    userId: string,
    status: "APPROVED" | "DENIED"
): Promise<void> => {
    try {
        const response = await fetch(
            `/api/groups/${groupId}/profile/${userId}/vacations/${vacationId}`,
            {
                body: JSON.stringify({
                    status
                }),
                method: "POST"
            }
        );

        const body = await response.json();
        if (body) {
            if (body.data) {
                toast.success(`Successfully marked vacation as ${status}!`)
            } else {
                throw Error(body.error);
            }
        } else {
            throw Error("Cannot create new vacation")
        }
    } catch (error) {
        toast.error(error!.toString())
    }
}

export const VacationModal = (props: {
    isOpen: boolean,
    onClose: () => void,
    refresh: () => void,
    vacation: GroupVacation,
    group: groupContext,
    auth: userContext,
}) => {
    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={`Vacation Request`}
            body={
                <div
                    className="grid grid-cols-2 gap-4 w-full"
                >
                    <span
                        className="text-indigo-950 text-sm w-full col-span-2"
                    >{props.vacation.description}</span>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Start Date</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >{new Date(props.vacation.start).toDateString()}</span>
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >End Date</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >{new Date(props.vacation.end).toDateString()}</span>
                    </div>
                </div>
            }
            footer={
                <>
                    {
                        (props.group.group
                            && props.auth.user
                            && props.group.user
                            && props.group.user.role.admin
                            && props.group.user.role.humanResources)
                            ? <>
                                <button
                                    type="button"
                                    className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-green-500 text-indigo-50 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-default transition duration-200"
                                    onClick={() => {
                                        setVacationStatus(
                                            props.vacation.id,
                                            props.group.group!.id,
                                            props.auth.user!.id,
                                            "APPROVED"
                                        )
                                    }}
                                >Approve</button>
                                <button
                                    type="button"
                                    className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-red-500 text-indigo-50 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-default transition duration-200"
                                    onClick={() => {
                                        setVacationStatus(
                                            props.vacation.id,
                                            props.group.group!.id,
                                            props.auth.user!.id,
                                            "DENIED"
                                        )
                                    }}
                                >Decline</button>
                            </>
                            : undefined
                    }
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
    )
}
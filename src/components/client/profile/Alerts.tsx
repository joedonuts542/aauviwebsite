import useSWR from "swr";
import { useState, useEffect } from "react";

import { userContext } from "@/app/client/auth";
import { groupContext } from "@/app/client/groups/group";
import { GroupAlert } from "@prisma/client";

import toast from "react-hot-toast";
import { MoonLoader } from "react-spinners";
import { DateTime } from "luxon";
import { HiInformationCircle, HiPlus, HiTrash } from "react-icons/hi";
import { Table } from "@/components/form/Table";
import { CreateAlert } from "../modals/CreateAlert";

import type { alertContext } from "@/app/api/groups/[id]/profile/[userId]/alerts/route";

export const Alerts = (props: {
    group: groupContext,
    auth: userContext,
    version: number,
    id: string,
    refresh: () => void,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [alertModal, setAlertModal] = useState<boolean>(false);
    const [addAlertModal, setAddAlertModal] = useState<boolean>(false);

    const [groupAlerts, setGroupAlerts] = useState<alertContext[]>([]);

    const alertsCache = useSWR(
        () => {
            return (props.group.group) ? `/api/groups/${props.group.group.id}/profile/${props.id}/alerts` : null
        }, fetch
    );

    useEffect(() => {
        if (
            !alertsCache.isLoading
            && alertsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await alertsCache.data?.json();
                    if (body && body.alerts) {
                        setGroupAlerts(body.alerts as alertContext[]);
                        setLoading(false)
                    }
                } catch (error) {

                }
            }

            tryJson();
        } else if (alertsCache.error) {
            toast.error("Error loading group data");
        }
    }, [props.version, alertsCache]);

    const refresh = async () => {
        alertsCache.mutate();
    }

    const [deleting, setDeleting] = useState<boolean>(false);
    const deleteAlert = async (id: string) => {
        if (!deleting && props.group.group) {
            setDeleting(true);
            const response = await fetch(
                `/api/groups/${props.group.group.id}/profile/${props.id}/alerts/${id}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        refresh();
                        toast.success("Successfully deleted the alert!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot delete this alert")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setDeleting(false);
            }
        }
    }

    return loading ? (
        <div
            className="flex flex-col gap-4 w-full h-full"
        >
            <MoonLoader
                size={32}
                className={"flex mx-auto my-auto"}
                color={"#6366f1"}
            />
        </div>
    ) : (
        <div
            className="flex flex-col gap-4 w-full"
        >
            <div
                className="flex flex-row gap-4"
            >
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full cursor-pointer hover:shadow-lg transition duration-200"
                >
                    <div
                        className="flex flex-col p-4 rounded-full bg-green-200 w-fit"
                    >
                        <HiInformationCircle
                            className="text-green-700 my-auto mx-auto"
                        />
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >{groupAlerts.length} User Alerts</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >in the past 3 months</span>
                    </div>
                </div>
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full cursor-pointer hover:shadow-lg transition duration-200"
                    onClick={() => {
                        setAddAlertModal(true);
                    }}
                >
                    <div
                        className="flex flex-col p-4 rounded-full bg-blue-200 w-fit"
                    >
                        <HiPlus
                            className="text-blue-700 my-auto mx-auto"
                        />
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >New Alert</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Click to create a new alert</span>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col gap-4 p-8 bg-indigo-50 rounded-md shadow-md"
            >
                <Table
                    columns={[
                        {
                            display: "Title",
                            key: "title"
                        },
                        {
                            display: "Type",
                            formatter: (row) => `${row.type[0]}${row.type.substring(1).toLowerCase()}`
                        },
                        {
                            display: "Start",
                            formatter: (row) => row.start ? DateTime.fromJSDate(new Date(row.start)).toFormat("fff") : "No start date"
                        },
                        {
                            display: "End",
                            formatter: (row) => row.end ? DateTime.fromJSDate(new Date(row.end)).toFormat("fff") : "No end date"
                        },
                        {
                            display: "Created By",
                            formatter: (row) => row.author.name
                        },
                        {
                            display: "",
                            formatter: (row) => (props.group.user?.role.admin || props.group.user?.role.humanResources) ? (
                                <HiTrash
                                    className="hover:text-red-500 transition duration-200 cursor-pointer"
                                    onClick={() => {
                                        deleteAlert(row.id);
                                    }}
                                />
                            ) : ("")
                        }
                    ]}
                    data={groupAlerts}
                />
            </div>
            <CreateAlert
                isOpen={addAlertModal}
                onClose={() => {
                    setAddAlertModal(false);
                }}
                refresh={refresh}
                group={props.group}
                userId={props.id}
            />
        </div>
    )
}
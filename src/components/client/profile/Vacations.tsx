import useSWR from "swr";
import { useState, useEffect } from "react";

import { userContext } from "@/app/client/auth";
import { groupContext } from "@/app/client/groups/group";
import { GroupVacation } from "@prisma/client";

import toast from "react-hot-toast";
import { MoonLoader } from "react-spinners";
import { DateTime } from "luxon";
import { HiCheck, HiPlus, HiSun, HiX } from "react-icons/hi";
import { Table } from "@/components/form/Table";
import { CreateVacation } from "../modals/CreateVacation";
import { VacationModal, setVacationStatus } from "../modals/VacationModal";

export const Vacations = (props: {
    group: groupContext,
    auth: userContext,
    version: number,
    id: string,
    refresh: () => void,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [vacationModal, setVacationModal] = useState<boolean>(false);
    const [addVacationModal, setAddVacationModal] = useState<boolean>(false);

    const [activeVacation, setActiveVacation] = useState<GroupVacation>();
    const [groupVacations, setGroupVacations] = useState<GroupVacation[]>([]);

    const vacationsCache = useSWR(
        () => {
            return (props.group.group) ? `/api/groups/${props.group.group.id}/profile/${props.id}/vacations` : null
        }, fetch
    );

    useEffect(() => {
        if (
            !vacationsCache.isLoading
            && vacationsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await vacationsCache.data?.json();
                    if (body && body.vacations) {
                        setGroupVacations(body.vacations as GroupVacation[]);
                        setLoading(false)
                    }
                } catch (error) {

                }
            }

            tryJson();
        } else if (vacationsCache.error) {
            toast.error("Error loading group data");
        }
    }, [props.version, vacationsCache]);

    const refresh = async () => {
        vacationsCache.mutate();
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
                        <HiSun
                            className="text-green-700 my-auto mx-auto"
                        />
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >Upcoming Vacation</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >
                            {
                                groupVacations[0]
                                    ? `${DateTime.fromJSDate(new Date(groupVacations[0].start)).toFormat("DDD")} - ${DateTime.fromJSDate(new Date(groupVacations[0].end)).toFormat("DDD")}`
                                    : `No vacations scheduled`
                            }
                        </span>
                    </div>
                </div>
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full cursor-pointer hover:shadow-lg transition duration-200"
                    onClick={() => {
                        setAddVacationModal(true);
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
                        >Request Vacation Time</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Click to create a new request</span>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col gap-4 p-8 bg-indigo-50 rounded-md shadow-md"
            >
                <Table
                    columns={[
                        {
                            display: "Description",
                            formatter: (row) => row.description.length > 30 ? `${row.description.substring(0, 30)}...` : row.description
                        },
                        {
                            display: "Status",
                            formatter: (row) => `${row.status[0]}${row.status.substring(1).toLowerCase()}`
                        },
                        {
                            display: "Start",
                            formatter: (row) => DateTime.fromJSDate(new Date(row.start)).toFormat("DDDD")
                        },
                        {
                            display: "End",
                            formatter: (row) => DateTime.fromJSDate(new Date(row.end)).toFormat("DDDD")
                        },
                        {
                            display: "Submitted On",
                            formatter: (row) => DateTime.fromJSDate(new Date(row.createdAt)).toFormat("fff")
                        },
                        {
                            display: "",
                            formatter: (row) => (props.group.user?.role.admin || props.group.user?.role.humanResources) ? (
                                <div
                                    className="flex flex-row gap-2"
                                >
                                    <HiCheck
                                        className="hover:text-green-500 transition duration-200 cursor-pointer"
                                        onClick={() => {
                                            if (props.group.group && props.auth.user) {
                                                setVacationStatus(
                                                    row.id,
                                                    props.group.group.id,
                                                    props.auth.user.id,
                                                    "APPROVED"
                                                )
                                            }
                                        }}
                                    />
                                    <HiX
                                        className="hover:text-red-500 transition duration-200 cursor-pointer"
                                        onClick={() => {
                                            if (props.group.group && props.auth.user) {
                                                setVacationStatus(
                                                    row.id,
                                                    props.group.group.id,
                                                    props.auth.user.id,
                                                    "DENIED"
                                                )
                                            }
                                        }}
                                    />
                                </div>
                            ) : ("")
                        }
                    ]}
                    data={groupVacations}
                    rowClick={(row) => {
                        setActiveVacation(row as GroupVacation);
                        setVacationModal(true);
                    }}
                />
            </div>
            <CreateVacation
                isOpen={addVacationModal}
                onClose={() => {
                    setAddVacationModal(false)
                }}
                refresh={refresh}
                auth={props.auth}
                group={props.group}
            />
            {
                activeVacation
                && <VacationModal
                    isOpen={vacationModal}
                    onClose={() => {
                        setVacationModal(false)
                    }}
                    refresh={refresh}
                    vacation={activeVacation}
                    auth={props.auth}
                    group={props.group}
                />
            }
        </div>
    )
}
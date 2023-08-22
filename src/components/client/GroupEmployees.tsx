import useSWR from "swr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { GroupDetails } from "@/util/db/group";
import { GroupActivity, User } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Modal } from "../form/Modal";
import { Input, Select } from "../form/TextInput";

import { column } from "../form/Table";
import { Duration } from "luxon";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { MoonLoader } from "react-spinners";
import { CreateArchive } from "./modals/CreateArchive";

type Employee = User & {
    activites: GroupActivity[];
}

const TableRow = (props: {
    row: { [key: string]: any };
    columns: column[];
    rowClick?: (row: { [key: string]: any }) => void;
}) => {

    return (
        <tr
            className="bg-indigo-50 text-indigo-950 hover:shadow-md transition duration-200 border-t-[1px] border-t-indigo-300 first-of-type:border-0 group cursor-pointer"
            onClick={() => {
                if (props.rowClick) {
                    props.rowClick(props.row);
                }
            }}
        >
            {
                props.columns.map((c, i) => {
                    let value: string | React.ReactNode = "";
                    if (c.formatter) {
                        value = c.formatter(props.row);
                    } else if (c.key) {
                        value = props.row[c.key]
                    }

                    return (
                        <td
                            key={i}
                            className="p-4 text-indigo-950 text-sm group-last-of-type:first-of-type:rounded-bl-md group-last-of-type:last-of-type:rounded-br-md"
                        >{value}</td>
                    )
                })
            }
        </tr>
    )
}

export const GroupEmployees = (props: {
    group: GroupDetails;
}) => {
    const router = useRouter()
    const [archiveModal, setArchiveModal] = useState<boolean>(false);
    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [roleSetId, setRoleSetId] = useState<number>(0);
    const [search, setSearch] = useState<string>("");

    const [availableRoles, setAvailableRoles] = useState<{
        id: number,
        name: string,
        rank: number
    }[]>([]);

    const roleCache = useSWR(
        `/api/groups/${props.group.id}/employees/roles`,
        fetch,
        {
            revalidateOnFocus: false
        }
    );

    useEffect(() => {
        if (!roleCache.isLoading
            && roleCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await roleCache.data?.json();
                    if (body.roles) {
                        setAvailableRoles(body.roles);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [roleCache])

    const [previousCursor, setPreviousCursor] = useState<string>();
    const [nextCursor, setNextCursor] = useState<string>();
    const [display, setDisplay] = useState<Employee[]>([]);
    const [data, setData] = useState<Employee[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const loadTable = async (
        cursor?: string
    ) => {
        if (roleSetId > 0) {
            setLoading(true);
            const response = await fetch(
                `/api/groups/${props.group.id}/employees?roleSetId=${roleSetId}${cursor ? `&cursor=${cursor}` : ""}`
            );

            try {
                const body = await response.json();
                if (body.error) {
                    throw Error(body.error)
                } else {
                    if (body.previousCursor) {
                        setPreviousCursor(body.previousCursor as string);
                    } else {
                        setPreviousCursor(undefined);
                    }

                    if (body.nextCursor) {
                        setNextCursor(body.nextCursor as string);
                    } else {
                        setNextCursor(undefined);
                    }

                    if (body.users) {
                        setData(body.users as Employee[]);
                    }

                    setLoading(false);
                }
            } catch (error) {
                toast.error(error!.toString());
            }
        }
    }

    useEffect(() => {
        let sortedOptions = availableRoles.sort((a, b) => a.rank - b.rank).filter(r => r.rank >= (props.group.trackingRank || 0));
        if (sortedOptions.length > 0) {
            setRoleSetId(sortedOptions[0].id);
        }
    }, [availableRoles])

    useEffect(() => {
        console.log(roleSetId);
        loadTable();
    }, [roleSetId]);

    useEffect(() => {
        if (search) {
            setDisplay(data.filter(d => d.name.toLowerCase().includes(search.toLowerCase())))
        } else {
            setDisplay(data);
        }
    }, [search, data])

    const columns: column[] = [
        {
            display: "Username",
            key: "preferredUsername"
        },
        {
            display: "Display Name",
            key: "name"
        },
        {
            display: "Active Time",
            formatter: (row) => {
                let user = row as Employee;
                console.log(user);
                let total = user.activites.map(a => a.length).reduce((a, b) => (a ? a : 0) + (b ? b : 0), 0);
                return Duration.fromMillis(total || 0).toFormat("hh'hr' mm'min'")
            }
        },
        {
            display: "Events",
            formatter: (row) => {
                return row.events.length.toString()
            }
        },
        {
            display: "Vacations",
            formatter: (row) => {
                return `${row.vacations.length.toString()} Approved`
            }
        },
        {
            display: "Status",
            formatter: (row) => {
                let user = row as Employee;
                let total = (user.activites.map(a => a.length).reduce((a, b) => (a ? a : 0) + (b ? b : 0), 0) || 0) / (1000 * 60 * 60);
                let events = row.events.length;

                let status: 0 | 1 | 2 | 3 = 0;
                if (total > 0 || events > 0) {
                    status = 1;
                }

                if (
                    props.group.activityRequirement
                    && props.group.activityRequirement > 0
                    && props.group.sessionRequirement
                    && props.group.sessionRequirement > 0
                ) {
                    if (total > props.group.activityRequirement && events > props.group.sessionRequirement) {
                        status = 2
                    }
                } else if (
                    props.group.activityRequirement
                    && props.group.activityRequirement > 0
                ) {
                    if (total > props.group.activityRequirement) {
                        status = 2
                    }
                } else if (
                    props.group.sessionRequirement
                    && props.group.sessionRequirement > 0
                ) {
                    if (events > props.group.sessionRequirement) {
                        status = 2
                    }
                }

                if (row.vacations.length > 0) {
                    status = 3;
                }

                return <>
                    <span
                        className={`text-indigo-50 text-xs font-semibold px-4 py-1 rounded-full ${(status === 0)
                            ? "bg-red-500"
                            : status === 2
                                ? "bg-green-500"
                                : status === 3
                                    ? "bg-indigo-500"
                                    : "bg-orange-500"
                            } w-fit`}
                    >{
                            (status === 0)
                                ? "NOT STARTED"
                                : status === 2
                                    ? "COMPLETED"
                                    : status === 3
                                        ? "IMMUNE"
                                        : "IN PROGRESS"
                        }</span>
                </>
            }
        }
    ]

    return (
        <div
            className="flex flex-col gap-2 bg-indigo-50 rounded-md shadow-md p-8"
        >
            <div
                className="flex flex-col gap-4 w-full"
            >
                <div
                    className="flex flex-row justify-between w-full"
                >
                    <div
                        className="flex flex-row gap-2 my-auto"
                    >
                        <div
                            className={`${previousCursor ? "bg-indigo-500" : "bg-indigo-700"} text-indigo-50 my-auto rounded-md hover:bg-indigo-600 transition duration-200 p-2 cursor-pointer`}
                            onClick={() => {
                                loadTable(previousCursor);
                            }}
                        >
                            <HiChevronLeft />
                        </div>
                        <div
                            className={`${nextCursor ? "bg-indigo-500" : "bg-indigo-700"} text-indigo-50 my-auto rounded-md hover:bg-indigo-600 transition duration-200 p-2 cursor-pointer`}
                            onClick={() => {
                                loadTable(nextCursor);
                            }}
                        >
                            <HiChevronRight />
                        </div>
                        <span
                            className="text-indigo-950 text-xs my-auto"
                        >Showing {display.length} out of {data.length}</span>
                    </div>
                    <div
                        className="flex flex-row gap-2 my-auto"
                    >
                        <span
                            className="w-fit rounded-full shadow-md px-4 py-1 bg-indigo-500 text-indigo-50 text-sm font-semibold hover:bg-indigo-600 hover:shadow-lg transition duration-200 cursor-pointer"
                            onClick={() => {
                                setArchiveModal(true);
                            }}
                        >Run Archive</span>
                        <span
                            className="w-fit rounded-full shadow-md px-4 py-1 bg-indigo-500 text-indigo-50 text-sm font-semibold hover:bg-indigo-600 hover:shadow-lg transition duration-200 cursor-pointer"
                            onClick={() => {
                                setFilterModal(true);
                            }}
                        >Filters</span>
                    </div>
                </div>
                {
                    loading
                        ? <div
                            className="w-full flex flex-row"
                        >
                            <MoonLoader
                                size={32}
                                className={"flex mx-auto my-auto"}
                                color={"#6366f1"}
                            />
                        </div>
                        :
                        <table
                            className="table-auto rounded-md shadow-md w-full overflow-x-auto"
                        >
                            <thead>
                                <tr
                                    className="bg-indigo-500 text-indigo-50 rounded-t-md"
                                >
                                    {
                                        columns.map(c => (
                                            <th
                                                key={c.display}
                                                className="text-left text-sm font-semibold p-4 first-of-type:rounded-tl-md last-of-type:rounded-tr-md"
                                            >{c.display}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody
                                className="relative"
                            >
                                {
                                    display.map((d, i) => (
                                        <TableRow
                                            key={i}
                                            row={d}
                                            columns={columns}
                                            rowClick={() => {
                                                router.replace(`/client/groups/${props.group.id}/profile/${d.id}`)
                                            }}
                                        />
                                    ))
                                }
                            </tbody>
                        </table>
                }
                <Modal
                    isOpen={filterModal}
                    onClose={() => {
                        setFilterModal(false);
                    }}
                    title={"Table Filters"}
                    body={
                        <div
                            className="flex flex-col w-full gap-4"
                        >
                            <Select
                                label={"Role"}
                                options={availableRoles.filter(r => r.rank >= (props.group.trackingRank || 0)).map(r => ({
                                    display: r.name,
                                    value: r.id.toString()
                                }))}
                                value={roleSetId.toString()}
                                onChange={(event) => {
                                    setRoleSetId(Number(event.target.value))
                                }}
                                className={"w-full"}
                            />
                            <Input
                                label={"Search"}
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                }}
                            />
                        </div>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                                onClick={() => {
                                    setFilterModal(false);
                                }}
                            >Apply</button>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                                onClick={() => {
                                    setFilterModal(false);
                                }}
                            >Cancel</button>
                        </>
                    }
                />
                <CreateArchive
                    isOpen={archiveModal}
                    onClose={() => {
                        setArchiveModal(false);
                    }}
                    refresh={loadTable}
                    group={props.group}
                />
            </div>
        </div>
    )
}
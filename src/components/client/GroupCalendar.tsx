import useSWR from "swr";
import { useState, useEffect } from "react";

import { Group, GroupVacation, User } from "@prisma/client";
import { DateTime } from "luxon";
import { Table } from "../form/Table";
import { VacationModal, setVacationStatus } from "./modals/VacationModal";
import { HiCheck, HiX } from "react-icons/hi";
import { useGroup } from "@/app/client/groups/group";
import { useAuth } from "@/app/client/auth";

type VacationDetails = GroupVacation & {
    author: User,
    modifier?: User
}

export const GroupCalendar = (props: {
    group: Group
}) => {
    const group = useGroup();
    const auth = useAuth();

    const [startOfPeriod, setStartOfPeriod] = useState<DateTime>();
    const [endOfPeriod, setEndOfPeriod] = useState<DateTime>();

    const vacationsCache = useSWR(
        () => {
            return startOfPeriod && endOfPeriod ? `/api/groups/${props.group.id}/vacations?from=${startOfPeriod.toMillis()}&to=${endOfPeriod.toMillis()}` : null
        },
        fetch
    );

    useEffect(() => {
        if (!vacationsCache.isLoading
            && vacationsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await vacationsCache.data?.json();
                    if (body.vacations) {
                        setVacations(body.vacations);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [props, vacationsCache]);

    const [vacationModal, setVacationModal] = useState<boolean>(false);

    const [vacations, setVacations] = useState<VacationDetails[]>([]);
    const [activeVacation, setActiveVacation] = useState<VacationDetails>();
    const [pending, setPending] = useState<VacationDetails[]>([]);
    const [days, setDays] = useState<{
        continuedVacations: (VacationDetails | null)[]
        vacations: VacationDetails[],
        date: DateTime
    }[][]>([]);

    useEffect(() => {
        const startOfMonth = DateTime.now().setZone("Etc/UTC").startOf("month");
        for (let i = 0; i < 5; i++) {
            const startOfWeek = startOfMonth.startOf("week").plus({ weeks: i }).startOf("day");
            if (i === 0) {
                setStartOfPeriod(startOfWeek.startOf("month"));
            }

            for (let a = 0; a < 7; a++) {
                const startOfDay = startOfWeek.plus({ days: a }).startOf("day");
                if (i === 4 && a === 6) {
                    setEndOfPeriod(startOfDay.endOf("day"))
                }
            }
        }
    }, [props])

    useEffect(() => {
        const startOfMonth = DateTime.now().setZone("Etc/UTC").startOf("month");
        const endOfMonth = DateTime.now().setZone("Etc/UTC").endOf("month");
        let weeks = [];
        for (let i = 0; i < 5; i++) {
            let weekDays: {
                date: DateTime,
                continuedVacations: (VacationDetails | null)[],
                vacations: VacationDetails[]
            }[] = []
            const startOfWeek = startOfMonth.startOf("week").plus({ weeks: i }).startOf("day");
            let previousDayOverflows: (VacationDetails | null)[] = [];
            for (let a = 0; a < 7; a++) {
                const startOfDay = startOfWeek.plus({ days: a }).startOf("day");
                const endOfDay = startOfDay.endOf("day");

                let intersects: (VacationDetails | null)[] = [];
                let includes: (VacationDetails)[] = [];
                for (let x = 0; x < vacations.length; x++) {
                    let vacation = vacations[x];
                    let startTime = DateTime.fromJSDate(new Date(vacation.start)).setZone("Etc/UTC").startOf("day").toMillis();
                    let endTime = DateTime.fromJSDate(new Date(vacation.end)).setZone("Etc/UTC").endOf("day").toMillis();

                    if (
                        startTime === endTime
                        && startTime >= startOfDay.toMillis()
                        && startTime < endOfDay.toMillis()
                    ) {
                        includes.push(vacation);
                    } else if (
                        startTime <= startOfDay.toMillis()
                        && endTime >= startOfDay.toMillis()
                    ) {
                        let previousDayOverflowPosition = previousDayOverflows.findIndex(v => v && v.id === vacation.id)
                        if (previousDayOverflowPosition >= 0) {
                            intersects[previousDayOverflowPosition] = vacation;
                        } else {
                            let found = false;
                            for (let y = 0; !found; y++) {
                                if (!intersects[y] && !previousDayOverflows[y]) {
                                    console.log(y);
                                    intersects[y] = vacation;
                                    found = true;
                                }
                            }
                        }
                    }
                }
                
                previousDayOverflows = intersects.map(v => 
                    v === null 
                        ? null
                        : new Date(v?.end).getTime() > endOfDay.toMillis()
                            ? v
                            : null)

                weekDays.push({
                    date: startOfDay,
                    continuedVacations: intersects,
                    vacations: includes
                });
            }

            weeks.push(weekDays);
        }

        setDays(weeks);
        setPending(vacations.filter(v => v.status === "PENDING"))
        console.log(weeks);
    }, [props, vacations]);

    const refresh = () => {
        vacationsCache.mutate();
    }

    return (
        <div
            className="flex flex-col gap-4"
        >
            <div
                className="flex flex-col gap-4 bg-indigo-50 rounded-md shadow-md p-8"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold mb-4"
                >{DateTime.now().setZone("Etc/UTC").toFormat("LLLL y")} Vacations</span>
                <div
                    className="flex flex-col gap-4"
                >
                    <div
                        className="grid grid-cols-7 gap-2"
                    >
                        <span
                            className="text-indigo-950 text-xs"
                        >Mon</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Tues</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Wed</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Thur</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Fri</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Sat</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Sun</span>
                    </div>
                    <div
                        className="flex flex-col gap-4"
                    >
                        {
                            days.map(w => (
                                <div
                                    key={w[0].date.day}
                                    className={"flex flex-row gap-4 w-full pb-4 border-b-[1px] border-b-indigo-100 last-of-type:pb-0 last-of-type:border-b-0"}
                                >
                                    {
                                        w.map(d => (
                                            <div
                                                key={d.date.day}
                                                className="flex flex-col gap-2 w-full min-h-[120px] h-full pr-2 border-r-[1px] border-r-indigo-100 last-fo-type:pr-0 last-of-type:border-r-0"
                                            >
                                                <span
                                                    className={`${(
                                                        d.date.toMillis() >= DateTime.now().setZone("Etc/UTC").startOf("month").toMillis()
                                                        && d.date.toMillis() < DateTime.now().setZone("Etc/UTC").endOf("month").toMillis()
                                                    )
                                                        ? "text-indigo-950"
                                                        : "text-indigo-950 text-opacity-25"
                                                        } text-sm`}
                                                >
                                                    {d.date.toFormat("d")}
                                                </span>
                                                {
                                                    [...d.continuedVacations].map((v, i) => {
                                                        let startOfDay = d.date.setZone("Etc/UTC").startOf("day").toMillis();
                                                        let endOfDay = d.date.endOf("day").toMillis();

                                                        return v ? (
                                                            <span
                                                                key={v.id}
                                                                className={
                                                                    `
                                                                        bg-rose-500 w-auto text-xs font-semibold px-2 py-1 cursor-pointer select-none
                                                                        ${(
                                                                        new Date(v.start).getTime() >= startOfDay
                                                                        && new Date(v.start).getTime() < endOfDay
                                                                    ) ? "rounded-l-md" : "ml-[-1rem]"
                                                                    } 
                                                                        ${(
                                                                        new Date(v.end).getTime() >= startOfDay
                                                                        && new Date(v.end).getTime() < endOfDay
                                                                    ) ? "rounded-r-md" : "mr-[-1rem] px-[-1rem]"
                                                                    }
                                                                        ${(
                                                                        new Date(v.start).getTime() < startOfDay
                                                                    ) ? "text-rose-500" : "text-indigo-50"
                                                                    }
                                                                    `
                                                                }
                                                                onClick={() => {
                                                                    setActiveVacation(v);
                                                                    setVacationModal(true);
                                                                }}
                                                            >
                                                                {
                                                                    (
                                                                        DateTime.fromJSDate(new Date(v.start)).setZone("Etc/UTC").toMillis() >= startOfDay
                                                                    ) ? v.author.name : "holder"
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span
                                                                key={i}
                                                                className="w-full text-xs font-semibold px-2 py-1 select-none bg-inherit text-indigo-50"
                                                            >holder</span>
                                                        )
                                                    })
                                                }
                                                {
                                                    d.vacations.map(v => (
                                                        <span
                                                            key={v.id}
                                                            className={`bg-rose-500 w-full text-xs font-semibold px-2 py-1 rounded-md text-indigo-50`}
                                                            onClick={() => {
                                                                setActiveVacation(v);
                                                                setVacationModal(true);
                                                            }}
                                                        >
                                                            {
                                                                v.author.name
                                                            }
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        ))
                                    }
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col gap-4 p-8 bg-indigo-50 rounded-md shadow-md"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >Pending Vacation Requests</span>
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
                            formatter: (row) => (group.user?.role.admin || group.user?.role.humanResources) ? (
                                <div
                                    className="flex flex-row gap-2"
                                >
                                    <HiCheck
                                        className="hover:text-green-500 transition duration-200 cursor-pointer"
                                        onClick={() => {
                                            if (props.group) {
                                                setVacationStatus(
                                                    row.id,
                                                    props.group.id,
                                                    row.author.id,
                                                    "APPROVED"
                                                )
                                            }
                                        }}
                                    />
                                    <HiX
                                        className="hover:text-red-500 transition duration-200 cursor-pointer"
                                        onClick={() => {
                                            if (props.group) {
                                                setVacationStatus(
                                                    row.id,
                                                    props.group.id,
                                                    row.author.id,
                                                    "DENIED"
                                                )
                                            }
                                        }}
                                    />
                                </div>
                            ) : ("")
                        }
                    ]}
                    data={pending}
                    rowClick={(row) => {
                        setActiveVacation(row as VacationDetails);
                        setVacationModal(true);
                    }}
                />
            </div>
            {
                activeVacation
                && <VacationModal
                    isOpen={vacationModal}
                    onClose={() => {
                        setVacationModal(false)
                    }}
                    refresh={refresh}
                    vacation={activeVacation}
                    auth={auth}
                    group={group}
                />
            }
        </div>
    )
}
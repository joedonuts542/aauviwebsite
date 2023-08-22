import useSWR from "swr";
import { useState, useEffect } from "react";

import {
    GroupMonitor
} from "@prisma/client";

import { useGroup } from "@/app/client/groups/group";
import { useAuth } from "@/app/client/auth";
import { HiClipboardCheck, HiUsers } from "react-icons/hi";

import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DateTime } from "luxon";

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
)

export const GroupMonitors = () => {
    const group = useGroup();
    const auth = useAuth();

    const [pastDays, setPastDays] = useState<(DateTime)[]>([]);
    const [pastDay, setPastDay] = useState<(DateTime)[]>([]);
    const [monitors, setMonitors] = useState<GroupMonitor[]>([]);
    const [weekMonitors, setWeekMonitors] = useState<GroupMonitor[]>([]);
    const monitorsCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/monitors` : null
        },
        fetch
    );

    useEffect(() => {
        if (!monitorsCache.isLoading
            && monitorsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await monitorsCache.data?.json();
                    if (body.pastDay) {
                        setMonitors(body.pastDay);
                    }

                    if (body.pastWeek) {
                        setWeekMonitors(body.pastWeek);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [monitorsCache]);

    useEffect(() => {
        const today = DateTime.now().startOf("day");
        const hour = DateTime.now().startOf("hour");
        
        let days: (DateTime)[] = [];
        let hours: (DateTime)[] = [];
        for (let i = 0; i < 6; i++) {
            days.push(today.minus({ days: i }).startOf("day"));
        }

        for (let i = 0; i < 24; i++) {
            hours.push(hour.minus({ hours: i }).startOf("hour"));
        }

        setPastDays(days.reverse());
        setPastDay(hours.reverse())
    }, []);

    const refresh = () => {
        monitorsCache.mutate();
    }

    return (
        <div
            className="flex flex-col gap-4"
        >
            <div
                className="flex flex-row gap-4 w-full"
            >
                <div
                    className="flex flex-col rounded-md shadow-md p-8 bg-indigo-50 w-full"
                >
                    <div
                        className="flex flex-col w-12 h-12 rounded-full bg-indigo-500"
                    >
                        <HiUsers
                            className="text-indigo-50 mx-auto my-auto"
                        />
                    </div>
                    <div
                        className="flex flex-row mt-4 gap-2"
                    >
                        <span
                            className="text-indigo-950 text-4xl font-semibold"
                        >32</span>
                        <span
                            className="text-indigo-950 text-md font-semibold mt-auto"
                        >USERS</span>
                    </div>
                    <span
                        className="text-indigo-950 text-xs"
                    >
                        Average Player Count
                    </span>
                </div>
                <div
                    className="flex flex-col rounded-md shadow-md p-8 bg-indigo-50 w-full"
                >
                    <div
                        className="flex flex-col w-12 h-12 rounded-full bg-indigo-500"
                    >
                        <HiClipboardCheck
                            className="text-indigo-50 mx-auto my-auto"
                        />
                    </div>
                    <div
                        className="flex flex-row mt-4 gap-2"
                    >
                        <span
                            className="text-indigo-950 text-4xl font-semibold"
                        >58</span>
                        <span
                            className="text-indigo-950 text-md font-semibold mt-auto"
                        >%</span>
                    </div>
                    <span
                        className="text-indigo-950 text-xs"
                    >
                        Player-Employee Ratio
                    </span>
                </div>
            </div>
            <div
                className="flex flex-col gap-4 rounded-md shadow-md p-8 bg-indigo-50"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >Past Week Breakdown</span>
                <Line
                    data={{
                        labels: pastDays.map(d => d.toFormat("cccc")),
                        datasets: [
                            {
                                label: "Average Players",
                                borderColor: "#ec4899",
                                backgroundColor: "#ec4899",
                                data: weekMonitors.map(m => m.userCount),
                                borderWidth: 1
                            },
                            {
                                label: "Average Employees",
                                borderColor: "#3b82f6",
                                backgroundColor: "#3b82f6",
                                data: weekMonitors.map(m => m.employeeCount),
                                borderWidth: 1
                            },
                            {
                                label: "Average Chats",
                                borderColor: "#14b8a6",
                                backgroundColor: "#14b8a6",
                                data: weekMonitors.map(m => m.avgChats),
                                borderWidth: 1
                            },
                            {
                                label: "Average Time",
                                borderColor: "#f59e0b",
                                backgroundColor: "#f59e0b",
                                data: weekMonitors.map(m => m.avgTime),
                                borderWidth: 1
                            }
                        ]
                    }}
                />
            </div>
            <div
                className="flex flex-col gap-4 rounded-md shadow-md p-8 bg-indigo-50"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >Past Day Breakdown</span>
                <Line
                    data={{
                        labels: pastDay.map(d => d.toFormat("t")),
                        datasets: [
                            {
                                label: "Average Players",
                                borderColor: "#ec4899",
                                backgroundColor: "#ec4899",
                                data: monitors.map(m => m.userCount),
                                borderWidth: 1
                            },
                            {
                                label: "Average Employees",
                                borderColor: "#3b82f6",
                                backgroundColor: "#3b82f6",
                                data: monitors.map(m => m.employeeCount),
                                borderWidth: 1
                            },
                            {
                                label: "Average Chats",
                                borderColor: "#14b8a6",
                                backgroundColor: "#14b8a6",
                                data: monitors.map(m => m.avgChats),
                                borderWidth: 1
                            },
                            {
                                label: "Average Time",
                                borderColor: "#f59e0b",
                                backgroundColor: "#f59e0b",
                                data: monitors.map(m => m.avgTime),
                                borderWidth: 1
                            }
                        ]
                    }}
                />
            </div>
        </div>
    )
}
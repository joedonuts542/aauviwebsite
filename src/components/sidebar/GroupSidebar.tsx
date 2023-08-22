"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
    HiAdjustments,
    HiAnnotation,
    HiBadgeCheck,
    HiCalendar,
    HiChartBar,
    HiClipboardList,
    HiClock,
    HiCog,
    HiColorSwatch,
    HiFingerPrint,
    HiFolder,
    HiFolderOpen,
    HiHeart,
    HiHome,
    HiLocationMarker,
    HiSparkles,
    HiUser
} from "react-icons/hi";

import Link from "next/link";
import { useGroup } from "@/app/client/groups/group";

export const GroupSidebar = () => {
    const group = useGroup();

    const path = usePathname();
    const [pathname, setPathname] = useState<string[]>([]);

    useEffect(() => {
        let split = path.split("/")
        let removed = split.splice(0, 4).join("/");
        setPathname([removed, split.join("/") || "/"])
    }, [path]);

    return (
        <div
            className="flex flex-col w-80 p-8 shadow-md bg-indigo-50 justify-between max-h-screen overflow-y-auto"
        >
            <div
                className="flex flex-col mx-auto gap-2 w-full"
            >
                <Link
                    className="text-indigo-950 text-4xl font-bold mb-16"
                    href={"/client"}
                >neuro</Link>
                <Link
                    href={`${pathname[0]}/`}
                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "/"
                            ? "text-indigo-100 bg-indigo-500"
                            : "text-indigo-950"
                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                >
                    <HiHome
                        className="my-auto"
                    />
                    <span
                        className="font-semibold"
                    >Feed</span>
                </Link>
                <Link
                    href={`${pathname[0]}/stats`}
                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "stats"
                            ? "text-indigo-100 bg-indigo-500"
                            : "text-indigo-950"
                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                >
                    <HiChartBar
                        className="my-auto"
                    />
                    <span
                        className="font-semibold"
                    >Overview</span>
                </Link>
                {
                    group.group?.nodeApplications
                    && <Link
                        href={`${pathname[0]}/apps`}
                        className={`mb-4 flex flex-row w-full gap-2 px-4 py-2 rounded-md 
            ${pathname[1] === "apps"
                                ? "text-indigo-100 bg-indigo-500"
                                : "text-indigo-950"
                            }
        hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                    >
                        <HiClipboardList
                            className="my-auto"
                        />
                        <span
                            className="font-semibold"
                        >Applications</span>
                    </Link>
                }
                {
                    (
                        group.group
                        && (group.group?.nodeEvents
                            || group.group?.nodeVacations
                            || group.group?.nodeTracking
                            || group.group?.nodeAlerts)
                    ) && (
                        <div
                            className="flex flex-col gap-2 mt-4"
                        >
                            <span
                                className="text-indigo-950 text-sm font-semibold"
                            >Staffing</span>
                            <Link
                                href={`${pathname[0]}/profile`}
                                className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "profile"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiUser
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Profile</span>
                            </Link>
                            {
                                group.group.nodeEvents
                                && <Link
                                    href={`${pathname[0]}/events`}
                                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "events"
                                            ? "text-indigo-100 bg-indigo-500"
                                            : "text-indigo-950"
                                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                                >
                                    <HiLocationMarker
                                        className="my-auto"
                                    />
                                    <span
                                        className="font-semibold"
                                    >Events</span>
                                </Link>
                            }
                            {
                                group.group.nodeVacations
                                && <Link
                                    href={`${pathname[0]}/calendar`}
                                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "calendar"
                                            ? "text-indigo-100 bg-indigo-500"
                                            : "text-indigo-950"
                                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                                >
                                    <HiCalendar
                                        className="my-auto"
                                    />
                                    <span
                                        className="font-semibold"
                                    >Calendar</span>
                                </Link>
                            }
                            <Link
                                href={`${pathname[0]}/time`}
                                className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "time"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiClock
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Employees</span>
                            </Link>
                        </div>
                    )
                }
                {
                    (
                        group.group
                        && group.group.nodePartners
                    )
                    && <div
                        className="flex flex-col gap-2 mt-4"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Public Relations</span>
                        <Link
                            href={`${pathname[0]}/partners`}
                            className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "partners"
                                    ? "text-indigo-100 bg-indigo-500"
                                    : "text-indigo-950"
                                }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                        >
                            <HiHeart
                                className="my-auto"
                            />
                            <span
                                className="font-semibold"
                            >Partners</span>
                        </Link>
                    </div>
                }
                {
                    (
                        group.group
                        && (
                            group.group.nodeAnalytics
                            || group.group.nodeBoard
                            || group.group.nodeFeedback
                            || group.group.nodeHelpdesk
                        )
                    )
                    && <div
                        className="flex flex-col gap-2 mt-4"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Development</span>
                        {
                            group.group.nodeAnalytics
                            && <Link
                                href={`${pathname[0]}/monitor`}
                                className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "monitor"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiFolder
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Monitor</span>
                            </Link>
                        }
                        {
                            group.group.nodeBoard
                            && <Link
                                href={`${pathname[0]}/board`}
                                className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "board"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiBadgeCheck
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Board</span>
                            </Link>
                        }
                        {
                            group.group.nodeFeedback
                            && <Link
                                href={`${pathname[0]}/feedback`}
                                className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "feedback"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiAnnotation
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Feedback</span>
                            </Link>
                        }
                        {
                            group.group.nodeHelpdesk
                            && <Link
                                href={`${pathname[0]}/helpdesk`}
                                className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "helpdesk"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiFolderOpen
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Helpdesk</span>
                            </Link>
                        }
                    </div>
                }
                {
                    (
                        group.user
                        && (
                            group.user.role.admin
                            || group.user.role.developer
                            || group.user.role.humanResources
                            || group.user.role.publicRelations
                        )
                    ) && (
                        <>
                            {
                                group.group?.nodeAbuse
                                && <Link
                                    href={`${pathname[0]}/abuse`}
                                    className={`mt-4 flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "abuse"
                                            ? "text-indigo-100 bg-indigo-500"
                                            : "text-indigo-950"
                                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                                >
                                    <HiFingerPrint
                                        className="my-auto"
                                    />
                                    <span
                                        className="font-semibold"
                                    >Abuse</span>
                                </Link>
                            }
                            <Link
                                href={`${pathname[0]}/config`}
                                className={`mt-4 flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "config"
                                        ? "text-indigo-100 bg-indigo-500"
                                        : "text-indigo-950"
                                    }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                            >
                                <HiColorSwatch
                                    className="my-auto"
                                />
                                <span
                                    className="font-semibold"
                                >Roles</span>
                            </Link>
                            {
                                group.user.role.admin
                                && (
                                    <>
                                        <Link
                                            href={`${pathname[0]}/nodes`}
                                            className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "nodes"
                                                    ? "text-indigo-100 bg-indigo-500"
                                                    : "text-indigo-950"
                                                }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                                        >
                                            <HiAdjustments
                                                className="my-auto"
                                            />
                                            <span
                                                className="font-semibold"
                                            >Nodes</span>
                                        </Link>
                                        <Link
                                            href={`${pathname[0]}/settings`}
                                            className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "settings"
                                                    ? "text-indigo-100 bg-indigo-500"
                                                    : "text-indigo-950"
                                                }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                                        >
                                            <HiCog
                                                className="my-auto"
                                            />
                                            <span
                                                className="font-semibold"
                                            >Settings</span>
                                        </Link>
                                    </>
                                )
                            }
                        </>
                    )
                }
                <Link
                    href={`${pathname[0]}/unlimited`}
                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${pathname[1] === "unlimited"
                            ? "text-indigo-100 bg-indigo-500"
                            : "text-indigo-950"
                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                >
                    <HiSparkles
                        className="my-auto"
                    />
                    <span
                        className="font-semibold"
                    >Upgrade</span>
                </Link>
            </div>
        </div>
    )
}
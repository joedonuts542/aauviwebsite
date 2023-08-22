"use client";

import { usePathname } from "next/navigation";

import {
    HiCog,
    HiHome,
    HiTicket
} from "react-icons/hi";

import Link from "next/link";

const SidebarAccordian = (props: {

}) => {

}

export const Sidebar = () => {
    const path = usePathname();

    return (
        <div
            className="flex flex-col w-80 p-8 shadow-md bg-indigo-50 justify-between"
        >
            <div
                className="flex flex-col mx-auto gap-2 w-full"
            >
                <span
                    className="text-indigo-950 text-4xl font-bold mb-16"
                >neuro</span>
                <Link
                    href="/client"
                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${path === "/client"
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
                    >Home</span>
                </Link>
                <Link
                        href="/client/tickets"
                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${path === "/client/tickets"
                            ? "text-indigo-100 bg-indigo-500"
                            : "text-indigo-950"
                        }
                    hover:text-indigo-100 hover:bg-indigo-500 transition duration-200`}
                >
                    <HiTicket
                        className="my-auto"
                    />
                    <span
                        className="font-semibold"
                    >Tickets</span>
                </Link>
                <Link
                    href="/client/settings"
                    className={`flex flex-row w-full gap-2 px-4 py-2 rounded-md 
                        ${path === "/client/settings"
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
            </div>
        </div>
    )
}
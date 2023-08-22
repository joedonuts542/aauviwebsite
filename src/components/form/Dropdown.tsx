"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export const Dropdown = (props: {
    isOpen: boolean;
    onClose: () => void;
    options: {
        key: string,
        display: React.ReactNode | string,
        onClick: (close: () => void) => void
    }[];
}) => (
    <div
        className={`absolute top-[2.5rem] right-0 bg-indigo-50 rounded-lg shadow-lg border-[1px] border-indigo-100 py-1 transition duration-200 w-48 max-h-32 overflow-y-auto`}
        hidden={props.isOpen ? undefined : true}
    >
        {
            props.options.map(o => (
                <div
                    key={o.key}
                    className="flex flex-row p-2 text-indigo-950 hover:bg-indigo-500 hover:text-indigo-50 transition duration-200"
                    onClick={() => {
                        o.onClick(props.onClose);
                    }}
                >
                    <span
                        className="text-sm font-semibold"
                    >{o.display}</span>
                </div>
            ))
        }
    </div>
)
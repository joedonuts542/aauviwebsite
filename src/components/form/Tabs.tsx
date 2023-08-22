import { useState } from "react";

export const Tabs = (props: {
    tabs: {
        key: string,
        display: string,
        content: React.ReactNode
    }[];
}) => {
    const [tab, setTab] = useState<string>(props.tabs[0].key)

    return (
        <div
            className="flex flex-col w-full gap-4"
        >
            <div
                className="flex flex-row gap-2 rounded-md shadow-md bg-indigo-50 p-8 overflow-x-auto"
            >
                {
                    props.tabs.map((t) => (
                        <div
                            key={t.key}
                            className="group min-w-fit cursor-pointer"
                        >
                            <span
                                className={`
                                    ${tab === t.key ? "bg-indigo-500 text-indigo-50 " : "bg-inherit text-indigo-950 "}
                                    px-4 py-2 text-md font-semibold rounded-md hover:bg-indigo-500 hover:text-indigo-50 transition duration-200
                                `}
                                onClick={() => {
                                    setTab(t.key);
                                }}
                            >{t.display}</span>
                        </div>
                    ))
                }
            </div>
            {
                    tab
                    && <div
                        className="flex flex-col"
                    >
                        {
                            props.tabs.findIndex(t => t.key === tab) >= 0
                                ? props.tabs[props.tabs.findIndex(t => t.key === tab)].content
                                : <span
                                    className="text-indigo-950 text-sm"
                                >No tab available</span>
                        }
                    </div>
                }
        </div>
    )
}
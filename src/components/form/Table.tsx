import { useEffect, useState } from "react";
import { Input } from "./TextInput";
import { Modal } from "./Modal";

export type column = {
    display: string,
    key?: string,
    formatter?: (row: { [key: string]: any }) => (React.ReactNode | string);
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

export const Table = (props: {
    columns: column[];
    data: { [key: string]: any }[];
    rowClick?: (row: { [key: string]: any }) => void;
}) => {
    const [search, setSearch] = useState<string>("");
    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [display, setDisplay] = useState<{ [key: string]: any }[]>(props.data);

    useEffect(() => {
        if (search) {
            let matched: { [key: string]: any }[] = [];
            props.data.forEach((d) => {
                Object.keys(d).forEach((k) => {
                    if (typeof d[k] === "string" || typeof d[k] === "number") {
                        if (d[k].toString().toLowerCase().includes(search)) {
                            matched.push(d);
                        }
                    }
                })
            });

            setDisplay(matched);
        } else {
            setDisplay(props.data);
        }
    }, [search, props.data])

    return (
        <div
            className="flex flex-col gap-4 w-full"
        >
            <div
                className="flex flex-row justify-between w-full"
            >
                <span
                    className="text-indigo-950 text-xs my-auto"
                >Showing {display.length} out of {props.data.length}</span>
                <span
                    className="w-fit rounded-full shadow-md px-4 py-1 bg-indigo-500 text-indigo-50 text-sm font-semibold hover:bg-indigo-600 hover:shadow-lg transition duration-200 cursor-pointer"
                    onClick={() => {
                        setFilterModal(true);
                    }}
                >Filters</span>
            </div>
            <table
                className="table-auto rounded-md shadow-md"
            >
                <thead>
                    <tr
                        className="bg-indigo-500 text-indigo-50 rounded-t-md"
                    >
                        {
                            props.columns.map(c => (
                                <th
                                    key={c.display}
                                    className="text-left text-sm font-semibold p-4 first-of-type:rounded-tl-md last-of-type:rounded-tr-md"
                                >{c.display}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        display.map((d, i) => (
                            <TableRow
                                key={i}
                                row={d}
                                columns={props.columns}
                                rowClick={props.rowClick}
                            />
                        ))
                    }
                </tbody>
            </table>
            <Modal
                isOpen={filterModal}
                onClose={() => {
                    setFilterModal(false);
                }}
                title={"Table Filters"}
                body={
                    <div
                        className="flex flex-col w-full"
                    >
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
        </div>
    )
}
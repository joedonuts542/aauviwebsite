import type {
    ReportCategory, ReportType
} from "@prisma/client";

import { useState, useEffect } from "react";

import { Modal } from "@/components/form/Modal";
import { Select, TextArea } from "@/components/form/TextInput";
import toast from "react-hot-toast";

type newReport = {
    description?: string,
    category?: ReportCategory
    type?: ReportType,
    targetId?: string
}

export const CreateReport = (props: {
    isOpen: boolean,
    onClose: () => void,
    type: ReportType,
    targetId: string
}) => {
    const [creating, setCreating] = useState<boolean>(false);
    const [newReport, setNewReport] = useState<newReport>({});

    useEffect(() => {
        setNewReport({
            ...newReport,
            type: props.type,
            targetId: props.targetId
        })
    }, [props])

    const create = async () => {
        if (!creating) {
            setCreating(true);
            const response = await fetch(
                `/api/report`,
                {
                    body: JSON.stringify({
                        ...newReport
                    }),
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        props.onClose();
                        setNewReport({});
                        toast.success("Your report has been successfully submitted!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot create new report")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={"New Alert"}
            body={
                <div
                    className="grid grid-cols-2 gap-4"
                >
                    <Select
                        label={"Type"}
                        options={["INAPPROPRIATE_CONTENT", "UNOFFICIAL_COPY", "ALT_ACCOUNT", "SPAM"].map(t => ({
                            display: `${t[0]}${t.substring(1).toLowerCase()}`.split("_").join(" "),
                            value: t
                        }))}
                        value={newReport.category}
                        onChange={(event) => {
                            setNewReport({
                                ...newReport,
                                category: event.target.value as ReportCategory
                            })
                        }}
                        className={"col-span-2"}
                    />
                    <TextArea
                        label={"Description"}
                        value={newReport.description || ""}
                        onChange={(event) => {
                            setNewReport({
                                ...newReport,
                                description: event.target.value
                            })
                        }}
                        className={"col-span-2"}
                    />
                </div>
            }
            footer={
                <>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                        onClick={create}
                        disabled={creating}
                    >Create</button>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        onClick={() => {
                            props.onClose();
                            setNewReport({});
                        }}
                    >Cancel</button>
                </>
            }
        />
    )
}
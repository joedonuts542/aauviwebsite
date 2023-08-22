import useSWR from "swr";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { useGroup } from "@/app/client/groups/group";
import { MoonLoader } from "react-spinners";

import { ApplicationQuestion, GroupApplication } from "@prisma/client";
import { Checkbox, Input, Select, TextArea } from "@/components/form/TextInput";
import { Toggle } from "@/components/form/Toggle";
import { toast } from "react-hot-toast";
import { HiArrowDown, HiArrowUp, HiDotsVertical, HiTrash } from "react-icons/hi";
import { Dropdown } from "@/components/form/Dropdown";

const Question = (props: {
    index: number,
    questions: ApplicationQuestion[]
    setQuestions: React.Dispatch<React.SetStateAction<ApplicationQuestion[]>>,
}) => {
    return (props.questions.length > 0) ? (
        <div
            className="flex flex-col p-8 rounded-md shadow-md bg-indigo-50 w-full gap-4"
        >
            <div
                className="flex flex-row w-full justify-between mb-[-1rem]"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold my-auto"
                >Question #{props.index + 1}</span>
            </div>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <Input
                    label={"Question"}
                    value={props.questions[props.index].title || ""}
                    onChange={(event) => {

                    }}
                    className="w-full"
                />
                <Select
                    options={["TEXT", "SELECT", "CHECK"].map(q => ({
                        display: `${q[0]}${q.substring(1).toLowerCase()}`,
                        value: q
                    }))}
                    label={"Type"}
                    value={props.questions[props.index].type || ""}
                    onChange={(event) => {

                    }}
                />
            </div>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <Input
                    label={"Weight"}
                    value={props.questions[props.index].weight?.toString() || ""}
                    type={"number"}
                    onChange={(event) => {

                    }}
                    className="w-full"
                />
                <Select
                    options={
                        (
                            props.questions
                            && props.questions[props.index].options
                        ) ? (
                            props.questions[props.index].options!.map(o => ({
                                display: o,
                                value: o
                            }))
                        ) : []
                    }
                    label={"Answer"}
                    value={props.questions[props.index].type || ""}
                    onChange={(event) => {

                    }}
                />
            </div>
            <TextArea
                label={"Description"}
                value={props.questions[props.index].description || ""}
                onChange={(event) => {

                }}
                helper={`${props.questions[props.index].description?.length || 0}/200`}
            />
            <div
                className="flex flex-col gap-2 w-full"
            >
                {
                    props.questions[props.index].options?.map((o, i) => (
                        <div
                            key={o}
                            className="flex flex-row w-full justify-between gap-4"
                        >
                            <Input
                                value={o}
                                onChange={(event) => {

                                }}
                                className="my-auto"
                            />
                        </div>
                    ))
                }
            </div>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <div
                    className="flex flex-row gap-2 my-auto w-fit"
                >
                    <Checkbox
                        value={props.questions[props.index].required || false}
                        size={5}
                        onChange={(event) => {

                        }}
                        className="my-auto"
                    />
                    <span
                        className="text-indigo-950 text-sm my-auto"
                    >Required</span>
                </div>
            </div>
        </div>
    ) : undefined
}

export const AppQuestions = () => {
    const { appId } = useParams();
    const group = useGroup();

    const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
    const appsCache = useSWR(
        `/api/groups/${group.group?.id}/apps/${appId}/questions`,
        fetch
    );

    useEffect(() => {
        if (
            !appsCache.isLoading
            && appsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await appsCache.data!.json();
                    if (body.questions) {
                        setQuestions(body.questions);
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [appsCache]);

    return (questions.length > 0) ? (
        <div
            className="flex flex-col gap-4"
        >
            {
                questions.map((q, i) => (
                    <Question
                        key={i}
                        index={i}
                        questions={questions}
                        setQuestions={setQuestions}
                    />
                ))
            }
        </div>
    ) : (
        <div
            className="w-full h-screen"
        >
            <MoonLoader
                size={32}
                className={"flex mx-auto my-auto"}
                color={"#6366f1"}
            />
        </div>
    )
}
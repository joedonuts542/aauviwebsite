export const MultipleChoice = (props: {
    options: string[],
    value?: string
    onChange?: (event: string) => void,
    className?: string
}) => {
    return (
        <div
            className={`flex flex-col gap-2 w-full ${props.className} py-4`}
        >
            {
                props.options.map((o, i) => (
                    <div
                        key={i}
                        className="flex flex-row w-full cursor-pointer px-4 gap-2"
                        onClick={() => {
                            if (props.onChange) {
                                props.onChange(o);
                            }
                        }}
                    >
                        <div
                            className="flex flex-col my-auto w-4 h-4 rounded-full bg-indigo-100"
                        >
                            {
                                o === props.value
                                && <div
                                    className="w-2 h-2 rounded-full mx-auto my-auto bg-indigo-500"
                                />
                            }
                        </div>
                        <span
                            className="text-indigo-950 text-sm my-auto"
                        >{o}</span>
                    </div>
                ))
            }
        </div>
    )
}
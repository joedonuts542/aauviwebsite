export const Input = (props: {
    label?: string,
    helper?: string,
    type?: string,
    value?: string,
    readOnly?: boolean,
    error?: string,
    className?: string,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div
        className={`flex flex-col w-full ${props.className}`}
    >
        {
            props.label
            && <span className="text-indigo-950 text-sm">
                {props.label}
            </span>
        }
        <div className={props.label && "mt-2"}>
            <input
                type={props.type || "text"}
                value={props.value}
                readOnly={props.readOnly}
                className={`
                    bg-inherit w-full rounded-md border-0 py-1.5 px-2 text-indigo-950 ring-1 ring-inset ring-indigo-200 placeholder:text-indigo-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 ${props.error ? "ring-2 ring-inset ring-red-500" : ""}
                `}
                onChange={props.onChange}
            />
        </div>
        {
            (props.helper || props.error)
            && <span className={`text-xs mt-[0.25rem] ${props.error ? "text-red-500" : "text-indigo-950"}`}>
                {props.error ? props.error : props.helper}
            </span>
        }
    </div>
)

export const TextArea = (props: {
    rows?: number,
    label?: string,
    helper?: string,
    type?: string,
    value?: string,
    readOnly?: boolean,
    error?: string,
    className?: string,
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
    <div
        className={`flex flex-col w-full ${props.className}`}
    >
        {
            props.label
            && <span className="text-indigo-950 text-sm">
                {props.label}
            </span>
        }
        <div className="mt-2">
            <textarea
                rows={props.rows || 2}
                className={`block bg-inherit w-full rounded-md border-0 py-1.5 px-2 text-indigo-950 shadow-sm ring-1 ring-inset ring-indigo-200 placeholder:text-indigo-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 ${props.error ? "ring-2 ring-inset ring-red-500" : ""}`}
                value={props.value}
                readOnly={props.readOnly}
                onChange={props.onChange}
            />
        </div>
        {
            (props.helper || props.error)
            && <span className={`text-xs mt-[0.25rem] ${props.error ? "text-red-500" : "text-indigo-950"}`}>
                {props.error ? props.error : props.helper}
            </span>
        }
    </div>
)

export const Select = (props: {
    options: { display: string, value: string }[]
    label?: string,
    helper?: string,
    type?: string,
    value?: string,
    readOnly?: boolean,
    error?: string,
    className?: string,
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
    <div
        className={`flex flex-col w-full ${props.className}`}
    >
        {
            props.label
            && <span className="text-indigo-950 text-sm">
                {props.label}
            </span>
        }
        <div className="mt-2 w-full">
            <select
                className={`bg-inherit flex w-full rounded-md border-0 py-1.5 text-indigo-950 shadow-sm ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:leading-6 ${props.error ? "ring-2 ring-inset ring-red-500" : ""}`}
                value={props.value}
                disabled={props.readOnly}
                onChange={props.onChange}
            >
                <option>None</option>
                {props.options.map(o => (
                    <option key={o.value} value={o.value}>{o.display}</option>
                ))}
            </select>
        </div>
        {
            (props.helper || props.error)
            && <span className={`text-xs mt-[0.25rem] ${props.error ? "text-red-500" : "text-indigo-950"}`}>
                {props.error ? props.error : props.helper}
            </span>
        }
    </div>
)

export const Checkbox = (props: {
    value?: boolean,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    size?: number,
    readOnly?: boolean,
    className?: string
}) => (
    <input
        readOnly={props.readOnly}
        type="checkbox"
        checked={props.value}
        onChange={props.onChange}
        className={`${props.size ? `h-${props.size} w-${props.size}` : `h-4 w-4`} rounded border-indigo-100 text-indigo-500 focus:ring-indigo-500 ${props.className}`}
    />
)
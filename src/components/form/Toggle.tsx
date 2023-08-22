export const Toggle = (props: {
    checked?: boolean,
    onChange?: (event: boolean) => void,
    disabled?: boolean
}) => (
    <div className={`relative flex flex-row ${props.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => {
            if (props.onChange && !props.disabled) { props.onChange(props.checked ? false : true) }
        }}
    >
        <input 
            hidden
            disabled={props.disabled}
            type="checkbox"
            className="hidden peer"
            checked={props.checked}
        />
        <div
            className="w-8 h-5 bg-indigo-100 rounded-full peer-checked:bg-indigo-500"
        />
        <div
            className="absolute w-5 h-5 bg-white rounded-full border-2 border-indigo-100 peer-checked:border-indigo-500 peer-checked:right-0"
        />
    </div>
)
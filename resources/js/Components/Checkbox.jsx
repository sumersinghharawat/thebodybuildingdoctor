export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-edge text-accent shadow-sm focus:ring-accent ' +
                className
            }
        />
    );
}

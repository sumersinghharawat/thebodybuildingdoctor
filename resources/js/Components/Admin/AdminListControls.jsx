export function StatusBadge({ status, map = {} }) {
    const defaults = {
        active: 'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200',
        published:
            'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200',
        pending:
            'border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200',
        new: 'border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200',
        draft: 'border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200',
        contacted:
            'border-sky-300/70 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200',
        expired:
            'border-edge bg-surface-hover text-muted',
        revoked:
            'border-red-300/70 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300',
        closed: 'border-edge bg-surface-hover text-muted',
    };

    const className = map[status] || defaults[status] || defaults.closed;

    return <span className={`pill shrink-0 ${className}`}>{status}</span>;
}

export function FilterChips({ value, onChange, options }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const active = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            active
                                ? 'bg-accent text-white'
                                : 'border border-edge bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
                        }`}
                    >
                        {option.label}
                        {typeof option.count === 'number' && (
                            <span
                                className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${
                                    active ? 'bg-white/20 text-white' : 'bg-surface-hover text-faint'
                                }`}
                            >
                                {option.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export function AdminListToolbar({
    query,
    onQueryChange,
    placeholder = 'Search…',
    filter,
    onFilterChange,
    filterOptions = [],
    resultLabel,
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="search"
                    className="input-dark w-full max-w-md"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    aria-label={placeholder}
                />
                {resultLabel && <p className="text-sm text-muted">{resultLabel}</p>}
            </div>
            {filterOptions.length > 0 && (
                <FilterChips value={filter} onChange={onFilterChange} options={filterOptions} />
            )}
        </div>
    );
}

export function EmptyState({ title, description }) {
    return (
        <div className="card-surface px-6 py-10 text-center">
            <p className="font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
    );
}

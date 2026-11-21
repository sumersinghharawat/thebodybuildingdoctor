import { useMemo, useState } from 'react';

/**
 * Searchable user picker for admin grant forms.
 * Filters a long user list so admins can find members quickly.
 */
export default function AdminUserPicker({
    users = [],
    value,
    onChange,
    disabled = false,
    required = true,
    label = 'User',
}) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = [...users].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        if (!q) return list;
        return list.filter((user) =>
            [user.name, user.email, user.uid]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(q)),
        );
    }, [users, search]);

    const selected = users.find((user) => user.uid === value);

    return (
        <div className="space-y-2">
            <label className="label-dark">{label}</label>
            {!disabled && (
                <input
                    type="search"
                    className="input-dark"
                    placeholder="Type to filter by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Filter users"
                />
            )}
            {selected && !disabled && (
                <p className="text-xs text-muted">
                    Selected: <span className="text-foreground">{selected.name}</span> ({selected.email})
                </p>
            )}
            <select
                className="input-dark"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
            >
                <option value="">Select user</option>
                {filtered.map((user) => (
                    <option key={user.uid} value={user.uid}>
                        {user.name} ({user.email})
                    </option>
                ))}
            </select>
            {!disabled && search.trim() && filtered.length === 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">No users match that filter.</p>
            )}
        </div>
    );
}

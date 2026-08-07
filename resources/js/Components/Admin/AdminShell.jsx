import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminShell({ title, description = null, children, actions = null }) {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
                {(title || actions) && (
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                            {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
                            {description && <p className="text-sm text-muted">{description}</p>}
                        </div>
                        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                    </header>
                )}
                {children}
            </div>
        </AdminLayout>
    );
}

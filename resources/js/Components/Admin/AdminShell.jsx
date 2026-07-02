import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminShell({ title, children, actions = null }) {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
                {title && (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">{title}</h2>
                        {actions}
                    </div>
                )}
                {children}
            </div>
        </AdminLayout>
    );
}

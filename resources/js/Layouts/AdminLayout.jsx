import AppLayout from '@/Layouts/AppLayout';
import AdminNav from '@/Components/Admin/AdminNav';

export default function AdminLayout({ children }) {
    return (
        <AppLayout>
            <div className="border-b border-slate-800 bg-slate-950/90">
                <div className="mx-auto max-w-6xl px-6 pt-6 md:px-8">
                    <AdminNav />
                </div>
            </div>
            {children}
        </AppLayout>
    );
}

import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import ManagePasskeysForm from './Partials/ManagePasskeysForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, passkeys }) {
    return (
        <AppLayout>
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
                <header>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your account, security, and sign-in options.
                    </p>
                </header>

                <div className="card-surface p-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="card-surface p-6">
                    <UpdatePasswordForm />
                </div>

                <div className="card-surface p-6">
                    <ManagePasskeysForm passkeys={passkeys} />
                </div>

                <div className="card-surface p-6">
                    <DeleteUserForm />
                </div>
            </div>
        </AppLayout>
    );
}

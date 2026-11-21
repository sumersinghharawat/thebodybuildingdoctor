import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="space-y-2">
                <div className="pill w-fit">Details</div>
                <h2 className="text-xl font-semibold text-foreground">Profile information</h2>
                <p className="text-sm text-muted">Update your name and email address.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="name" className="label-dark">
                        Name
                    </label>
                    <input
                        id="name"
                        className="input-dark"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="label-dark">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="input-dark"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                        <p>
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-medium underline hover:opacity-80"
                            >
                                Re-send verification email
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-emerald-600 dark:text-emerald-400">
                                A new verification link has been sent to your email address.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button type="submit" className="btn-primary" disabled={processing}>
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

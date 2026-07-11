import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-red-300">Delete account</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Permanently delete your account and all associated data. This cannot be undone.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="mt-6 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-950/50"
            >
                Delete account
            </button>

            <Modal
                show={confirmingUserDeletion}
                onClose={closeModal}
                panelClassName="border border-slate-700 bg-slate-900 text-slate-100"
            >
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-semibold">Delete your account?</h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Enter your password to confirm. All of your data will be permanently removed.
                    </p>

                    <div className="mt-6">
                        <label htmlFor="delete-password" className="label-dark">
                            Password
                        </label>
                        <input
                            id="delete-password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="input-dark mt-1"
                            autoFocus
                            placeholder="Your password"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/60 disabled:opacity-50"
                            disabled={processing}
                        >
                            Delete account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}

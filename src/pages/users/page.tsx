import {createUser, deleteUser, fetchUsers, User} from "../../shared/api.ts";
import {FormEvent, Suspense, use, useState, useTransition} from "react";

const defaultUsersPromise = fetchUsers();

export function UsersPage() {
    const [usersPromise, setUsersPromise] = useState(defaultUsersPromise);
    const refetchUsers = () => {
        setUsersPromise(fetchUsers());
    }

    return (
        <main className="container mx-auto p-4 pt-10 flex flex-col gap-4">
            <h1 className="text-3xl font-bold underline">Users Page</h1>
            <section>
                <CreateUserForm refetchUsers={refetchUsers}/>
            </section>
            <section>
                <Suspense fallback={<div className="text-2xl font-bold text-sky-500">Loading...</div>}>
                    <UserList usersPromise={usersPromise} refetchUsers={refetchUsers}/>
                </Suspense>
            </section>
        </main>
    )
}

export function CreateUserForm({refetchUsers}: { refetchUsers: () => void }) {
    const [email, setEmail] = useState<string>("");
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await createUser({
                email,
                id: crypto.randomUUID()
            });
            startTransition(() => {
                refetchUsers();
                setEmail("");
            })
        })
    }

    return (
        <form className="flex gap-2" onSubmit={handleSubmit}>
            <input
                className="border p-2 rounded"
                disabled={isPending}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
            />
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                disabled={isPending}
                type="submit"
            >
                Add User
            </button>
        </form>
    )
}

export function UserList({usersPromise, refetchUsers}: { usersPromise: Promise<User[]>, refetchUsers: () => void }) {
    const users = use(usersPromise)

    return (
        <div className="flex flex-col">
            {users.map(user => (
                <UserCard key={user.id} user={user} refetchUsers={refetchUsers}/>
            ))}
        </div>
    )
}

export function UserCard({user, refetchUsers}: { user: User, refetchUsers: () => void }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        startTransition(async () => {
            await deleteUser(user.id)
            startTransition(() => refetchUsers())
        })
    }
    return (
        <div className="p-2 m-2 rounded bg-gray-100 flex gap-2">
            {user.email}
            <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-auto disabled:bg-gray-400"
                disabled={isPending}
                onClick={handleDelete}
                type="button"
            >
                Delete
            </button>
        </div>
    )
}
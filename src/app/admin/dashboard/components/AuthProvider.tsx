'use client'
import { checkAuth } from "@/actions/auth-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthProvider({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const router = useRouter();
    const [auth, setAuth] = useState<boolean>(false);

    useEffect(() => {
        async function check() {
            const { success } = await checkAuth()
            if (success) {
                setAuth(true);
                return;
            } else {
                setAuth(false);
                return router.replace("/admin/auth/login")
            }
        }
        check()
    }, [])

    if (!auth) {
        return <div>not authenticated - <Link className="text-amber-500 cursor-pointer" href="/admin/auth/login">log in </Link>to continue</div>
    }

    return (<>{ children }</>)
};


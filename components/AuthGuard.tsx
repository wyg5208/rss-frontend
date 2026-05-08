"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isChecking, checkAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const valid = await checkAuth();
      if (!valid) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/login?return=${returnUrl}`);
      }
      setReady(true);
    };

    if (!isChecking) {
      // Already checked
      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/login?return=${returnUrl}`);
      }
      setReady(true);
    } else {
      verify();
    }
  }, [isAuthenticated, isChecking, checkAuth, pathname, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-14">
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

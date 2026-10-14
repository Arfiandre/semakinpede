import { useEffect, useState } from "react";
import { router, Head } from "@inertiajs/react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isSuperadminAuthenticated } from "@/lib/authStorage";

export default function AdminLoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isSuperadminAuthenticated()) {
      router.replace("/admin");
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Head title="Gerbang Akses Superadmin" />
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-mono">
          Memuat Gerbang Akses Superadmin...
        </p>
      </div>
    );
  }

  return (
    <>
      <Head title="Login Superadmin - Semakin Pede" />
      <AdminLoginForm
        onSuccess={() => {
          router.replace("/admin");
        }}
      />
    </>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Komunitas Semakin Pede",
  description: "Kelola lead dan data komunitas Semakin Pede.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

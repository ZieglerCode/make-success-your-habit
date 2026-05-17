import {redirect} from "next/navigation";
import {AdminShell} from "@/components/admin-shell";
import {currentAdmin} from "@/lib/auth";

export async function AdminScreen({children}: {children: React.ReactNode}) {
  const user = await currentAdmin();

  if (!user) redirect("/admin/login");

  return <AdminShell user={user}>{children}</AdminShell>;
}

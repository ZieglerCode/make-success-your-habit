import type {Metadata} from "next";
import {LoginPageContent} from "@/components/login-form";

export const metadata: Metadata = {
  title: "Admin Login | Make Success Your Habit",
};

export default function AdminLoginPage() {
  return <LoginPageContent />;
}

import DashboardGuard from "@/components/DashboardGuard";
import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tipsters", label: "Tipsters" },
  { href: "/admin/tips", label: "Tips" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/home-images", label: "Home Images" },
];

export default function AdminDashboardLayout({ children }) {
  return (
    <DashboardGuard role="admin">
      <DashboardShell brand="Admin" navItems={NAV}>
        {children}
      </DashboardShell>
    </DashboardGuard>
  );
}
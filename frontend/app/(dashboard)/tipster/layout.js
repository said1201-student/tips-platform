import DashboardGuard from "@/components/DashboardGuard";
import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/tipster", label: "Dashboard" },
  { href: "/tipster/tips", label: "My Tips" },
  { href: "/tipster/tips/create", label: "Create Tip" },
  { href: "/tipster/profile", label: "Edit Profile" },
  { href: "/tipster/settings", label: "Settings" },
];

export default function TipsterDashboardLayout({ children }) {
  return (
    <DashboardGuard role="tipster">
      <DashboardShell brand="Tipster" navItems={NAV}>
        {children}
      </DashboardShell>
    </DashboardGuard>
  );
}
export type DashboardNavItem = {
  label: string;
  href: string;
  description: string;
};

export const dashboardNav: DashboardNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    description: "Plan health and usage snapshot",
  },
  {
    label: "Keys",
    href: "/dashboard/keys",
    description: "API keys for your backends",
  },
  {
    label: "Usage",
    href: "/dashboard/usage",
    description: "Messages, chatters, and calls",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    description: "Plan, invoices, and payment",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    description: "Tenant, webhooks, and features",
  },
];

export const SESSION_COOKIE = "sendsar_console_session";

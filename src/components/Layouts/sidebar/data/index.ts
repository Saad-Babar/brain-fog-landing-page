import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "eCommerce",
            url: "/dashboard/admin",
          },
        ],
      },
      {
        title: "Calendar",
        url: "/dashboard/admin/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: "/dashboard/admin/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/dashboard/admin/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/dashboard/admin/forms/form-layout",
          },
        ],
      },
      {
        title: "Tables",
        url: "/dashboard/admin/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/dashboard/admin/tables",
          },
        ],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/dashboard/admin/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/dashboard/admin/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/dashboard/admin/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/dashboard/admin/ui-elements/buttons",
          },
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/dashboard/admin/auth/sign-in",
          },
        ],
      },
    ],
  },
];

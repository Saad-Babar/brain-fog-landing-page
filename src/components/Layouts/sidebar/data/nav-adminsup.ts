import * as Icons from "../icons";

export const NAV_DATA = [
  { 
    label: "ADMIN-SUP MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Admin Dashboard",
            url: "/dashboard/admin-sup",
          },
        ],
      },
      {
        title: "Manage Doctors",
        url: "/dashboard/admin-sup/doctors",
        icon: Icons.User,
        items: [],
      },
      {
        title: "System Settings",
        url: "/dashboard/admin-sup/settings",
        icon: Icons.Alphabet,
        items: [],
      },
    ],
  },
]; 
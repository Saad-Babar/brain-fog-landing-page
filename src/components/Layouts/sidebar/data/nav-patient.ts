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
            title: "My Dashboard",
            url: "/dashboard/patient",
          },
        ],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "English Form",
            url: "/dashboard/patient/mmse-form",
          },
          {
            title: "URDU Form Layout",
            url: "/dashboard/patient/mmse-form-urdu",
          },
        ],
      },
      {
        title: "Profile", 
        url: "/dashboard/patient/profile",
        icon: Icons.User,
        items: [],
      },
    ],
  },
]; 
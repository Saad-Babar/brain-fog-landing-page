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
            title: "Fill Form",
            url: "/dashboard/admin/mmse-form",
          },
        //   {
        //     title: "Form Layout",
        //     url: "/dashboard/admin/forms/form-layout",
        //   },
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
import { MdLogout, MdOutlinePeopleOutline, MdRotate90DegreesCw } from 'react-icons/md';
import { PiStudent, PiExamFill } from "react-icons/pi";
import { BiSolidSchool } from "react-icons/bi";
import { IoMdHome } from "react-icons/io";


export const links = [
  {
    href: "/",
    icon: IoMdHome,
    text: "Home",
  },
  {
    href: "/centers",
    icon: BiSolidSchool,
    text: "Centers",
    badge: {
      text: "Pro",
      color: "bg-gray-100 text-gray-800",
      darkColor: "dark:bg-gray-700 dark:text-gray-300",
    },
  },
  {
    href: "/students",
    icon: PiStudent,
    text: "Students",
    badge: {
      text: "4",
      color: "bg-blue-100 text-blue-800",
      darkColor: "dark:bg-blue-900 dark:text-blue-300",
    },
  },
  {
    href: "/examScores",
    icon: PiExamFill,
    text: "Exam Scores",
  },
  {
    href: "/attendance",
    icon: MdOutlinePeopleOutline,
    text: "Attendance",
  },
  {
    href: "/studentsDegrees",
    icon: MdRotate90DegreesCw,
    text: "Students Degrees",
  }
];


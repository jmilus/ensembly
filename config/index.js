import CALENDAR from 'utils/calendarUtils';

export const POSTMARK_TOKEN = "a85e382c-9b5f-4383-800a-fa1a4927ef63";

const getURL = () => {
    // console.log("env:", process.env.NODE_ENV)
    if (process.env.NODE_ENV !== 'production') {
        console.log("running in development mode...")
        return 'http://localhost:3000'
    } else {
        console.log("running a production build...")
        // console.log("process.env.NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL)
        let url =
            process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
            process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
            'http://localhost:3000';
        // Make sure to include `https://` when not localhost.
        url = url.includes('http') ? url : `https://${url}`;

        // Make sure to including trailing `/`.
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

        console.log("automatic url:", url)
        return url;
    }
}

// export const HOSTURL = dev ?  : 'https://testing-lake-seven.vercel.app';

export const HOSTURL = getURL();

export const MENUOPTIONS = [
    {
        name: "Dashboard",
        icon: "space_dashboard",
        route: "/dashboard"
    },
    {
        name: "Members",
        icon: "emoji_people",
        route: "/members"
    },
    {
        name: "Ensembles",
        icon: "theater_comedy",
        route: "/ensembles"
    },
    {
        name: "Calendar",
        icon: "calendar_month",
        route: `/calendar/${CALENDAR.getDashedValue(new Date()).slice(0, 10)}`
    },
    {
        name: "Messages",
        icon: "email",
        route: "/messages/forum"
    },
    {
        spacer: true
    },
    {
        name: "Settings",
        icon: "settings",
        route: "/settings"
    },
];
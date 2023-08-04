const getURL = () => {
    // console.log("env:", process.env.NODE_ENV)
    if (process.env.NODE_ENV !== 'production') {
        console.log("running in development mode...")
        return 'http://localhost:3000'
    } else {
        console.log("running a production build...")
        let url =
            process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
            process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
            'http://localhost:3000';
        // Make sure to include `https://` when not localhost.
        url = url.includes('http') ? url : `https://${url}`;

        // Make sure to including trailing `/`.
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

        return url;
    }
}

// export const HOSTURL = dev ?  : 'https://testing-lake-seven.vercel.app';

export const HOSTURL = getURL();

export const MENUOPTIONS = [
    {
        name: "Dashboard",
        icon: "space_dashboard",
        route: ""
    },
    {
        name: "Ensembles",
        icon: "theater_comedy",
        route: "ensembles"
    },
    {
        name: "Calendar",
        icon: "calendar_month",
        route: "calendar"
    },
    {
        name: "Members",
        icon: "emoji_people",
        route: "members"
    },
    {
        name: "Messages",
        icon: "email",
        route: "messages"
    },
    {
        spacer: true
    },
    {
        name: "Settings",
        icon: "settings",
        route: "settings"
    },
];
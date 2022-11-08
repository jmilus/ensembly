const dev = process.env.NODE_ENV !== 'production';

export const MENUOPTIONS = [
    {
        name: "Dashboard",
        icon: "space_dashboard",
        route: "dashboard"
    },
    {
        name: "Ensembles",
        icon: "theater_comedy",
        route: "ensembles"
    },
    {
        name: "Events",
        icon: "calendar_month",
        route: "events"
    },
    {
        name: "Members",
        icon: "emoji_people",
        route: "members"
    },
    {
        name: "Communications",
        icon: "email",
        route: "communications"
    },
    {
        name: "Settings",
        icon: "settings",
        route: "settings"
    },
];

export const server = dev ? 'http://localhost:3000' : '';
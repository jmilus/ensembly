const ONEDAY = 86400000;

export const CAL = {
    weekday: {
        short: [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ],
        long: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ]
    },
    month: {
        short: [],
        long: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]
    }
}

const doubleDigit = (num) => {
    let leadingNum = "";
    if (num < 10) leadingNum = "0";
    return `${leadingNum}${num}`;
}

export const getTime = (mydate) => {
    const date = new Date(mydate);
    const phase = date.getHours() > 12;
    const hour = date.getHours() - (phase ? 12 : 0);
    return `${hour === 0 ? 12 : hour}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} ${phase ? "PM" : "AM"}`
}

export const getDashedDate = (mydate) => {
    const date = new Date(mydate);
    return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())}`
}

export const get24Time = (mydate) => {
    const date = new Date(mydate);
    return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}:${doubleDigit(date.getSeconds())}`;
}

export const getFirstOfMonth = (myDate) => {
    const thisDate = new Date(myDate)
    return new Date(thisDate.getFullYear(), thisDate.getMonth(), 1);
}

export const getLastOfMonth = (myDate) => {
    const thisDate = new Date(myDate)
    return new Date(thisDate.getFullYear(), thisDate.getMonth() + 1, 0);
}

export const getCalendarView = (myDate, totalDays = 34) => {
    const d = myDate ? new Date(myDate) : new Date();

    const startDate = new Date(d.setDate(d.getDate() - d.getDay()));
    const endDate = new Date(d.setDate(d.getDate() + totalDays));

    return { startDate, endDate, totalDays };
}

export const compareDates = (firstDate, secondDate) => {
    let first = new Date(firstDate);
    let second = new Date(secondDate);
    first = new Date(first.toLocaleDateString());
    second = new Date(second.toLocaleDateString());
    return Math.floor((second - first) / ONEDAY); // returns positive int if dates are in chronological order (first, THEN second)
}

const CALENDAR = {
    getTime,
    get24Time,
    getDashedDate,
    getFirstOfMonth,
    getLastOfMonth,
    getCalendarView,
    compareDates,
}

export default CALENDAR;
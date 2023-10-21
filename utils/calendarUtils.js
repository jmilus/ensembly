const ONEDAY = 86400000;

const doubleDigit = (num) => {
    let leadingNum = "";
    if (num < 10) leadingNum = "0";
    return `${leadingNum}${num}`;
}

export const straightDate = (input) => {
    const dateArr = input.split('-');
    return new Date(dateArr[0], dateArr[1] - 1, dateArr[2])
}

export const localizeDate = (input) => {
    const date = new Date(input)
    if (isNaN(date)) return undefined;
    return new Date(date.getTime() - ((date.getTimezoneOffset() / 360) * ONEDAY));
}

export const getTime = (input) => {
    const date = new Date(input);
    // const phase = date.getHours() > 12;
    // const hour = date.getHours() - (phase ? 12 : 0);
    // return `${hour === 0 ? 12 : hour}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} ${phase ? "PM" : "AM"}`
    const timeString = date.toLocaleTimeString();
    const firstColon = timeString.indexOf(":");
    return timeString.slice(0, firstColon + 3) + " " + timeString.slice(-2);
}

export const getDashedValue = (input, dateOnly) => {
    let dashThisDate = input
    if (input instanceof Date != true) dashThisDate = new Date(input)
    // console.log({ input })
    let dashedValue = `${dashThisDate.getFullYear()}-${doubleDigit(dashThisDate.getMonth() + 1)}-${doubleDigit(dashThisDate.getDate())}`
    if (dateOnly) return dashedValue;
    dashedValue += `T${doubleDigit(dashThisDate.getHours())}:${doubleDigit(dashThisDate.getMinutes())}:${doubleDigit(dashThisDate.getSeconds())}`
    return dashedValue;
}

export const get24Time = (input) => {
    const date = new Date(input);
    return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}:${doubleDigit(date.getSeconds())}`;
}

export const getFirstOfMonth = (input) => {
    const date = new Date(input)
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export const getLastOfMonth = (input) => {
    const date = new Date(input)
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export const getCalendarView = (input, totalDays = 34) => {
    const d = input ? new Date(input) : new Date();

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
    getDashedValue,
    getFirstOfMonth,
    getLastOfMonth,
    getCalendarView,
    compareDates,
    localizeDate,
    straightDate
}

export default CALENDAR;
const ONEDAY = 86400000;

const doubleDigit = (num) => {
    let leadingNum = "";
    if (num < 10) leadingNum = "0";
    return `${leadingNum}${num}`;
}

export const isValidDate = (input) => {
    // console.log("is valid date?", input)
    const testDate = new Date(input);
    // console.log(!isNaN(testDate.getTime()))
    return !isNaN(testDate.getTime())
}

export const straightDate = (input) => {
    const dateArr = input.split('-');
    return new Date(dateArr[0], dateArr[1] - 1, dateArr[2])
}

export const localizeDate = (input) => {
    const date = new Date(input)
    if (isNaN(date)) return undefined;
    return new Date(date.getTime() + ((date.getTimezoneOffset() / 360) * ONEDAY));
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

export const createNowDate = (input) => {
    const array = input.split('-');
    return new Date(array[0], parseInt(array[1]) - 1, array[2])
}

export const getDashedValue = (input, dateOnly) => {
    // console.log({ input })
    let dashThisDate = input
    if (input instanceof Date != true) dashThisDate = new Date(input)
    if (input instanceof Date != true) return input;
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
    const dateValues = input.split("-");
    const d = new Date(dateValues[0], parseInt(dateValues[1])-1, dateValues[2])
    console.log({ dateValues }, d.getDay())
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

export const validateBirthday = (value) => {
    const dateFormat = 'month-first' //TENANTSETTINGS.locale.date

    let monthPosition;
    let dayPosition;
    if (dateFormat === 'month-first') {
        monthPosition = 0
        dayPosition = 1
    } else {
        monthPosition = 1
        dayPosition = 0
    }

    const someDate = value.toString().match(/\d{1,3}-\d{1,3}-\d{2,5}/)
    // console.log({ someDate })
    if (someDate) {
        const someNums = someDate[0].split("-")
        let myNums = []
        myNums[monthPosition] = someNums[monthPosition].substr(-2).padStart(2, "0")
        myNums[dayPosition] = someNums[dayPosition].substr(-2).padStart(2, "0")
        myNums[2] = someNums[2].substr(-4).padStart(4, "0")

        const myDate = `${myNums[0]}-${myNums[1]}-${myNums[2]}`
        let status = 'pass'
        if (!isValidDate(`${new Date().getFullYear()}-${myNums[monthPosition]}-${myNums[dayPosition]}`)) status = 'fail'
        
        return { value: myDate, valid: status }
    }
    
    return { value, valid: 'fail' };
}

const CALENDAR = {
    isValidDate,
    getTime,
    get24Time,
    createNowDate,
    getDashedValue,
    getFirstOfMonth,
    getLastOfMonth,
    getCalendarView,
    compareDates,
    localizeDate,
    straightDate,
    validateBirthday
}

export default CALENDAR;
const dateToString = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const parsedMonth = month < 10 ? `0${month}` : month;
    const parsedDay = day < 10 ? `0${day}` : day;

    return `${year}-${parsedMonth}-${parsedDay}`
}

const dateToSeconds = (date) => {
    if (typeof date === 'number') {
        return String(date).length === 13 ? date / 1000 : date;
    }
    if (date instanceof Date) {
        return date.getTime() / 1000;
    }

    return new Date(date).getTime() / 1000;
}

const dateToMilliseconds = (date) => {
    if (typeof date === 'number') {
        return String(date).length === 13 ? date : date * 1000;
    }
    if (date instanceof Date) {
        return date.getTime();
    }

    return new Date(date).getTime();
}

module.exports = {
    dateToString,
    dateToSeconds,
    dateToMilliseconds
}


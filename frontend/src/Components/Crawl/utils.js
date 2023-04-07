export default function convertDateHumanReadable(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const day = date.getDate();
    const formattedDate = `${month} ${day}, ${year}`;
    return formattedDate;
}
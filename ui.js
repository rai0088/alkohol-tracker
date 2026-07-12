function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");

    return `${Number(day)}. ${Number(month)}. ${year}`;
}

function formatAmount(amount) {
    return Number(amount).toLocaleString("cs-CZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function renderStatistics(records) {
    const statistics = getStatistics(records);

    document.getElementById("total-records").textContent =
        statistics.totalRecords;

    document.getElementById("total-amount").textContent =
        `${formatAmount(statistics.totalAmount)} l`;

    document.getElementById("total-days").textContent =
        statistics.totalDays;

    document.getElementById("month-records").textContent =
        statistics.monthRecords;

    document.getElementById("month-amount").textContent =
        `${formatAmount(statistics.monthAmount)} l`;

    document.getElementById("month-days").textContent =
        statistics.monthDays;
}
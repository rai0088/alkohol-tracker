function getStatistics(records) {
    const totalAmount = records.reduce(function (sum, record) {
        return sum + Number(record.amount);
    }, 0);

    const totalDays = new Set(
        records.map(function (record) {
            return record.date;
        })
    ).size;

    const today = new Date();

    const currentMonth =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}`;

    const currentMonthRecords = records.filter(function (record) {
        return record.date.startsWith(currentMonth);
    });

    const currentMonthAmount =
        currentMonthRecords.reduce(function (sum, record) {
            return sum + Number(record.amount);
        }, 0);

    const currentMonthDays = new Set(
        currentMonthRecords.map(function (record) {
            return record.date;
        })
    ).size;

    return {
        totalRecords: records.length,
        totalAmount: totalAmount,
        totalDays: totalDays,
        monthRecords: currentMonthRecords.length,
        monthAmount: currentMonthAmount,
        monthDays: currentMonthDays
    };
}
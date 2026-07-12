function renderRecords(records, onEdit, onDelete) {
    const recordsList =
        document.getElementById("records-list");

    const emptyMessage =
        document.getElementById("empty-message");

    recordsList.innerHTML = "";

    if (records.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    const sortedRecords = [...records].sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    const recordsByMonth = {};

    sortedRecords.forEach(function (record) {
        const monthKey = record.date.slice(0, 7);

        if (!recordsByMonth[monthKey]) {
            recordsByMonth[monthKey] = [];
        }

        recordsByMonth[monthKey].push(record);
    });

    Object.entries(recordsByMonth).forEach(function (
        [monthKey, monthRecords]
    ) {
        const [year, month] = monthKey.split("-");

        const monthName = new Date(
            Number(year),
            Number(month) - 1
        ).toLocaleDateString("cs-CZ", {
            month: "long",
            year: "numeric"
        });

        const monthSection =
            document.createElement("section");

        monthSection.className = "month-section";

        const monthTitle =
            document.createElement("h3");

        monthTitle.className = "month-title";
        monthTitle.textContent =
            monthName.charAt(0).toUpperCase() +
            monthName.slice(1);

        monthSection.appendChild(monthTitle);

        monthRecords.forEach(function (record) {
            const recordElement =
                document.createElement("div");

            recordElement.className = "record-item";

            const configuration = alcoholTypes.find(
                function (type) {
                    return type.name === record.alcoholType;
                }
            );

            const icon = configuration
                ? configuration.icon
                : "➕";

            const countText = record.count
                ? `${record.count} ks · `
                : "";

            recordElement.innerHTML = `
                <div class="record-main">
                    <strong>
                        ${icon} ${record.alcoholType}
                    </strong>

                    <span>
                        ${countText}
                        ${formatAmount(record.amount)} l
                    </span>
                </div>

                <div class="record-date">
                    ${formatDate(record.date)}
                </div>

                ${
                    record.note
                        ? `<div class="record-note">${record.note}</div>`
                        : ""
                }

                <div class="record-actions">
                    <button
                        type="button"
                        class="edit-button"
                    >
                        Upravit
                    </button>

                    <button
                        type="button"
                        class="delete-button"
                    >
                        Smazat
                    </button>
                </div>
            `;

            recordElement
                .querySelector(".edit-button")
                .addEventListener("click", function () {
                    onEdit(record.id);
                });

            recordElement
                .querySelector(".delete-button")
                .addEventListener("click", function () {
                    onDelete(record.id);
                });

            monthSection.appendChild(recordElement);
        });

        recordsList.appendChild(monthSection);
    });
}
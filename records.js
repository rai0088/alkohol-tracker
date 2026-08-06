function getAlcoholIcon(alcoholType) {
    const configuration = alcoholTypes.find(function (type) {
        return type.name === alcoholType;
    });

    return configuration ? configuration.icon : "🍸";
}

function createMonthSummary(monthRecords) {
    const summary = document.createElement("div");
    summary.className = "month-summary";

    const amountsByAlcohol = {};

    monthRecords.forEach(function (record) {
        const alcoholType = record.alcoholType;
        const amount = Number(record.amount) || 0;

        amountsByAlcohol[alcoholType] =
            (amountsByAlcohol[alcoholType] || 0) + amount;
    });

    Object.entries(amountsByAlcohol)
        .sort(function (a, b) {
            return b[1] - a[1];
        })
        .forEach(function ([alcoholType, amount]) {
            const row = document.createElement("div");
            row.className = "month-summary-row";

            const name = document.createElement("span");
            name.textContent =
                `${getAlcoholIcon(alcoholType)} ${alcoholType}`;

            const value = document.createElement("strong");
            value.textContent = `${formatAmount(amount)} l`;

            row.appendChild(name);
            row.appendChild(value);
            summary.appendChild(row);
        });

    const totalAmount = monthRecords.reduce(function (sum, record) {
        return sum + (Number(record.amount) || 0);
    }, 0);

    const uniqueDays = new Set(
        monthRecords.map(function (record) {
            return record.date;
        })
    ).size;

    const footer = document.createElement("div");
    footer.className = "month-summary-footer";
    footer.innerHTML = `
        <span>Celkem <strong>${formatAmount(totalAmount)} l</strong></span>
        <span>${uniqueDays} dnů · ${monthRecords.length} záznamů</span>
    `;

    summary.appendChild(footer);
    return summary;
}

function createRecordElement(record, onEdit, onDelete) {
    const recordElement = document.createElement("div");
    recordElement.className = "record-item";

    const countText = record.count
        ? `${record.count} ks · `
        : "";

    recordElement.innerHTML = `
        <div class="record-main">
            <strong>${getAlcoholIcon(record.alcoholType)} ${record.alcoholType}</strong>
            <span>${countText}${formatAmount(record.amount)} l</span>
        </div>

        <div class="record-date">${formatDate(record.date)}</div>

        ${
            record.note
                ? `<div class="record-note"></div>`
                : ""
        }

        <div class="record-actions">
            <button type="button" class="edit-button">Upravit</button>
            <button type="button" class="delete-button">Smazat</button>
        </div>
    `;

    if (record.note) {
        recordElement.querySelector(".record-note").textContent =
            record.note;
    }

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

    return recordElement;
}

function renderRecords(records, onEdit, onDelete) {
    const recordsList = document.getElementById("records-list");
    const emptyMessage = document.getElementById("empty-message");

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

        const monthSection = document.createElement("section");
        monthSection.className = "month-section";

        const monthTitle = document.createElement("h3");
        monthTitle.className = "month-title";
        monthTitle.textContent =
            monthName.charAt(0).toUpperCase() + monthName.slice(1);

        monthSection.appendChild(monthTitle);
        monthSection.appendChild(createMonthSummary(monthRecords));

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "secondary-button records-toggle";
        toggleButton.textContent = "Zobrazit jednotlivé záznamy";

        const details = document.createElement("div");
        details.className = "month-records hidden";

        monthRecords.forEach(function (record) {
            details.appendChild(
                createRecordElement(record, onEdit, onDelete)
            );
        });

        toggleButton.addEventListener("click", function () {
            const isHidden = details.classList.contains("hidden");

            details.classList.toggle("hidden", !isHidden);
            toggleButton.textContent = isHidden
                ? "Skrýt jednotlivé záznamy"
                : "Zobrazit jednotlivé záznamy";
        });

        monthSection.appendChild(toggleButton);
        monthSection.appendChild(details);
        recordsList.appendChild(monthSection);
    });
}

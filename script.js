const customAlcoholGroup =
    document.getElementById("custom-alcohol-group");

const customAlcoholNameInput =
    document.getElementById("custom-alcohol-name");

const customServingSizeInput =
    document.getElementById("custom-serving-size");

const dateInput = document.getElementById("date");
const form = document.getElementById("alcohol-form");
const noteInput = document.getElementById("note");

const toggleNoteButton =
    document.getElementById("toggle-note");

const noteContainer =
    document.getElementById("note-container");

const featuredAlcoholButtonsContainer =
    document.getElementById("featured-alcohol-buttons");

const moreAlcoholButtonsContainer =
    document.getElementById("more-alcohol-buttons");

const toggleMoreAlcoholsButton =
    document.getElementById("toggle-more-alcohols");

const servingSizeGroup =
    document.getElementById("serving-size-group");

const servingSizeButtonsContainer =
    document.getElementById("serving-size-buttons");

const decreaseCountButton =
    document.getElementById("decrease-count");

const increaseCountButton =
    document.getElementById("increase-count");

const countDisplay =
    document.getElementById("count-display");

const amountSummary =
    document.getElementById("amount-summary");

const recordsList =
    document.getElementById("records-list");

const emptyMessage =
    document.getElementById("empty-message");

const totalRecordsElement =
    document.getElementById("total-records");

const totalAmountElement =
    document.getElementById("total-amount");

const totalDaysElement =
    document.getElementById("total-days");

const monthRecordsElement =
    document.getElementById("month-records");

const monthAmountElement =
    document.getElementById("month-amount");

const monthDaysElement =
    document.getElementById("month-days");

const submitButton =
    form.querySelector('button[type="submit"]');

let records =
    JSON.parse(localStorage.getItem("alcoholRecords")) || [];

let editingRecordId = null;
let selectedAlcoholType = "";
let selectedServingSize = 0;
let selectedCount = 1;

function setTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month =
        String(today.getMonth() + 1).padStart(2, "0");
    const day =
        String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}

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

function saveRecords() {
    localStorage.setItem(
        "alcoholRecords",
        JSON.stringify(records)
    );
}

function getAlcoholConfiguration(typeName) {
    return alcoholTypes.find(function (type) {
        return type.name === typeName;
    });
}

function getCustomAlcoholConfiguration() {
    return alcoholTypes.find(function (type) {
        return type.custom === true;
    });
}

function showNoteField() {
    noteContainer.classList.remove("hidden");
    toggleNoteButton.textContent = "− Skrýt poznámku";
}

function hideNoteField() {
    noteContainer.classList.add("hidden");
    toggleNoteButton.textContent = "+ Přidat poznámku";
}

function showMoreAlcohols() {
    moreAlcoholButtonsContainer.classList.remove("hidden");
    toggleMoreAlcoholsButton.textContent =
        "− Skrýt ostatní";
}

function hideMoreAlcohols() {
    moreAlcoholButtonsContainer.classList.add("hidden");
    toggleMoreAlcoholsButton.textContent =
        "🍸 Ostatní";
}

function createAlcoholButton(type) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "alcohol-choice";
    button.dataset.type = type.name;
    button.textContent = `${type.icon} ${type.name}`;

    button.addEventListener("click", function () {
        selectAlcoholType(type.name);
    });

    return button;
}

function renderAlcoholButtons() {
    featuredAlcoholButtonsContainer.innerHTML = "";
    moreAlcoholButtonsContainer.innerHTML = "";

    alcoholTypes.forEach(function (type) {
        const button = createAlcoholButton(type);

        if (type.featured) {
            featuredAlcoholButtonsContainer.appendChild(button);
        } else {
            moreAlcoholButtonsContainer.appendChild(button);
        }
    });
}

function selectAlcoholType(typeName) {
    const configuration =
        getAlcoholConfiguration(typeName);

    if (!configuration) {
        return;
    }

    selectedAlcoholType = configuration.name;
    selectedCount = 1;

    document
        .querySelectorAll(".alcohol-choice")
        .forEach(function (button) {
            button.classList.toggle(
                "selected",
                button.dataset.type === typeName
            );
        });

    if (configuration.custom) {
        selectedServingSize = 0;

        servingSizeGroup.classList.add("hidden");
        servingSizeButtonsContainer.innerHTML = "";

        customAlcoholGroup.classList.remove("hidden");
        customAlcoholNameInput.value = "";
        customServingSizeInput.value = "";

        customAlcoholNameInput.focus();
    } else {
        selectedServingSize =
            Number(configuration.defaultServing);

        customAlcoholGroup.classList.add("hidden");
        customAlcoholNameInput.value = "";
        customServingSizeInput.value = "";

        renderServingSizeButtons(configuration);
    }

    updateAmount();
}

function renderServingSizeButtons(
    configuration,
    additionalServingSize = null
) {
    servingSizeButtonsContainer.innerHTML = "";
    servingSizeGroup.classList.remove("hidden");

    const servingSizes =
        configuration.servings.map(Number);

    if (
        additionalServingSize &&
        !servingSizes.includes(Number(additionalServingSize))
    ) {
        servingSizes.push(Number(additionalServingSize));

        servingSizes.sort(function (a, b) {
            return a - b;
        });
    }

    servingSizes.forEach(function (servingSize) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "serving-size-choice";
        button.dataset.size = servingSize;
        button.textContent = `${formatAmount(servingSize)} l`;

        button.classList.toggle(
            "selected",
            servingSize === Number(selectedServingSize)
        );

        button.addEventListener("click", function () {
            selectedServingSize = servingSize;

            document
                .querySelectorAll(".serving-size-choice")
                .forEach(function (item) {
                    item.classList.remove("selected");
                });

            button.classList.add("selected");

            updateAmount();
        });

        servingSizeButtonsContainer.appendChild(button);
    });
}

function updateAmount() {
    countDisplay.textContent = selectedCount;

    if (!selectedAlcoholType) {
        amountSummary.textContent =
            "Nejprve vyber druh alkoholu.";
        return;
    }

    const selectedConfiguration =
        getAlcoholConfiguration(selectedAlcoholType);

    if (
        selectedConfiguration &&
        selectedConfiguration.custom
    ) {
        const customName =
            customAlcoholNameInput.value.trim();

        if (!customName || !selectedServingSize) {
            amountSummary.textContent =
                "Zadej název a velikost porce.";
            return;
        }
    }

    if (!selectedServingSize) {
        amountSummary.textContent =
            "Vyber velikost porce.";
        return;
    }

    const totalAmount =
        selectedCount * selectedServingSize;

    amountSummary.textContent =
        `${selectedCount} × ` +
        `${formatAmount(selectedServingSize)} l = ` +
        `${formatAmount(totalAmount)} l`;
}

function resetForm() {
    form.reset();
    setTodayDate();

    editingRecordId = null;
    selectedAlcoholType = "";
    selectedServingSize = 0;
    selectedCount = 1;

    submitButton.textContent = "Uložit záznam";

    document
        .querySelectorAll(".alcohol-choice")
        .forEach(function (button) {
            button.classList.remove("selected");
        });

    servingSizeButtonsContainer.innerHTML = "";
    servingSizeGroup.classList.add("hidden");

    customAlcoholGroup.classList.add("hidden");
    customAlcoholNameInput.value = "";
    customServingSizeInput.value = "";

    hideNoteField();
    hideMoreAlcohols();
    updateAmount();
}

function renderStatistics() {
    const totalAmount = records.reduce(function (
        sum,
        record
    ) {
        return sum + Number(record.amount);
    }, 0);

    const uniqueDays = new Set(
        records.map(function (record) {
            return record.date;
        })
    );

    const today = new Date();

    const currentMonth =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}`;

    const currentMonthRecords =
        records.filter(function (record) {
            return record.date.startsWith(currentMonth);
        });

    const currentMonthAmount =
        currentMonthRecords.reduce(function (
            sum,
            record
        ) {
            return sum + Number(record.amount);
        }, 0);

    const currentMonthDays = new Set(
        currentMonthRecords.map(function (record) {
            return record.date;
        })
    );

    totalRecordsElement.textContent = records.length;

    totalAmountElement.textContent =
        `${formatAmount(totalAmount)} l`;

    totalDaysElement.textContent = uniqueDays.size;

    monthRecordsElement.textContent =
        currentMonthRecords.length;

    monthAmountElement.textContent =
        `${formatAmount(currentMonthAmount)} l`;

    monthDaysElement.textContent =
        currentMonthDays.size;
}

function editRecord(recordId) {
    const record = records.find(function (item) {
        return item.id === recordId;
    });

    if (!record) {
        return;
    }

    dateInput.value = record.date;
    noteInput.value = record.note || "";

    if (record.note) {
        showNoteField();
    } else {
        hideNoteField();
    }

    selectedCount = Number(record.count) || 1;

    selectedServingSize =
        Number(record.servingSize) ||
        Number(record.amount) / selectedCount;

    const configuration =
        getAlcoholConfiguration(record.alcoholType);

    const isCustomRecord =
        record.isCustom === true || !configuration;

    if (isCustomRecord) {
        const customConfiguration =
            getCustomAlcoholConfiguration();

        if (!customConfiguration) {
            alert(
                "V seznamu chybí konfigurace pro vlastní alkohol."
            );
            return;
        }

        selectedAlcoholType =
            customConfiguration.name;

        customAlcoholGroup.classList.remove("hidden");

        customAlcoholNameInput.value =
            record.alcoholType;

        customServingSizeInput.value =
            selectedServingSize;

        servingSizeGroup.classList.add("hidden");
        servingSizeButtonsContainer.innerHTML = "";

        showMoreAlcohols();

        document
            .querySelectorAll(".alcohol-choice")
            .forEach(function (button) {
                button.classList.toggle(
                    "selected",
                    button.dataset.type ===
                        customConfiguration.name
                );
            });
    } else {
        selectedAlcoholType = record.alcoholType;

        customAlcoholGroup.classList.add("hidden");
        customAlcoholNameInput.value = "";
        customServingSizeInput.value = "";

        document
            .querySelectorAll(".alcohol-choice")
            .forEach(function (button) {
                button.classList.toggle(
                    "selected",
                    button.dataset.type ===
                        record.alcoholType
                );
            });

        if (!configuration.featured) {
            showMoreAlcohols();
        }

        renderServingSizeButtons(
            configuration,
            selectedServingSize
        );
    }

    editingRecordId = recordId;
    submitButton.textContent = "Uložit změny";

    updateAmount();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteRecord(recordId) {
    const confirmed = window.confirm(
        "Opravdu chceš tento záznam smazat?"
    );

    if (!confirmed) {
        return;
    }

    records = records.filter(function (record) {
        return record.id !== recordId;
    });

    if (editingRecordId === recordId) {
        resetForm();
    }

    saveRecords();
    renderRecords();
    renderStatistics();
}

function renderRecords() {
    recordsList.innerHTML = "";

    if (records.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    const sortedRecords =
        [...records].sort(function (a, b) {
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

            const configuration =
                getAlcoholConfiguration(record.alcoholType);

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
                        data-id="${record.id}"
                    >
                        Upravit
                    </button>

                    <button
                        type="button"
                        class="delete-button"
                        data-id="${record.id}"
                    >
                        Smazat
                    </button>
                </div>
            `;

            monthSection.appendChild(recordElement);
        });

        recordsList.appendChild(monthSection);
    });

    document
        .querySelectorAll(".edit-button")
        .forEach(function (button) {
            button.addEventListener("click", function () {
                editRecord(Number(button.dataset.id));
            });
        });

    document
        .querySelectorAll(".delete-button")
        .forEach(function (button) {
            button.addEventListener("click", function () {
                deleteRecord(Number(button.dataset.id));
            });
        });
}

decreaseCountButton.addEventListener(
    "click",
    function () {
        if (selectedCount > 1) {
            selectedCount -= 1;
            updateAmount();
        }
    }
);

increaseCountButton.addEventListener(
    "click",
    function () {
        selectedCount += 1;
        updateAmount();
    }
);

toggleNoteButton.addEventListener("click", function () {
    const isHidden =
        noteContainer.classList.contains("hidden");

    if (isHidden) {
        showNoteField();
        noteInput.focus();
    } else {
        hideNoteField();
    }
});

toggleMoreAlcoholsButton.addEventListener(
    "click",
    function () {
        const isHidden =
            moreAlcoholButtonsContainer.classList.contains(
                "hidden"
            );

        if (isHidden) {
            showMoreAlcohols();
        } else {
            hideMoreAlcohols();
        }
    }
);

customAlcoholNameInput.addEventListener(
    "input",
    function () {
        updateAmount();
    }
);

customServingSizeInput.addEventListener(
    "input",
    function () {
        selectedServingSize =
            Number(customServingSizeInput.value) || 0;

        updateAmount();
    }
);

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!selectedAlcoholType) {
        alert("Vyber druh alkoholu.");
        return;
    }

    const selectedConfiguration =
        getAlcoholConfiguration(selectedAlcoholType);

    const isCustom =
        selectedConfiguration &&
        selectedConfiguration.custom === true;

    let finalAlcoholType = selectedAlcoholType;

    if (isCustom) {
        const customName =
            customAlcoholNameInput.value.trim();

        if (!customName) {
            alert("Zadej název alkoholu.");
            customAlcoholNameInput.focus();
            return;
        }

        if (!selectedServingSize) {
            alert("Zadej velikost porce.");
            customServingSizeInput.focus();
            return;
        }

        finalAlcoholType = customName;
    } else if (!selectedServingSize) {
        alert("Vyber velikost porce.");
        return;
    }

    const recordData = {
        date: dateInput.value,
        alcoholType: finalAlcoholType,
        count: selectedCount,
        servingSize: selectedServingSize,
        amount: selectedCount * selectedServingSize,
        note: noteInput.value.trim(),
        isCustom: isCustom
    };

    if (editingRecordId !== null) {
        records = records.map(function (record) {
            if (record.id === editingRecordId) {
                return {
                    ...record,
                    ...recordData
                };
            }

            return record;
        });
    } else {
        records.push({
            id: Date.now(),
            ...recordData
        });
    }

    saveRecords();
    resetForm();
    renderRecords();
    renderStatistics();
});

renderAlcoholButtons();
setTodayDate();
hideNoteField();
hideMoreAlcohols();
customAlcoholGroup.classList.add("hidden");
updateAmount();
renderRecords();
renderStatistics();
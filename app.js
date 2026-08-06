let records = loadRecords();
let formController;

function refreshApplication() {
    renderRecords(records, editRecord, deleteRecord);
    renderStatistics(records);
}

function saveRecord(recordData) {
    if (recordData.id !== null) {
        records = records.map(function (record) {
            if (record.id === recordData.id) {
                return {
                    ...record,
                    ...recordData
                };
            }

            return record;
        });
    } else {
        records.push({
            ...recordData,
            id: Date.now()
        });
    }

    saveRecords(records);
    formController.reset();
    refreshApplication();
}

function editRecord(recordId) {
    const record = records.find(function (item) {
        return item.id === recordId;
    });

    if (!record) {
        return;
    }

    formController.loadRecord(record);
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

    saveRecords(records);
    refreshApplication();
}

formController = createFormController(saveRecord);
refreshApplication();

const exportButton =
    document.getElementById("export-button");

exportButton.addEventListener("click", function () {
    exportRecords(records);
});
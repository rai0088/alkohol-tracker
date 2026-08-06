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

function selectBackupText() {
    const backupText = document.getElementById("backup-text");

    backupText.focus();
    backupText.select();
    backupText.setSelectionRange(0, backupText.value.length);
}

formController = createFormController(saveRecord);
refreshApplication();

const exportButton = document.getElementById("export-button");
const backupPanel = document.getElementById("backup-panel");
const backupText = document.getElementById("backup-text");
const backupSummary = document.getElementById("backup-summary");
const backupMessage = document.getElementById("backup-message");
const selectBackupButton = document.getElementById("select-backup-button");
const copyBackupButton = document.getElementById("copy-backup-button");
const closeBackupButton = document.getElementById("close-backup-button");

exportButton.addEventListener("click", function () {
    backupText.value = createBackupText(records);
    backupSummary.textContent =
        `Záloha obsahuje ${records.length} záznamů.`;
    backupMessage.textContent =
        "Text ulož mimo aplikaci. Na telefonu můžeš použít Označit vše a poté Kopírovat.";
    backupPanel.classList.remove("hidden");
    backupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

selectBackupButton.addEventListener("click", function () {
    selectBackupText();
    backupMessage.textContent =
        "Text je označený. Podrž prst v poli a zvol Kopírovat, pokud tlačítko Kopírovat nefunguje.";
});

copyBackupButton.addEventListener("click", async function () {
    selectBackupText();

    try {
        await navigator.clipboard.writeText(backupText.value);
        backupMessage.textContent =
            "Záloha byla zkopírována. Vlož ji do poznámky, e-mailu nebo souboru na cloudu.";
    } catch (error) {
        console.warn("Automatické kopírování není dostupné.", error);
        backupMessage.textContent =
            "Automatické kopírování telefon nepovolil. Text je označený; podrž prst v poli a zvol Kopírovat.";
    }
});

closeBackupButton.addEventListener("click", function () {
    backupPanel.classList.add("hidden");
    backupMessage.textContent = "";
});

const STORAGE_KEY = "alcoholRecords";

function loadRecords() {
    const savedRecords = localStorage.getItem(STORAGE_KEY);

    if (!savedRecords) {
        return [];
    }

    try {
        return JSON.parse(savedRecords);
    } catch (error) {
        console.error(
            "Uložené záznamy se nepodařilo načíst.",
            error
        );

        return [];
    }
}

function saveRecords(records) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );
}

function createBackupText(records) {
    const backup = {
        application: "Alkohol Tracker",
        version: 1,
        exportedAt: new Date().toISOString(),
        recordCount: records.length,
        records: records
    };

    return JSON.stringify(backup, null, 2);
}

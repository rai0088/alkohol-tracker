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

async function exportRecords(records) {
    const backup = {
        application: "Alkohol Tracker",
        exportedAt: new Date().toISOString(),
        recordCount: records.length,
        records: records
    };

    const backupText = JSON.stringify(backup, null, 2);

    try {
        await navigator.clipboard.writeText(backupText);

        alert(
            `Záloha ${records.length} záznamů byla zkopírována do schránky. ` +
            "Vlož ji nyní do poznámky, e-mailu nebo textového souboru."
        );
    } catch (error) {
        console.error("Kopírování zálohy selhalo:", error);

        const backupWindow = window.open("", "_blank");

        if (!backupWindow) {
            alert(
                "Zálohu se nepodařilo otevřít. Povol v prohlížeči vyskakovací okna."
            );
            return;
        }

        backupWindow.document.write(`
            <html lang="cs">
                <head>
                    <title>Záloha Alkohol Tracker</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body>
                    <h1>Záloha Alkohol Tracker</h1>
                    <p>Označ celý text, zkopíruj ho a bezpečně ulož.</p>
                    <textarea
                        style="width: 100%; height: 75vh;"
                    >${backupText.replace(/</g, "&lt;")}</textarea>
                </body>
            </html>
        `);

        backupWindow.document.close();
    }
}
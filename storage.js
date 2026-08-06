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

    const fileContent = JSON.stringify(backup, null, 2);

    const today = new Date()
        .toISOString()
        .slice(0, 10);

    const fileName =
        `alkohol-tracker-zaloha-${today}.json`;

    const file = new File(
        [fileContent],
        fileName,
        {
            type: "application/json"
        }
    );

    if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
    ) {
        try {
            await navigator.share({
                title: "Záloha Alkohol Tracker",
                files: [file]
            });

            return;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.warn(
                "Sdílení selhalo, zkouším stažení souboru.",
                error
            );
        }
    }

    try {
        const blob = new Blob(
            [fileContent],
            {
                type: "application/json;charset=utf-8"
            }
        );

        const downloadUrl =
            URL.createObjectURL(blob);

        const downloadLink =
            document.createElement("a");

        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
        }, 1000);

        alert(
            "Záloha byla vytvořena. Zkontroluj složku Stažené soubory."
        );
    } catch (error) {
        console.error(
            "Zálohu se nepodařilo vytvořit:",
            error
        );

        alert(
            "Zálohu se nepodařilo vytvořit."
        );
    }
}
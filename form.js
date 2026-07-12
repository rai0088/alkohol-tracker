function createFormController(onSubmit) {
    const form = document.getElementById("alcohol-form");
    const dateInput = document.getElementById("date");
    const noteInput = document.getElementById("note");

    const featuredContainer =
        document.getElementById("featured-alcohol-buttons");

    const moreContainer =
        document.getElementById("more-alcohol-buttons");

    const toggleMoreButton =
        document.getElementById("toggle-more-alcohols");

    const servingSizeGroup =
        document.getElementById("serving-size-group");

    const servingSizeContainer =
        document.getElementById("serving-size-buttons");

    const customAlcoholGroup =
        document.getElementById("custom-alcohol-group");

    const customNameInput =
        document.getElementById("custom-alcohol-name");

    const customServingInput =
        document.getElementById("custom-serving-size");

    const decreaseButton =
        document.getElementById("decrease-count");

    const increaseButton =
        document.getElementById("increase-count");

    const countDisplay =
        document.getElementById("count-display");

    const amountSummary =
        document.getElementById("amount-summary");

    const toggleNoteButton =
        document.getElementById("toggle-note");

    const noteContainer =
        document.getElementById("note-container");

    const submitButton =
        form.querySelector('button[type="submit"]');

    let editingRecordId = null;
    let selectedAlcoholType = "";
    let selectedServingSize = 0;
    let selectedCount = 1;

    function getConfiguration(typeName) {
        return alcoholTypes.find(function (type) {
            return type.name === typeName;
        });
    }

    function getCustomConfiguration() {
        return alcoholTypes.find(function (type) {
            return type.custom === true;
        });
    }

    function setTodayDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month =
            String(today.getMonth() + 1).padStart(2, "0");
        const day =
            String(today.getDate()).padStart(2, "0");

        dateInput.value = `${year}-${month}-${day}`;
    }

    function showNote() {
        noteContainer.classList.remove("hidden");
        toggleNoteButton.textContent = "− Skrýt poznámku";
    }

    function hideNote() {
        noteContainer.classList.add("hidden");
        toggleNoteButton.textContent = "+ Přidat poznámku";
    }

    function showMoreAlcohols() {
        moreContainer.classList.remove("hidden");
        toggleMoreButton.textContent = "− Skrýt ostatní";
    }

    function hideMoreAlcohols() {
        moreContainer.classList.add("hidden");
        toggleMoreButton.textContent = "🍸 Ostatní";
    }

    function updateAmountSummary() {
        countDisplay.textContent = selectedCount;

        if (!selectedAlcoholType) {
            amountSummary.textContent =
                "Nejprve vyber druh alkoholu.";
            return;
        }

        const configuration =
            getConfiguration(selectedAlcoholType);

        if (configuration && configuration.custom) {
            const customName = customNameInput.value.trim();

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

    function renderServingSizes(
        configuration,
        additionalServingSize = null
    ) {
        servingSizeContainer.innerHTML = "";
        servingSizeGroup.classList.remove("hidden");

        const servingSizes =
            configuration.servings.map(Number);

        const extraSize = Number(additionalServingSize);

        if (
            extraSize &&
            !servingSizes.includes(extraSize)
        ) {
            servingSizes.push(extraSize);
            servingSizes.sort(function (a, b) {
                return a - b;
            });
        }

        servingSizes.forEach(function (servingSize) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "serving-size-choice";
            button.textContent =
                `${formatAmount(servingSize)} l`;

            button.classList.toggle(
                "selected",
                servingSize === selectedServingSize
            );

            button.addEventListener("click", function () {
                selectedServingSize = servingSize;

                document
                    .querySelectorAll(".serving-size-choice")
                    .forEach(function (item) {
                        item.classList.remove("selected");
                    });

                button.classList.add("selected");
                updateAmountSummary();
            });

            servingSizeContainer.appendChild(button);
        });
    }

    function highlightAlcohol(typeName) {
        document
            .querySelectorAll(".alcohol-choice")
            .forEach(function (button) {
                button.classList.toggle(
                    "selected",
                    button.dataset.type === typeName
                );
            });
    }

    function selectAlcohol(typeName) {
        const configuration =
            getConfiguration(typeName);

        if (!configuration) {
            return;
        }

        selectedAlcoholType = configuration.name;
        selectedCount = 1;

        highlightAlcohol(typeName);

        if (configuration.custom) {
            selectedServingSize = 0;

            servingSizeGroup.classList.add("hidden");
            servingSizeContainer.innerHTML = "";

            customAlcoholGroup.classList.remove("hidden");
            customNameInput.value = "";
            customServingInput.value = "";
            customNameInput.focus();
        } else {
            selectedServingSize =
                Number(configuration.defaultServing);

            customAlcoholGroup.classList.add("hidden");
            customNameInput.value = "";
            customServingInput.value = "";

            renderServingSizes(configuration);
        }

        updateAmountSummary();
    }

    function createAlcoholButton(type) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "alcohol-choice";
        button.dataset.type = type.name;
        button.textContent = `${type.icon} ${type.name}`;

        button.addEventListener("click", function () {
            selectAlcohol(type.name);
        });

        return button;
    }

    function renderAlcoholButtons() {
        featuredContainer.innerHTML = "";
        moreContainer.innerHTML = "";

        alcoholTypes.forEach(function (type) {
            const button = createAlcoholButton(type);

            if (type.featured) {
                featuredContainer.appendChild(button);
            } else {
                moreContainer.appendChild(button);
            }
        });
    }

    function resetForm() {
        form.reset();
        setTodayDate();

        editingRecordId = null;
        selectedAlcoholType = "";
        selectedServingSize = 0;
        selectedCount = 1;

        submitButton.textContent = "Uložit záznam";

        highlightAlcohol("");

        servingSizeContainer.innerHTML = "";
        servingSizeGroup.classList.add("hidden");

        customAlcoholGroup.classList.add("hidden");
        customNameInput.value = "";
        customServingInput.value = "";

        hideNote();
        hideMoreAlcohols();
        updateAmountSummary();
    }

    function loadRecord(record) {
        dateInput.value = record.date;
        noteInput.value = record.note || "";

        if (record.note) {
            showNote();
        } else {
            hideNote();
        }

        editingRecordId = record.id;
        selectedCount = Number(record.count) || 1;
        selectedServingSize =
            Number(record.servingSize) ||
            Number(record.amount) / selectedCount;

        const configuration =
            getConfiguration(record.alcoholType);

        const isCustom =
            record.isCustom === true || !configuration;

        if (isCustom) {
            const customConfiguration =
                getCustomConfiguration();

            if (!customConfiguration) {
                alert("Chybí nastavení vlastního alkoholu.");
                return;
            }

            selectedAlcoholType =
                customConfiguration.name;

            highlightAlcohol(customConfiguration.name);
            showMoreAlcohols();

            customAlcoholGroup.classList.remove("hidden");
            customNameInput.value = record.alcoholType;
            customServingInput.value =
                selectedServingSize;

            servingSizeGroup.classList.add("hidden");
            servingSizeContainer.innerHTML = "";
        } else {
            selectedAlcoholType = record.alcoholType;

            highlightAlcohol(record.alcoholType);

            customAlcoholGroup.classList.add("hidden");

            if (!configuration.featured) {
                showMoreAlcohols();
            }

            renderServingSizes(
                configuration,
                selectedServingSize
            );
        }

        submitButton.textContent = "Uložit změny";
        updateAmountSummary();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    decreaseButton.addEventListener("click", function () {
        if (selectedCount > 1) {
            selectedCount -= 1;
            updateAmountSummary();
        }
    });

    increaseButton.addEventListener("click", function () {
        selectedCount += 1;
        updateAmountSummary();
    });

    toggleNoteButton.addEventListener("click", function () {
        if (noteContainer.classList.contains("hidden")) {
            showNote();
            noteInput.focus();
        } else {
            hideNote();
        }
    });

    toggleMoreButton.addEventListener("click", function () {
        if (moreContainer.classList.contains("hidden")) {
            showMoreAlcohols();
        } else {
            hideMoreAlcohols();
        }
    });

    customNameInput.addEventListener(
        "input",
        updateAmountSummary
    );

    customServingInput.addEventListener(
        "input",
        function () {
            selectedServingSize =
                Number(customServingInput.value) || 0;

            updateAmountSummary();
        }
    );

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!selectedAlcoholType) {
            alert("Vyber druh alkoholu.");
            return;
        }

        const configuration =
            getConfiguration(selectedAlcoholType);

        const isCustom =
            configuration &&
            configuration.custom === true;

        let finalAlcoholType = selectedAlcoholType;

        if (isCustom) {
            const customName =
                customNameInput.value.trim();

            if (!customName) {
                alert("Zadej název alkoholu.");
                customNameInput.focus();
                return;
            }

            if (!selectedServingSize) {
                alert("Zadej velikost porce.");
                customServingInput.focus();
                return;
            }

            finalAlcoholType = customName;
        } else if (!selectedServingSize) {
            alert("Vyber velikost porce.");
            return;
        }

        onSubmit({
            id: editingRecordId,
            date: dateInput.value,
            alcoholType: finalAlcoholType,
            count: selectedCount,
            servingSize: selectedServingSize,
            amount: selectedCount * selectedServingSize,
            note: noteInput.value.trim(),
            isCustom: isCustom
        });
    });

    renderAlcoholButtons();
    resetForm();

    return {
        reset: resetForm,
        loadRecord: loadRecord
    };
}
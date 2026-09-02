(() => {
  const targetStorageKey = "kaloriAtlasDailyTargets";

  const mealOrder = [
    "Kahvaltı",
    "Öğle Yemeği",
    "Akşam Yemeği",
    "Ara Öğün"
  ];

  let foods = [];
  let diaryEntries = [];

  const targetForm = document.getElementById("target-form");
  const foodForm = document.getElementById("food-form");
  const foodOptions = document.getElementById("food-options");
  const foodSearch = document.getElementById("food-search");
  const foodAmount = document.getElementById("food-amount");
  const mealSelect = document.getElementById("meal-select");
  const formMessage = document.getElementById("form-message");
  const diaryList = document.getElementById("diary-list");
  const emptyDiary = document.getElementById("empty-diary");
  const entryCount = document.getElementById("entry-count");
  const resetDayButton = document.getElementById("reset-day-button");

  const targetInputs = {
    calories: document.getElementById("target-calories"),
    protein: document.getElementById("target-protein"),
    carbs: document.getElementById("target-carbs"),
    fat: document.getElementById("target-fat")
  };

  const summaryElements = {
    calories: {
      consumed: document.getElementById("calories-consumed"),
      remaining: document.getElementById("calories-remaining"),
      percent: document.getElementById("calories-percent"),
      progress: document.getElementById("calories-progress"),
      unit: "kcal"
    },
    protein: {
      consumed: document.getElementById("protein-consumed"),
      remaining: document.getElementById("protein-remaining"),
      percent: document.getElementById("protein-percent"),
      progress: document.getElementById("protein-progress"),
      unit: "g"
    },
    carbs: {
      consumed: document.getElementById("carbs-consumed"),
      remaining: document.getElementById("carbs-remaining"),
      percent: document.getElementById("carbs-percent"),
      progress: document.getElementById("carbs-progress"),
      unit: "g"
    },
    fat: {
      consumed: document.getElementById("fat-consumed"),
      remaining: document.getElementById("fat-remaining"),
      percent: document.getElementById("fat-percent"),
      progress: document.getElementById("fat-progress"),
      unit: "g"
    }
  };

  function getLocalDateKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getDiaryStorageKey() {
    return `kaloriAtlasDiary:${getLocalDateKey()}`;
  }

  function formatToday() {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long"
    }).format(new Date());
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(value) {
    return String(value)
      .trim()
      .toLocaleLowerCase("tr-TR");
  }

  function roundValue(value) {
    return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
  }

  function formatNumber(value) {
    return roundValue(value).toLocaleString("tr-TR", {
      maximumFractionDigits: 1
    });
  }

  function getBaseWeight(portion) {
    const text = String(portion || "").replaceAll(",", ".");

    const gramMatches = [
      ...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:g|gr)\b/gi)
    ];

    if (gramMatches.length > 0) {
      return Number(gramMatches[gramMatches.length - 1][1]);
    }

    const milliliterMatches = [
      ...text.matchAll(/(\d+(?:\.\d+)?)\s*ml\b/gi)
    ];

    if (milliliterMatches.length > 0) {
      return Number(
        milliliterMatches[milliliterMatches.length - 1][1]
      );
    }

    return 100;
  }

  function loadTargets() {
    try {
      const savedTargets = JSON.parse(
        localStorage.getItem(targetStorageKey)
      );

      if (!savedTargets) return;

      Object.keys(targetInputs).forEach((key) => {
        targetInputs[key].value = savedTargets[key] || "";
      });
    } catch (error) {
      console.error("Hedefler yüklenemedi:", error);
    }
  }

  function getTargets() {
    return {
      calories: Number(targetInputs.calories.value) || 0,
      protein: Number(targetInputs.protein.value) || 0,
      carbs: Number(targetInputs.carbs.value) || 0,
      fat: Number(targetInputs.fat.value) || 0
    };
  }

  function saveTargets() {
    localStorage.setItem(
      targetStorageKey,
      JSON.stringify(getTargets())
    );
  }

  function loadDiary() {
    try {
      diaryEntries =
        JSON.parse(localStorage.getItem(getDiaryStorageKey())) || [];
    } catch (error) {
      diaryEntries = [];
      console.error("Günlük yüklenemedi:", error);
    }
  }

  function saveDiary() {
    localStorage.setItem(
      getDiaryStorageKey(),
      JSON.stringify(diaryEntries)
    );
  }

  function calculateTotals() {
    return diaryEntries.reduce(
      (totals, entry) => {
        totals.calories += Number(entry.calories) || 0;
        totals.protein += Number(entry.protein) || 0;
        totals.carbs += Number(entry.carbs) || 0;
        totals.fat += Number(entry.fat) || 0;

        return totals;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    );
  }

  function formatRemaining(target, consumed, unit) {
    const difference = roundValue(target - consumed);

    if (target <= 0) {
      return `0 ${unit}`;
    }

    if (difference >= 0) {
      return `${formatNumber(difference)} ${unit}`;
    }

    return `${formatNumber(Math.abs(difference))} ${unit} fazla`;
  }

  function updateSummary() {
    const targets = getTargets();
    const totals = calculateTotals();

    Object.keys(summaryElements).forEach((key) => {
      const target = targets[key];
      const consumed = roundValue(totals[key]);
      const percentage =
        target > 0 ? Math.round((consumed / target) * 100) : 0;
      const progressWidth = Math.min(Math.max(percentage, 0), 100);
      const elements = summaryElements[key];

      elements.consumed.textContent =
        `${formatNumber(consumed)} ${elements.unit}`;

      elements.remaining.textContent = formatRemaining(
        target,
        consumed,
        elements.unit
      );

      elements.percent.textContent = `%${percentage}`;
      elements.progress.style.width = `${progressWidth}%`;

      if (percentage > 100) {
        elements.progress.style.background = "#d84b4b";
      } else {
        elements.progress.style.background = "";
      }
    });
  }

  function createEntryHtml(entry) {
    return `
      <div class="diary-entry">
        <div class="entry-food-name">
          ${escapeHtml(entry.name)}
        </div>

        <div class="entry-value">
          ${formatNumber(entry.amount)} g
        </div>

        <div class="entry-value">
          ${formatNumber(entry.calories)} kcal
        </div>

        <div class="entry-value">
          ${formatNumber(entry.protein)} g protein
        </div>

        <div class="entry-value">
          ${formatNumber(entry.carbs)} g karbonhidrat
        </div>

        <div class="entry-value">
          ${formatNumber(entry.fat)} g yağ
        </div>

        <button
          class="delete-entry-button"
          type="button"
          data-entry-id="${escapeHtml(entry.id)}"
          aria-label="${escapeHtml(entry.name)} kaydını sil"
        >
          Sil
        </button>
      </div>
    `;
  }

  function renderDiary() {
    diaryList.innerHTML = "";

    emptyDiary.hidden = diaryEntries.length > 0;
    entryCount.textContent = `${diaryEntries.length} besin`;

    mealOrder.forEach((meal) => {
      const mealEntries = diaryEntries.filter(
        (entry) => entry.meal === meal
      );

      if (mealEntries.length === 0) return;

      const mealGroup = document.createElement("section");
      mealGroup.className = "meal-group";

      mealGroup.innerHTML = `
        <h3 class="meal-title">${escapeHtml(meal)}</h3>
        ${mealEntries.map(createEntryHtml).join("")}
      `;

      diaryList.appendChild(mealGroup);
    });

    updateSummary();
  }

  function populateFoodOptions() {
    foodOptions.innerHTML = foods
      .map(
        (food) =>
          `<option value="${escapeHtml(food.name)}"></option>`
      )
      .join("");
  }

  function findSelectedFood(name) {
    const normalizedName = normalizeText(name);

    return foods.find(
      (food) => normalizeText(food.name) === normalizedName
    );
  }

  function calculateFoodValues(food, amount) {
    const baseWeight = getBaseWeight(food.portion);
    const multiplier = amount / baseWeight;

    return {
      calories: roundValue(food.calories * multiplier),
      protein: roundValue(food.protein * multiplier),
      carbs: roundValue(food.carbs * multiplier),
      fat: roundValue(food.fat * multiplier)
    };
  }

  function showMessage(message, isSuccess = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("success", isSuccess);
  }

  targetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    saveTargets();
    updateSummary();

    showMessage("Günlük hedefleriniz kaydedildi.", true);
  });

  foodForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedFood = findSelectedFood(foodSearch.value);
    const amount = Number(foodAmount.value);

    if (!selectedFood) {
      showMessage(
        "Lütfen listede bulunan geçerli bir besin seçin."
      );
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage("Lütfen geçerli bir miktar girin.");
      return;
    }

    const calculatedValues = calculateFoodValues(
      selectedFood,
      amount
    );

    diaryEntries.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      meal: mealSelect.value,
      name: selectedFood.name,
      amount,
      ...calculatedValues
    });

    saveDiary();
    renderDiary();

    foodSearch.value = "";
    foodAmount.value = "100";

    showMessage(
      `${selectedFood.name} günlüğünüze eklendi.`,
      true
    );
  });

  diaryList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(
      ".delete-entry-button"
    );

    if (!deleteButton) return;

    const entryId = deleteButton.dataset.entryId;

    diaryEntries = diaryEntries.filter(
      (entry) => entry.id !== entryId
    );

    saveDiary();
    renderDiary();
  });

  resetDayButton.addEventListener("click", () => {
    if (diaryEntries.length === 0) {
      showMessage("Bugünün günlüğünde silinecek besin yok.");
      return;
    }

    const shouldReset = window.confirm(
      "Bugün eklediğiniz bütün besinler silinsin mi?"
    );

    if (!shouldReset) return;

    diaryEntries = [];
    saveDiary();
    renderDiary();

    showMessage("Bugünün günlüğü sıfırlandı.", true);
  });

  async function loadFoods() {
    try {
      const response = await fetch("foods.json?v=3");

      if (!response.ok) {
        throw new Error("Besin verileri alınamadı.");
      }

      foods = await response.json();
      populateFoodOptions();
    } catch (error) {
      showMessage(
        "Besin listesi yüklenemedi. Lütfen sayfayı yenileyin."
      );

      console.error(error);
    }
  }

  document.getElementById("diary-date").textContent = formatToday();

  loadTargets();
  loadDiary();
  renderDiary();
  loadFoods();
})();

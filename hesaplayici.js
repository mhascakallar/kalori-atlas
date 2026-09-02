const calorieForm = document.getElementById("calorieForm");
const calculatorResults = document.getElementById("calculatorResults");

function formatNumber(number) {
  return new Intl.NumberFormat("tr-TR").format(Math.round(number));
}

function calculateBmr(gender, weight, height, age) {
  const baseCalculation =
    10 * weight +
    6.25 * height -
    5 * age;

  if (gender === "male") {
    return baseCalculation + 5;
  }

  return baseCalculation - 161;
}

calorieForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const gender = document.getElementById("gender").value;
  const age = Number(document.getElementById("age").value);
  const height = Number(document.getElementById("height").value);
  const weight = Number(document.getElementById("weight").value);
  const activity = Number(document.getElementById("activity").value);

  const bmr = calculateBmr(
    gender,
    weight,
    height,
    age
  );

  const maintenanceCalories = bmr * activity;

  const weightLossCalories = Math.max(
    bmr,
    maintenanceCalories - 400
  );

  const weightGainCalories =
    maintenanceCalories + 300;

  const minimumProtein = weight * 1.6;
  const maximumProtein = weight * 2;

  document.getElementById("bmrResult").textContent =
    `${formatNumber(bmr)} kcal`;

  document.getElementById("maintenanceResult").textContent =
    `${formatNumber(maintenanceCalories)} kcal`;

  document.getElementById("lossResult").textContent =
    `${formatNumber(weightLossCalories)} kcal`;

  document.getElementById("gainResult").textContent =
    `${formatNumber(weightGainCalories)} kcal`;

  document.getElementById("proteinResult").textContent =
    `${formatNumber(minimumProtein)}–${formatNumber(maximumProtein)} g`;

  calculatorResults.classList.remove("d-none");

  calculatorResults.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
    const calorieTargets = {
    maintenance: maintenanceCalories,
    loss: weightLossCalories,
    gain: weightGainCalories
  };

  const proteinTarget = Math.round(weight * 1.8);
  const fatTarget = Math.round(weight * 0.8);

  document.querySelectorAll(".transfer-target").forEach((button) => {
    button.onclick = () => {
      const selectedCalories = Math.round(
        calorieTargets[button.dataset.goal]
      );

      const carbohydrateTarget = Math.max(
        0,
        Math.round(
          (
            selectedCalories -
            proteinTarget * 4 -
            fatTarget * 9
          ) / 4
        )
      );

      const dailyTargets = {
        calories: selectedCalories,
        protein: proteinTarget,
        carbs: carbohydrateTarget,
        fat: fatTarget
      };

      localStorage.setItem(
        "kaloriAtlasDailyTargets",
        JSON.stringify(dailyTargets)
      );

      window.location.href = "gunluk-takip.html";
    };
  });
});

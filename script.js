let foodsData = [];

function fixTurkishToLower(text) {
  if (!text) return "";

  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
}

function renderTable(data) {
  const resultsBody = document.getElementById("resultsBody");
  resultsBody.innerHTML = "";

  if (data.length === 0) {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          Aramanıza uygun besin bulunamadı.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    const row = `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td><span class="badge bg-light text-dark border">${item.category}</span></td>
        <td>${item.portion}</td>
        <td><strong>${item.calories}</strong></td>
        <td><span class="badge bg-success badge-macro">${item.protein}g</span></td>
        <td><span class="badge bg-primary badge-macro">${item.carbs}g</span></td>
        <td><span class="badge bg-warning text-dark badge-macro">${item.fat}g</span></td>
      </tr>
    `;

    resultsBody.insertAdjacentHTML("beforeend", row);
  });
}

function filterFoods(query) {
  const normalizedQuery = fixTurkishToLower(query.trim());

  return foodsData.filter((item) => {
    const nameMatch = fixTurkishToLower(item.name).includes(normalizedQuery);
    const categoryMatch = fixTurkishToLower(item.category).includes(normalizedQuery);
    return nameMatch || categoryMatch;
  });
}

async function loadFoods() {
  const resultsBody = document.getElementById("resultsBody");

  try {
    const response = await fetch("foods.json");

    if (!response.ok) {
      throw new Error("Besin verileri yüklenemedi.");
    }

    foodsData = await response.json();
    renderTable(foodsData);
  } catch (error) {
    console.error(error);
    resultsBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger py-4">
          Besin verileri yüklenirken bir sorun oluştu.
        </td>
      </tr>
    `;
  }
}

document.getElementById("searchInput").addEventListener("input", (event) => {
  renderTable(filterFoods(event.target.value));
});

loadFoods();

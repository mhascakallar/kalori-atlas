let foodsData = [];
let activeCategory = "Tümü";
function slugify(text) {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
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
               <td>
          <a
            href="/besin/${slugify(item.name)}"
            class="food-name-link"
          >
            <strong>${item.name}</strong>
          </a>
        </td>
        <td>
          <span class="badge bg-light text-dark border">
            ${item.category}
          </span>
        </td>
        <td>${item.portion}</td>
        <td><strong>${item.calories}</strong></td>
        <td>
          <span class="badge bg-success badge-macro">
            ${item.protein}g
          </span>
        </td>
        <td>
          <span class="badge bg-primary badge-macro">
            ${item.carbs}g
          </span>
        </td>
        <td>
          <span class="badge bg-warning text-dark badge-macro">
            ${item.fat}g
          </span>
        </td>
      </tr>
    `;

    resultsBody.insertAdjacentHTML("beforeend", row);
  });
}

function renderCategoryFilters() {
  const categoryFilters = document.getElementById("categoryFilters");

  const categories = [
    "Tümü",
    ...new Set(foodsData.map((item) => item.category))
  ];

  categoryFilters.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;

    const isActive = category === activeCategory;

    button.className = isActive
      ? "btn btn-light btn-sm text-primary fw-bold"
      : "btn btn-outline-light btn-sm";

    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategoryFilters();
      applyFilters();
    });

    categoryFilters.appendChild(button);
  });
}

function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const query = fixTurkishToLower(searchInput.value.trim());

  const filteredFoods = foodsData.filter((item) => {
    const nameMatch =
      fixTurkishToLower(item.name).includes(query);

    const categorySearchMatch =
      fixTurkishToLower(item.category).includes(query);

    const searchMatch =
      nameMatch || categorySearchMatch;

    const categoryMatch =
      activeCategory === "Tümü" ||
      item.category === activeCategory;

    return searchMatch && categoryMatch;
  });

  renderTable(filteredFoods);
}

async function loadFoods() {
  const resultsBody = document.getElementById("resultsBody");

  try {
    const response = await fetch("foods.json");

    if (!response.ok) {
      throw new Error("Besin verileri yüklenemedi.");
    }

    foodsData = await response.json();

    renderCategoryFilters();
    applyFilters();
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

document
  .getElementById("searchInput")
  .addEventListener("input", applyFilters);

loadFoods();

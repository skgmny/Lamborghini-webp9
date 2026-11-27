const image = document.querySelector("#config-image");
const caption = document.querySelector("#config-caption");
const swatches = document.querySelector("#exterior-options");
const selectedCarId = localStorage.getItem("selectedCar");

async function initialize() {
  const response = await fetch("9_Lamborguinea_cars.json");
  if (!response.ok) return;

  const cars = await response.json();
  const savedCar = cars.find(car =>
    car.id === selectedCarId && car.category.trim().toUpperCase() !== "LIMITED"
  );
  const modelId = new URLSearchParams(location.search).get("id") || savedCar?.id || "temerario";
  const car = cars.find(item => item.id === modelId);
  if (!car) return;

  document.title = "내 차량 만들기 | " + car.name;
  document.querySelector("#config-model-name").textContent = car.name;
  document.querySelector("#config-detail-link").href = "9_Lamborguinea_details.html?id=" + encodeURIComponent(car.id);

  const category = car.category.trim().toUpperCase();
  if (category !== "SPORTS CAR" && category !== "SUV") {
    swatches.closest("fieldset").hidden = true;
    return;
  }

  const stats = document.querySelector("#config-model-stats");
  for (const { label, value, unit } of car.configureStats ?? car.stats) {
    const item = document.createElement("div");
    const name = document.createElement("dt");
    const number = document.createElement("dd");
    name.textContent = label;
    number.textContent = value + " " + unit;
    item.append(name, number);
    stats.append(item);
  }
  stats.hidden = false;

  const options = car.customization?.exterior.filter(option => option.image) ?? [];
  if (!options.length) return;

  image.addEventListener("error", () => {
    image.hidden = true;
  });

  function showPhoto(option) {
    const label = "외장 · " + option.name;
    image.alt = car.name + " " + label;
    image.src = option.image;
    image.hidden = false;
    caption.textContent = label;
  }

  const saveButton = document.querySelector(".config-save");
  const saveStatus = document.querySelector(".config-save-status");
  const storageKey = "configureExterior:" + car.id;
  const savedOptionId = localStorage.getItem(storageKey);
  let selectedOption = options.find(option => option.id === savedOptionId) ?? options[0];

  for (const option of options) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const text = document.createElement("span");

    label.className = "config-swatch";
    label.style.setProperty("--swatch", option.color);
    input.type = "radio";
    input.name = "exterior";
    input.value = option.id;
    input.checked = option === selectedOption;
    input.title = option.name;
    input.addEventListener("change", () => {
      selectedOption = option;
      saveStatus.textContent = "";
      showPhoto(option);
    });
    label.append(input, text);
    swatches.append(label);
  }

  saveButton.addEventListener("click", () => {
    try {
      localStorage.setItem(storageKey, selectedOption.id);
      saveStatus.textContent = "저장완료.";
    } catch (error) {
      console.error(error);
    }
  });
  saveButton.hidden = false;
  showPhoto(selectedOption);
}

initialize().catch(console.error);

const image = document.querySelector("#config-image");
const caption = document.querySelector("#config-caption");
const statusMessage = document.querySelector("#config-status");
const swatches = document.querySelector("#exterior-options");
const selectedCarId = localStorage.getItem("selectedCar");

async function initialize() {
  try {
    const response = await fetch("cars.json");
    if (!response.ok) throw new Error("차량 데이터 요청 실패");

    const cars = await response.json();
    const savedCar = cars.find(car =>
      car.id === selectedCarId && car.category.trim().toUpperCase() !== "LIMITED"
    );
    const modelId = new URLSearchParams(location.search).get("id") || savedCar?.id || "temerario";
    const car = cars.find(item => item.id === modelId);
    if (!car) throw new Error("선택한 차량이 없음");

    document.title = "내 차량 만들기 | " + car.name;
    document.querySelector("#config-model-name").textContent = car.name;
    document.querySelector("#config-detail-link").href = "detail.html?id=" + encodeURIComponent(car.id);

    const category = car.category.trim().toUpperCase();
    if (category !== "SPORTS CAR" && category !== "SUV") {
      swatches.closest("fieldset").hidden = true;
      statusMessage.textContent = "이 모델은 커스터마이징을 지원하지 않아요.";
      return;
    }

    document.body.classList.add("config-exterior-stage");
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
    statusMessage.textContent = "";

    const options = car.customization?.exterior.filter(option => option.image) ?? [];
    if (!options.length) return;

    image.addEventListener("error", () => {
      image.hidden = true;
      statusMessage.textContent = "미리보기 이미지를 불러오지 못했어요.";
    });

    function showPhoto(option) {
      statusMessage.textContent = "";
      const label = "외장 · " + option.name;
      image.alt = car.name + " " + label;
      image.src = option.image;
      image.hidden = false;
      caption.textContent = label;
    }

    for (const [index, option] of options.entries()) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      const text = document.createElement("span");

      label.className = "config-swatch";
      label.style.setProperty("--swatch", option.color);
      input.type = "radio";
      input.name = "exterior";
      input.value = option.id;
      input.checked = index === 0;
      input.title = option.id;
      input.addEventListener("change", () => showPhoto(option));
      label.append(input, text);
      swatches.append(label);
    }

    showPhoto(options[0]);
  } catch (error) {
    statusMessage.textContent = "차량 옵션을 불러오지 못했어요. 로컬 웹 서버에서 페이지를 다시 열어 주세요.";
    console.error(error);
  }
}

initialize();

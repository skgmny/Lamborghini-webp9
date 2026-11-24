const form = document.querySelector(".config-controls");
const image = document.querySelector("#config-image");
const caption = document.querySelector("#config-caption");
const statusMessage = document.querySelector("#config-status");
const viewButtons = document.querySelectorAll("[data-view]");
const resetButton = form.querySelector("[type=reset]");
const selectedCarId = localStorage.getItem("selectedCar");

let previewRequest = 0;

function loadPreview(path, crop = [0, 0, 1, 1], paint) {
  const photo = new Image();
  photo.src = path;

  return photo.decode().then(() => {
    const [left, top, width, height] = crop;
    const sourceWidth = photo.naturalWidth * width;
    const sourceHeight = photo.naturalHeight * height;

    const canvas = document.createElement("canvas");
    canvas.width = Math.min(Math.round(sourceWidth), 1440);
    canvas.height = Math.round(canvas.width * sourceHeight / sourceWidth);

    const context = canvas.getContext("2d");
    context.drawImage(
      photo,
      photo.naturalWidth * left,
      photo.naturalHeight * top,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const original = context.getImageData(0, 0, canvas.width, canvas.height);
    let mask;
    if (paint) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Outlines use coordinates from a 350px-wide copy of each photo.
      const scale = canvas.width / 350;
      context.save();
      context.scale(scale, scale);
      for (const [[left, top], ...points] of paint.paths) {
        context.beginPath();
        context.moveTo(left, top);
        for (const [x, y] of points) context.lineTo(x, y);
        context.closePath();
        context.fill();
      }
      context.restore();
      mask = context.getImageData(0, 0, canvas.width, canvas.height).data;
    }
    return { canvas, context, original, mask };
  });
}

function recolor(preview, view, color, spyderExterior, paint) {
  const { canvas, context, original, mask } = preview;
  const result = context.createImageData(canvas.width, canvas.height);
  const pixels = original.data;
  const output = result.data;
  const target = color.slice(1).match(/../g).map(channel => parseInt(channel, 16));

  // 원본 사진의 파란 도장이나 갈색 가죽에 가까운 픽셀을 찾고,
  // 각 픽셀의 밝기를 반영해 선택한 색상을 입힙니다.
  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];

    let chroma = view === "exterior"
      ? Math.min((blue - green - 4) / 10, (green - red - 3) / 8)
      : Math.min((red - green - 10) / 18, (green - blue - 7) / 13);

    if (paint) {
      chroma = 1;
      if (paint.channel === "red") chroma = (red - Math.max(green, blue) - 22) / 28;
      if (paint.channel === "yellow") chroma = (Math.min(red, green) - blue - 20) / 32;
    }

    const coverage = Math.max(0, Math.min(1, chroma)) * (mask ? mask[i + 3] / 255 : 1);
    const light = (red * .2126 + green * .7152 + blue * .0722)
      / (paint?.light ?? (spyderExterior ? 152 : view === "exterior" ? 67 : 97));

    output[i] = red + (target[0] * light - red) * coverage;
    output[i + 1] = green + (target[1] * light - green) * coverage;
    output[i + 2] = blue + (target[2] * light - blue) * coverage;
    output[i + 3] = pixels[i + 3];
  }

  context.putImageData(result, 0, 0);
  return canvas.toDataURL("image/webp", .9);
}

async function initialize() {
  try {
    const response = await fetch("cars.json");
    if (!response.ok) throw new Error("차량 데이터 요청 실패");

    const cars = await response.json();
    const savedCar = cars.find(item =>
      item.id === selectedCarId && (item.customization || item.exteriorPaint)
    );
    const modelId = new URLSearchParams(location.search).get("id") || savedCar?.id || "temerario";
    const car = cars.find(item => item.id === modelId);
    if (!car) throw new Error("선택한 차량이 없음");

    const paint = car.exteriorPaint;
    const exteriorColors = cars.find(item => item.id === "temerario").customization.exterior;
    const options = car.customization ?? (paint && {
      exterior: [{ id: "original", name: "원본", color: "#999999" }, ...exteriorColors]
    });
    const views = { exterior: "외장", interior: "실내" };
    const photos = car.previewImages ?? { exterior: car.heroImage };
    document.title = "내 차량 만들기 | " + car.name;
    document.querySelector("#config-model-name").textContent = car.name;
    document.querySelector("#config-detail-link").href = "detail.html?id=" + encodeURIComponent(car.id);

    if (!options?.interior) {
      document.querySelector("#interior-fieldset").hidden = true;
      document.querySelector("#interior-summary").hidden = true;
      document.querySelector(".config-preview .config-views").hidden = true;
    }

    if (!options) {
      image.src = car.heroImage;
      image.alt = car.name + " 외관";
      caption.textContent = "외장 이미지";
      form.querySelectorAll("fieldset, .config-summary, .config-reset").forEach(control => {
        control.hidden = true;
      });
      document.querySelector(".config-note").hidden = true;
      statusMessage.textContent = "이 모델은 커스터마이징을 지원하지 않아요.";
      return;
    }

    const previews = new Map();
    const cachedColors = new Map();

    async function updatePreview(view) {
      const request = ++previewRequest;
      const selected = new FormData(form);

      for (const [name, choices] of Object.entries(options)) {
        const option = choices.find(choice => choice.id === selected.get(name));
        const summary = document.querySelector("#" + name + "-value");

        summary.textContent = option.name;
        summary.style.setProperty("--swatch", option.color);
      }

      for (const button of viewButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.view === view));
      }

      const option = options[view].find(choice => choice.id === selected.get(view));
      const label = views[view] + " · " + option.name;
      const key = view + ":" + option.id;
      const spyderExterior = car.id === "temerario-spyder" && view === "exterior";

      statusMessage.textContent = "";
      if (option.id === "original") {
        image.src = photos[view];
        image.alt = car.name + " " + label;
        caption.textContent = label;
        image.removeAttribute("aria-busy");
        return;
      }
      image.setAttribute("aria-busy", "true");

      try {
        if (!previews.has(view)) {
          previews.set(
            view,
            loadPreview(photos[view], spyderExterior ? [.32, .21, .61, .72] : undefined, paint)
          );
        }

        const preview = await previews.get(view);

        // 빠르게 여러 옵션을 눌러도 마지막 선택만 화면에 표시합니다.
        if (request !== previewRequest) return;

        if (!cachedColors.has(key)) {
          cachedColors.set(key, recolor(preview, view, option.color, spyderExterior, paint));
        }

        image.src = cachedColors.get(key);
        image.alt = car.name + " " + label;
        caption.textContent = label;
      } catch (error) {
        previews.delete(view);
        if (request !== previewRequest) return;

        statusMessage.textContent = "미리보기 이미지를 불러오지 못했어요. 다시 선택해 주세요.";
        console.error(error);
      } finally {
        if (request === previewRequest) {
          image.removeAttribute("aria-busy");
        }
      }
    }

    for (const [name, choices] of Object.entries(options)) {
      const container = document.querySelector("#" + name + "-options");

      for (const [index, option] of choices.entries()) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");

        label.className = "config-swatch";
        label.style.setProperty("--swatch", option.color);
        input.type = "radio";
        input.name = name;
        input.value = option.id;
        input.defaultChecked = index === 0;
        text.textContent = option.name;

        label.append(input, text);
        container.append(label);
      }
    }

    form.addEventListener("change", event => updatePreview(event.target.name));
    form.addEventListener("reset", () => {
      requestAnimationFrame(() => updatePreview("exterior"));
    });

    for (const button of viewButtons) {
      if (!options[button.dataset.view]) continue;
      button.disabled = false;
      button.addEventListener("click", () => updatePreview(button.dataset.view));
    }

    resetButton.disabled = false;
    await updatePreview("exterior");
  } catch (error) {
    statusMessage.textContent = "차량 옵션을 불러오지 못했어요. 로컬 웹 서버에서 페이지를 다시 열어 주세요.";
    console.error(error);
  }
}

initialize();

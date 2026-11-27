const modal = document.querySelector(".detail-modal");
const openButtons = document.querySelectorAll(".detail-open-request");
const closeButton = document.querySelector(".detail-modal-close");

for (const button of openButtons) {
  button.addEventListener("click", () => {
    modal.style.display = "block";
    document.querySelector(".detail-form-message").innerHTML = "";
  });
}

document.querySelector(".detail-back").addEventListener("click", () => {
  if (document.referrer.indexOf("models") !== -1) {
    history.back();
  } else {
    location.href = "9_Lamborguinea_models.html";
  }
});

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

let currentCar;
let currentTab = 0;
let currentSlide = 0;
let allCars = [];

const prevButton = document.querySelector(".detail-prev");
const nextButton = document.querySelector(".detail-next");
const toggleButton = document.querySelector(".detail-slide-toggle");

function openDesc() {
  document.querySelector(".detail-desc").style.display = "block";
  document.querySelector(".detail-slide-img").style.opacity = "0.3";
  toggleButton.innerHTML = "×";
}

function closeDesc() {
  document.querySelector(".detail-desc").style.display = "none";
  document.querySelector(".detail-slide-img").style.opacity = "1";
  toggleButton.innerHTML = "+";
}

toggleButton.addEventListener("click", () => {
  if (document.querySelector(".detail-desc").style.display === "block") {
    closeDesc();
  } else {
    openDesc();
  }
});

function getList(key) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

const favoriteButton = document.querySelector(".detail-favorite");

function updateFavoriteButton() {
  const favorites = getList("favorites");
  const found = favorites.filter(id => id === currentCar.id);

  const icon = favoriteButton.querySelector("img");

  if (found.length > 0) {
    icon.src = "images/9_bookmark_filled.png";
    icon.alt = "관심 등록 해제";
    favoriteButton.setAttribute("title", "관심 등록 해제");
  } else {
    icon.src = "images/9_bookmark.png";
    icon.alt = "관심 등록";
    favoriteButton.setAttribute("title", "관심 등록");
  }
}

favoriteButton.addEventListener("click", () => {
  let favorites = getList("favorites");
  const found = favorites.filter(id => id === currentCar.id);

  if (found.length > 0) {
    favorites = favorites.filter(id => id !== currentCar.id);
  } else {
    favorites.push(currentCar.id);
  }

  saveList("favorites", favorites);
  updateFavoriteButton();
});

function saveRecent() {
  let recent = getList("recentCars");

  recent = recent.filter(id => id !== currentCar.id);
  recent = [currentCar.id].concat(recent);

  recent = recent.slice(0, 3);

  saveList("recentCars", recent);
}

const form = document.querySelector(".detail-form");
const formMessage = document.querySelector(".detail-form-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#req-name").value;
  const phone = document.querySelector("#req-phone").value;
  const date = document.querySelector("#req-date").value;
  const memo = document.querySelector("#req-memo").value;
  const agree = document.querySelector(".detail-form input[name='agree']").checked;

  let type = "";
  const radios = document.querySelectorAll(".detail-form input[name='type']");
  for (const radio of radios) {
    if (radio.checked) {
      type = radio.value;
    }
  }

  formMessage.style.color = "var(--danger)";
  if (name === "") {
    formMessage.innerHTML = "이름을 입력해 주세요.";
    return;
  }
  if (phone === "") {
    formMessage.innerHTML = "연락처를 입력해 주세요.";
    return;
  }
  if (date === "") {
    formMessage.innerHTML = "희망 날짜를 선택해 주세요.";
    return;
  }
  if (agree === false) {
    formMessage.innerHTML = "개인정보 수집 및 이용에 동의해 주세요.";
    return;
  }

  const now = new Date();
  const createdAt = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();

  const requests = getList("requests");
  requests.push({
    carId: currentCar.id,
    carName: currentCar.name,
    type: type,
    name: name,
    phone: phone,
    date: date,
    memo: memo,
    createdAt: createdAt
  });
  saveList("requests", requests);

  formMessage.style.color = "var(--point)";
  formMessage.innerHTML = "신청이 완료되었습니다. 마이페이지에서 확인할 수 있어요.";
  document.querySelector("#req-name").value = "";
  document.querySelector("#req-phone").value = "";
  document.querySelector("#req-date").value = "";
  document.querySelector("#req-memo").value = "";
  document.querySelector(".detail-form input[name='agree']").checked = false;
});

function driveIn() {
  const heroImg = document.querySelector(".detail-hero-img");

  heroImg.style.transition = "none";
  heroImg.style.transform = "translateX(60%)";
  heroImg.style.opacity = "0";

  setTimeout(() => {
    heroImg.style.transition = "";
    heroImg.style.transform = "";
    heroImg.style.opacity = "";
  }, 50);
}

function showCar(car) {
  driveIn();
  document.querySelector(".detail-hero-img").src = car.heroImage;
  document.querySelector(".detail-hero-img").alt = car.name;
  document.querySelector(".detail-slogan").innerHTML = car.slogan;
  document.querySelector(".detail-name").innerHTML = car.name;
  document.querySelector(".detail-intro").innerHTML = car.intro;
  document.querySelector(".detail-modal-car").innerHTML = car.name;

  let statsHTML = "";
  for (const stat of car.stats) {
    statsHTML += "<li class='stat'>" + stat.value +
                 "<span class='detail-stat-unit'>" + stat.unit + "</span>" +
                 "<small>" + stat.label + "</small></li>";
  }
  document.querySelector(".detail-stats").innerHTML = statsHTML;

  let specsHTML = "";
  for (const spec of car.specs) {
    specsHTML += "<div class='detail-spec-item'><dt>" + spec.label +
                 "</dt><dd>" + spec.value + "</dd></div>";
  }
  document.querySelector(".detail-specs").innerHTML = specsHTML;

  currentCar = car;
  const configureLink = document.querySelector(".detail-configure");
  configureLink.href = "9_Lamborguinea_configure.html?id=" + car.id;
  if (car.customization) {
    configureLink.style.display = "";
  } else {
    configureLink.style.display = "none";
  }

  currentTab = 0;
  currentSlide = 0;

  localStorage.setItem("selectedCar", car.id);
  makeTrims();

  makeTabs();
  showFeature();
  updateFavoriteButton();
  saveRecent();
}

function makeTrims() {
  const trimBox = document.querySelector(".detail-trims");

  const trims = allCars.filter(car => car.series === currentCar.series);

  if (trims.length < 2) {
    trimBox.innerHTML = "";
    return;
  }

  let trimsHTML = "";
  for (const trim of trims) {
    if (trim.id === currentCar.id) {
      trimsHTML += "<button type='button' class='select-item active'>" + trim.name + "</button>";
    } else {
      trimsHTML += "<button type='button' class='select-item'>" + trim.name + "</button>";
    }
  }
  trimBox.innerHTML = trimsHTML;

  const trimButtons = trimBox.querySelectorAll("button");
  for (let i = 0; i < trimButtons.length; i++) {
    trimButtons[i].addEventListener("click", () => {
      showCar(trims[i]);
    });
  }
}

function makeTabs() {
  const tabBox = document.querySelector(".detail-tabs");

  let tabsHTML = "";
  for (const feature of currentCar.design) {
    tabsHTML += "<button type='button' class='select-item'>" + feature.tab + "</button>";
  }
  tabBox.innerHTML = tabsHTML;

  const tabButtons = tabBox.querySelectorAll("button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", () => {
      currentTab = i;
      currentSlide = 0;
      fadeFeature();
    });
  }
}

function showFeature() {
  const feature = currentCar.design[currentTab];
  const images = feature.images;
  const image = images[currentSlide];

  const slideImg = document.querySelector(".detail-slide-img");
  slideImg.src = image.src;
  slideImg.alt = currentCar.name + " " + image.title;

  document.querySelector(".detail-slide-name").innerHTML = image.title;
  document.querySelector(".detail-slide-count").innerHTML = (currentSlide + 1) + " / " + images.length;

  document.querySelector(".detail-desc").innerHTML = image.desc;
  closeDesc();

  const tabButtons = document.querySelectorAll(".detail-tabs button");
  for (let i = 0; i < tabButtons.length; i++) {
    if (i === currentTab) {
      tabButtons[i].setAttribute("class", "select-item active");
    } else {
      tabButtons[i].setAttribute("class", "select-item");
    }
  }
}

function fadeFeature() {
  document.querySelector(".detail-slide-img").style.opacity = "0";
  document.querySelector(".detail-slide-text").style.opacity = "0";

  setTimeout(() => {
    showFeature();
    document.querySelector(".detail-slide-text").style.opacity = "1";
  }, 250);
}

prevButton.addEventListener("click", () => {
  currentSlide = currentSlide - 1;

  if (currentSlide < 0) {
    currentTab = currentTab - 1;
    if (currentTab < 0) {
      currentTab = currentCar.design.length - 1;
    }
    currentSlide = currentCar.design[currentTab].images.length - 1;
  }
  fadeFeature();
});

nextButton.addEventListener("click", () => {
  const total = currentCar.design[currentTab].images.length;
  currentSlide = currentSlide + 1;

  if (currentSlide >= total) {
    currentTab = currentTab + 1;
    if (currentTab >= currentCar.design.length) {
      currentTab = 0;
    }
    currentSlide = 0;
  }
  fadeFeature();
});

const carId = new URLSearchParams(location.search).get("id") || localStorage.getItem("selectedCar");

fetch("9_Lamborguinea_cars.json")
  .then(response => response.json())
  .then(cars => {
    allCars = cars;
    const result = cars.filter(car => car.id === carId);

    let car;
    if (result.length > 0) {
      car = result[0];
    } else {
      car = cars[0];
    }

    showCar(car);
  });
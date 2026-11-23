// =========================================================
// detail.js : 차량 상세 페이지
// =========================================================


// ===== 문의하기 창 열기 / 닫기 =====

const modal = document.querySelector(".detail-modal");
const openButtons = document.querySelectorAll(".detail-open-request");
const closeButton = document.querySelector(".detail-modal-close");

// 문의하기 버튼이 히어로와 하단에 두 개 있어서 querySelectorAll로 모두 찾고,
// for...of로 하나씩 클릭 이벤트를 달아 줌
for (const button of openButtons) {
  button.addEventListener("click", () => {
    modal.style.display = "block";
    document.querySelector(".detail-form-message").innerHTML = "";
  });
}

// X 버튼을 누르면 다시 숨김
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});


// ===== 지금 보고 있는 상태 =====

let currentCar;       // 지금 보고 있는 차
let currentTab = 0;   // 몇 번째 탭인지 (0: 첫 번째)
let currentSlide = 0; // 그 탭에서 몇 번째 사진인지
let allCars = [];     // JSON에서 불러온 전체 차 목록

const prevButton = document.querySelector(".detail-prev");
const nextButton = document.querySelector(".detail-next");
const toggleButton = document.querySelector(".detail-slide-toggle");


// ===== + 버튼으로 설명 열고 닫기 =====

function openDesc() {
  document.querySelector(".detail-desc").style.display = "block";
  document.querySelector(".detail-slide-img").style.opacity = "0.3";   // 사진 어둡게
  toggleButton.innerHTML = "×";
}

function closeDesc() {
  document.querySelector(".detail-desc").style.display = "none";
  document.querySelector(".detail-slide-img").style.opacity = "1";     // 사진 원래대로
  toggleButton.innerHTML = "+";
}

toggleButton.addEventListener("click", () => {
  if (document.querySelector(".detail-desc").style.display === "block") {
    closeDesc();
  } else {
    openDesc();
  }
});

// ===== localStorage 배열 꺼내기 / 저장하기 =====

// 저장된 게 없으면 빈 배열, 있으면 글자를 배열로 바꿔서 돌려줌
function getList(key) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

// 배열을 글자로 바꿔서 저장
function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}


// ===== 관심 등록 =====

const favoriteButton = document.querySelector(".detail-favorite");

// 지금 차가 관심 목록에 있는지 보고 버튼 글자 바꾸기
function updateFavoriteButton() {
  const favorites = getList("favorites");
  const found = favorites.filter(id => id === currentCar.id);

  if (found.length > 0) {
    favoriteButton.innerHTML = "관심 등록됨";
    favoriteButton.setAttribute("class", "btn-outline detail-favorite saved");
  } else {
    favoriteButton.innerHTML = "관심 등록";
    favoriteButton.setAttribute("class", "btn-outline detail-favorite");
  }
}

favoriteButton.addEventListener("click", () => {
  let favorites = getList("favorites");
  const found = favorites.filter(id => id === currentCar.id);

  if (found.length > 0) {
    // 이미 있으면 → 목록에서 빼기 (지금 차가 아닌 것만 남김)
    favorites = favorites.filter(id => id !== currentCar.id);
  } else {
    // 없으면 → 목록에 추가
    favorites.push(currentCar.id);
  }

  saveList("favorites", favorites);
  updateFavoriteButton();
});

// ===== 최근 본 차량 =====

function saveRecent() {
  let recent = getList("recentCars");

  // 이미 있으면 먼저 빼고(중복 방지), 지금 차를 맨 앞에 붙임
  recent = recent.filter(id => id !== currentCar.id);
  recent = [currentCar.id].concat(recent);

  // 5개까지만 남기기
  recent = recent.slice(0, 5);

  saveList("recentCars", recent);
}

// ===== 문의 폼 =====

const form = document.querySelector(".detail-form");
const formMessage = document.querySelector(".detail-form-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();   // 폼 제출 시 페이지 새로고침 막기

  const name = document.querySelector("#req-name").value;
  const phone = document.querySelector("#req-phone").value;
  const date = document.querySelector("#req-date").value;
  const memo = document.querySelector("#req-memo").value;
  const agree = document.querySelector(".detail-form input[name='agree']").checked;

  // 라디오 버튼 중 선택된 것 찾기
  let type = "";
  const radios = document.querySelectorAll(".detail-form input[name='type']");
  for (const radio of radios) {
    if (radio.checked) {
      type = radio.value;
    }
  }

  // 빠진 항목 확인 (위에서부터 하나씩)
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

  // 신청한 날짜 만들기
  const now = new Date();
  const createdAt = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();

  // 저장
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

  // 완료 안내 + 입력칸 비우기
  formMessage.style.color = "var(--point)";
  formMessage.innerHTML = "신청이 완료되었습니다. 마이페이지에서 확인할 수 있어요.";
  document.querySelector("#req-name").value = "";
  document.querySelector("#req-phone").value = "";
  document.querySelector("#req-date").value = "";
  document.querySelector("#req-memo").value = "";
  document.querySelector(".detail-form input[name='agree']").checked = false;
});

// ===== 화면에 차 한 대의 정보를 채우는 함수 =====

function showCar(car) {
  document.querySelector(".detail-hero-img").src = car.heroImage;
  document.querySelector(".detail-slogan").innerHTML = car.slogan;
  document.querySelector(".detail-name").innerHTML = car.name;
  if (car.price === 0) {
    document.querySelector(".detail-price").innerHTML = "가격 문의";
  } else {
    document.querySelector(".detail-price").innerHTML = (car.price / 100000000) + "억 원부터";
  }
  document.querySelector(".detail-intro").innerHTML = car.intro;
  document.querySelector(".detail-modal-car").innerHTML = car.name;

  // 핵심 수치: 배열을 돌면서 <li>를 글자로 이어 붙인 뒤 한 번에 넣기
  let statsHTML = "";
  for (const stat of car.stats) {
    statsHTML += "<li class='stat'>" + stat.value +
                 "<span class='detail-stat-unit'>" + stat.unit + "</span>" +
                 "<small>" + stat.label + "</small></li>";
  }
  document.querySelector(".detail-stats").innerHTML = statsHTML;

  // 제원: 같은 방식으로 <div><dt><dd>를 이어 붙이기
  let specsHTML = "";
  for (const spec of car.specs) {
    specsHTML += "<div class='detail-spec-item'><dt>" + spec.label +
                 "</dt><dd>" + spec.value + "</dd></div>";
  }
  document.querySelector(".detail-specs").innerHTML = specsHTML;

  // 지금 차를 기억하고, 첫 번째 탭·첫 번째 사진부터 시작
  currentCar = car;
  for (const link of document.querySelectorAll('a[href^="configure.html"]')) {
    link.href = "configure.html?id=" + encodeURIComponent(car.id);
    link.style.display = car.customization ? "" : "none";
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

// ===== 트림 버튼 만들기 =====

function makeTrims() {
  const trimBox = document.querySelector(".detail-trims");

  // 지금 차와 같은 계열인 차들만 골라냄
  const trims = allCars.filter(car => car.series === currentCar.series);

  // 같은 계열이 자기 하나뿐이면 버튼을 안 보여줌
  if (trims.length < 2) {
    trimBox.innerHTML = "";
    return;
  }

  // 버튼 글자 만들기. 지금 차만 active
  let trimsHTML = "";
  for (const trim of trims) {
    if (trim.id === currentCar.id) {
      trimsHTML += "<button type='button' class='select-item active'>" + trim.name + "</button>";
    } else {
      trimsHTML += "<button type='button' class='select-item'>" + trim.name + "</button>";
    }
  }
  trimBox.innerHTML = trimsHTML;

  // 버튼을 누르면 그 차로 화면 전체를 다시 채움
  const trimButtons = trimBox.querySelectorAll("button");
  for (let i = 0; i < trimButtons.length; i++) {
    trimButtons[i].addEventListener("click", () => {
      showCar(trims[i]);
    });
  }
}

// ===== 탭 버튼 만들기 =====

function makeTabs() {
  const tabBox = document.querySelector(".detail-tabs");

  // JSON의 design 배열 개수만큼 버튼 글자를 이어 붙임
  let tabsHTML = "";
  for (const feature of currentCar.design) {
    tabsHTML += "<button type='button' class='select-item'>" + feature.tab + "</button>";
  }
  tabBox.innerHTML = tabsHTML;

  // 만든 버튼들에 클릭 이벤트 달기
  const tabButtons = tabBox.querySelectorAll("button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", () => {
      currentTab = i;      // 누른 버튼의 순서 = 탭 번호
      currentSlide = 0;    // 탭을 바꾸면 첫 사진부터
      fadeFeature();
    });
  }
}

// ===== 지금 탭, 지금 사진을 화면에 보여주기 =====

function showFeature() {
  const feature = currentCar.design[currentTab];
  const images = feature.images;
  const image = images[currentSlide];      // 지금 사진 하나 (src, title, desc가 들어 있음)

  const slideImg = document.querySelector(".detail-slide-img");
  slideImg.src = image.src;
  slideImg.alt = currentCar.name + " " + image.title;

  document.querySelector(".detail-slide-name").innerHTML = image.title;
  document.querySelector(".detail-slide-count").innerHTML = (currentSlide + 1) + " / " + images.length;

  // 설명은 넣어 두되, 사진이 바뀔 때마다 닫힌 상태로
  document.querySelector(".detail-desc").innerHTML = image.desc;
  closeDesc();

  // 지금 탭 버튼만 노란색(active)으로
  const tabButtons = document.querySelectorAll(".detail-tabs button");
  for (let i = 0; i < tabButtons.length; i++) {
    if (i === currentTab) {
      tabButtons[i].setAttribute("class", "select-item active");
    } else {
      tabButtons[i].setAttribute("class", "select-item");
    }
  }
}

// ===== 부드럽게 넘기기 =====
function fadeFeature() {
  // 사진과 글자를 투명하게
  document.querySelector(".detail-slide-img").style.opacity = "0";
  document.querySelector(".detail-slide-text").style.opacity = "0";

  // 사라지는 시간(0.25초)만큼 기다렸다가 새 사진으로 바꾸고 다시 보이게
  setTimeout(() => {
    showFeature();
    document.querySelector(".detail-slide-text").style.opacity = "1";
  }, 250);
}

// ===== 이전 / 다음 버튼 =====

prevButton.addEventListener("click", () => {
  currentSlide = currentSlide - 1;

  // 이 탭의 첫 사진에서 이전을 누르면 이전 탭의 마지막 사진으로
  if (currentSlide < 0) {
    currentTab = currentTab - 1;
    if (currentTab < 0) {
      currentTab = currentCar.design.length - 1;   // 첫 탭 이전은 마지막 탭
    }
    currentSlide = currentCar.design[currentTab].images.length - 1;
  }
  fadeFeature();
});

nextButton.addEventListener("click", () => {
  const total = currentCar.design[currentTab].images.length;
  currentSlide = currentSlide + 1;

  // 이 탭의 사진을 다 봤으면 다음 탭의 첫 사진으로
  if (currentSlide >= total) {
    currentTab = currentTab + 1;
    if (currentTab >= currentCar.design.length) {
      currentTab = 0;              // 마지막 탭 다음은 첫 탭
    }
    currentSlide = 0;
  }
  fadeFeature();
});

// ===== JSON 불러와서 화면 채우기 =====

// 탐색 페이지에서 저장해 둔 차 id 꺼내기
const carId = new URLSearchParams(location.search).get("id") || localStorage.getItem("selectedCar");

fetch("cars.json")
  .then(response => response.json())
  .then(cars => {
    allCars = cars;
    const result = cars.filter(car => car.id === carId);

    let car;
    if (result.length > 0) {
      car = result[0];      // 찾은 차
    } else {
      car = cars[0];        // 저장된 id가 없으면 첫 번째 차
    }

    showCar(car);
  });
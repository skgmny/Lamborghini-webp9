let allCars = [];

const wishListContainer = document.getElementById("wishListContainer");
const wishCountEl = document.getElementById("wishCount");
const clearAllBtn = document.getElementById("clearAllBtn");

const customListContainer = document.getElementById("customListContainer");
const clearCustomBtn = document.getElementById("clearCustomBtn");

const recentListContainer = document.getElementById("recentListContainer");
const clearRecentBtn = document.getElementById("clearRecentBtn");

const requestListContainer = document.getElementById("requestListContainer");
const requestCountEl = document.getElementById("requestCount");
const clearRequestsBtn = document.getElementById("clearRequestsBtn");

fetch("9_Lamborguinea_cars.json")
  .then(response => response.json())
  .then(data => {
    allCars = data;
    renderWishList();
    renderCustomList();
    renderRecentList();
    renderRequestList();
  })
  .catch(error => {
    console.error("데이터 불러오기 실패:", error);
  });

function getWishIds() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function getRecentKey() {
  if (localStorage.getItem("recentCars") !== null) {
    return "recentCars";
  }
  if (localStorage.getItem("recentlyViewed") !== null) {
    return "recentlyViewed";
  }
  if (localStorage.getItem("recent") !== null) {
    return "recent";
  }
  return "recentCars";
}

function getRecentIds() {
  const key = getRecentKey();
  return JSON.parse(localStorage.getItem(key)) || [];
}

function getRequests() {
  return JSON.parse(localStorage.getItem("requests")) || [];
}

function addRecentCar(carId) {
  const key = getRecentKey();
  let recentIds = getRecentIds();
  const idx = recentIds.indexOf(carId);
  if (idx !== -1) {
    recentIds.splice(idx, 1);
  }
  recentIds.unshift(carId);
  if (recentIds.length > 3) {
    recentIds = recentIds.slice(0, 3);
  }
  localStorage.setItem(key, JSON.stringify(recentIds));
}

function goDetail(carId) {
  addRecentCar(carId);
  localStorage.setItem("selectedCar", carId);
  location.href = "9_Lamborguinea_details.html?id=" + carId;
}

function goCustomize(carId) {
  localStorage.setItem("selectedCar", carId);
  location.href = "9_Lamborguinea_configure.html?id=" + carId;
}

function removeWish(carId) {
  let wishIds = getWishIds();
  const idx = wishIds.indexOf(carId);

  if (idx !== -1) {
    wishIds.splice(idx, 1);
    localStorage.setItem("favorites", JSON.stringify(wishIds));
    renderWishList();
    renderRecentList();
  }
}

function toggleWish(carId) {
  let wishIds = getWishIds();
  const idx = wishIds.indexOf(carId);

  if (idx !== -1) {
    wishIds.splice(idx, 1);
  } else {
    wishIds.push(carId);
  }

  localStorage.setItem("favorites", JSON.stringify(wishIds));
  renderWishList();
  renderRecentList();
}

function removeCustom(carId) {
  if (confirm("삭제하시겠습니까?")) {
    localStorage.removeItem("configureExterior:" + carId);
    renderCustomList();
  }
}

function removeRequest(index) {
  let requests = getRequests();
  requests.splice(index, 1);
  localStorage.setItem("requests", JSON.stringify(requests));
  alert("문의 내역이 삭제되었습니다.");
  renderRequestList();
}

clearAllBtn.addEventListener("click", () => {
  const wishIds = getWishIds();
  if (wishIds.length === 0) {
    alert("삭제할 관심차량이 없습니다.");
    return;
  }

  if (confirm("관심차량 목록을 모두 삭제하시겠습니까?")) {
    localStorage.removeItem("favorites");
    renderWishList();
    renderRecentList();
  }
});

clearCustomBtn.addEventListener("click", () => {
  let hasCustom = false;
  for (let i = 0; i < allCars.length; i++) {
    if (localStorage.getItem("configureExterior:" + allCars[i].id) !== null) {
      hasCustom = true;
      break;
    }
  }

  if (!hasCustom) {
    alert("삭제할 커스터마이징 내역이 없습니다.");
    return;
  }

  if (confirm("내 차량 만들기 저장 내역을 모두 삭제하시겠습니까?")) {
    for (let i = 0; i < allCars.length; i++) {
      localStorage.removeItem("configureExterior:" + allCars[i].id);
    }
    renderCustomList();
  }
});

clearRecentBtn.addEventListener("click", () => {
  const recentIds = getRecentIds();
  if (recentIds.length === 0) {
    alert("삭제할 최근 본 차량이 없습니다.");
    return;
  }

  if (confirm("최근 본 차량 목록을 모두 삭제하시겠습니까?")) {
    localStorage.removeItem(getRecentKey());
    renderRecentList();
  }
});

clearRequestsBtn.addEventListener("click", () => {
  const requests = getRequests();
  if (requests.length === 0) {
    alert("삭제할 문의 내역이 없습니다.");
    return;
  }

  if (confirm("문의 내역을 모두 삭제하시겠습니까?")) {
    localStorage.removeItem("requests");
    renderRequestList();
  }
});

function renderWishList() {
  const wishIds = getWishIds();

  const wishedCars = allCars.filter(car => {
    return wishIds.indexOf(car.id) !== -1;
  });

  wishCountEl.innerText = wishedCars.length;

  if (wishedCars.length === 0) {
    wishListContainer.innerHTML = `
      <div class="empty-box">
        <p>저장된 관심차량이 없습니다.</p>
        <a href="9_Lamborguinea_models.html" class="btn">차량 탐색하러 가기</a>
      </div>
    `;
    return;
  }

  wishListContainer.innerHTML = wishedCars.map(car => {
    const customizeBtnHtml = (car.category !== "LIMITED")
      ? `<button type="button" class="btn-outline" onclick="goCustomize('${car.id}')">내 차량 만들기</button>`
      : "";

    return `
      <article class="card car-card">
        <button type="button" class="bookmark-btn" onclick="removeWish('${car.id}')">
          <img src="images/9_bookmark_filled.png" alt="관심차량 해제" class="bookmark-icon">
        </button>
        <img class="car-thumb" src="${car.heroImage}" alt="${car.name}">
        <div class="car-body">
          <span class="car-category">${car.category}</span>
          <h3>${car.name}</h3>
          <p class="car-slogan">${car.slogan}</p>
          <div class="car-actions">
            <button type="button" class="btn" onclick="goDetail('${car.id}')">모델 알아보기</button>
            ${customizeBtnHtml}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderCustomList() {
  const customItems = [];

  for (let i = 0; i < allCars.length; i++) {
    const car = allCars[i];
    const savedOptionId = localStorage.getItem("configureExterior:" + car.id);

    if (savedOptionId !== null && car.customization && car.customization.exterior) {
      const exteriorList = car.customization.exterior;
      for (let j = 0; j < exteriorList.length; j++) {
        if (exteriorList[j].id === savedOptionId) {
          customItems.push({
            car: car,
            option: exteriorList[j]
          });
          break;
        }
      }
    }
  }

  if (customItems.length === 0) {
    customListContainer.innerHTML = `
      <div class="empty-box">
        <p>저장된 커스터마이징 차량이 없습니다.</p>
        <a href="9_Lamborguinea_customize.html" class="btn">내 차량 만들러 가기</a>
      </div>
    `;
    return;
  }

  customListContainer.innerHTML = customItems.map(item => {
    const car = item.car;
    const option = item.option;
    const carImg = option.image ? option.image : car.heroImage;

    return `
      <article class="card car-card">
        <img class="car-thumb" src="${carImg}" alt="${car.name} ${option.name}">
        <div class="car-body">
          <span class="car-category">${car.category}</span>
          <h3>${car.name}</h3>
          <p class="custom-option">외장 색상: ${option.name}</p>
          <div class="car-actions">
            <a class="btn-outline" href="9_Lamborguinea_configure.html?id=${encodeURIComponent(car.id)}">색상 변경</a>
            <button type="button" class="btn-outline btn-remove" onclick="removeCustom('${car.id}')">삭제</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderRecentList() {
  const recentIds = getRecentIds().slice(0, 3);
  const wishIds = getWishIds();
  const recentCars = [];

  for (let i = 0; i < recentIds.length; i++) {
    for (let j = 0; j < allCars.length; j++) {
      if (allCars[j].id === recentIds[i]) {
        recentCars.push(allCars[j]);
        break;
      }
    }
  }

  if (recentCars.length === 0) {
    recentListContainer.innerHTML = `
      <div class="empty-box">
        <p>최근 본 차량이 없습니다.</p>
        <a href="9_Lamborguinea_models.html" class="btn">차량 둘러보러 가기</a>
      </div>
    `;
    return;
  }

  recentListContainer.innerHTML = recentCars.map(car => {
    const isWished = wishIds.indexOf(car.id) !== -1;
    const bookmarkSrc = isWished ? "images/9_bookmark_filled.png" : "images/9_bookmark.png";
    const bookmarkAlt = isWished ? "관심차량 해제" : "관심차량 추가";
    const customizeBtnHtml = (car.category !== "LIMITED")
      ? `<button type="button" class="btn-outline" onclick="goCustomize('${car.id}')">내 차량 만들기</button>`
      : "";

    return `
      <article class="card car-card">
        <button type="button" class="bookmark-btn" onclick="toggleWish('${car.id}')">
          <img src="${bookmarkSrc}" alt="${bookmarkAlt}" class="bookmark-icon">
        </button>
        <img class="car-thumb" src="${car.heroImage}" alt="${car.name}">
        <div class="car-body">
          <span class="car-category">${car.category}</span>
          <h3>${car.name}</h3>
          <p class="car-slogan">${car.slogan}</p>
          <div class="car-actions">
            <button type="button" class="btn" onclick="goDetail('${car.id}')">모델 알아보기</button>
            ${customizeBtnHtml}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderRequestList() {
  const requests = getRequests();
  requestCountEl.innerText = requests.length;

  if (requests.length === 0) {
    requestListContainer.innerHTML = `
      <div class="empty-box">
        <p>신청한 시승 및 구매 상담 문의 내역이 없습니다.</p>
      </div>
    `;
    return;
  }

  let html = "";
  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    const memoText = req.memo === "" ? "없음" : req.memo;

    html += `
      <article class="request-card">
        <div>
          <span class="request-badge">${req.type}</span>
          <h3>${req.carName}</h3>
          <p class="request-meta">신청자: ${req.name} | 연락처: ${req.phone} | 희망 날짜: ${req.date} (신청일: ${req.createdAt})</p>
          <p class="request-memo">문의 내용: ${memoText}</p>
        </div>
        <button type="button" class="btn-outline btn-remove" onclick="removeRequest(${i})">삭제</button>
      </article>
    `;
  }
  requestListContainer.innerHTML = html;
}
let allCars = [];

const wishListContainer = document.getElementById("wishListContainer");
const wishCountEl = document.getElementById("wishCount");
const clearAllBtn = document.getElementById("clearAllBtn");

const recentListContainer = document.getElementById("recentListContainer");
const clearRecentBtn = document.getElementById("clearRecentBtn");

const requestListContainer = document.getElementById("requestListContainer");
const requestCountEl = document.getElementById("requestCount");
const clearRequestsBtn = document.getElementById("clearRequestsBtn");

fetch("cars.json")
  .then(response => response.json())
  .then(data => {
    allCars = data;
    renderWishList();
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
  location.href = "detail.html";
}

function goCustomize(carId) {
  localStorage.setItem("selectedCar", carId);
  location.href = "configure.html";
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
        <a href="models.html" class="btn">차량 탐색하러 가기</a>
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
        <a href="models.html" class="btn">차량 둘러보러 가기</a>
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
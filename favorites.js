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
  if (recentIds.length > 6) {
    recentIds = recentIds.slice(0, 6);
  }
  localStorage.setItem(key, JSON.stringify(recentIds));
}

function goDetail(carId) {
  addRecentCar(carId);
  localStorage.setItem("selectedCar", carId);
  location.href = "detail.html";
}

function removeWish(carId) {
  let wishIds = getWishIds();
  const idx = wishIds.indexOf(carId);

  if (idx !== -1) {
    wishIds.splice(idx, 1);
    localStorage.setItem("favorites", JSON.stringify(wishIds));
    alert("관심차량에서 삭제되었습니다.");
    renderWishList();
  }
}

function removeRecent(carId) {
  const key = getRecentKey();
  let recentIds = getRecentIds();
  const idx = recentIds.indexOf(carId);

  if (idx !== -1) {
    recentIds.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(recentIds));
    renderRecentList();
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
    return `
      <article class="card car-card">
        <img class="car-thumb" src="${car.heroImage}" alt="${car.name}">
        <div class="car-body">
          <span class="car-category">${car.category}</span>
          <h3>${car.name}</h3>
          <p class="car-slogan">${car.slogan}</p>
          <div class="car-actions">
            <button type="button" class="btn" onclick="goDetail('${car.id}')">상세보기</button>
            <button type="button" class="btn-outline btn-remove" onclick="removeWish('${car.id}')">삭제</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderRecentList() {
  const recentIds = getRecentIds();
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
    return `
      <article class="card car-card">
        <img class="car-thumb" src="${car.heroImage}" alt="${car.name}">
        <div class="car-body">
          <span class="car-category">${car.category}</span>
          <h3>${car.name}</h3>
          <p class="car-slogan">${car.slogan}</p>
          <div class="car-actions">
            <button type="button" class="btn" onclick="goDetail('${car.id}')">상세보기</button>
            <button type="button" class="btn-outline btn-remove" onclick="removeRecent('${car.id}')">삭제</button>
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
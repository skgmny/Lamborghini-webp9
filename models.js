let allCars = [];
let selectedCategory = "전체";
let currentPage = 1;
const perPage = 6;

const carListEl = document.getElementById("carList");
const carCountEl = document.getElementById("carCount");
const paginationEl = document.getElementById("pagination");
const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.querySelectorAll("#categoryGroup .select-item");

const popularOrder = [
  "revuelto",
  "temerario",
  "urus-se",
  "revuelto-sv",
  "temerario-spyder",
  "urus-se-performante",
  "fenomeno",
  "fenomeno-roadster",
  "countach-lpi-800-4",
  "sian-fkp-37",
  "sian-roadster",
  "sesto-elemento"
];

function applyCategoryFromUrl() {
  const query = location.search;
  if (query === "?category=sports-car") {
    selectedCategory = "SPORTS CAR";
  } else if (query === "?category=suv") {
    selectedCategory = "SUV";
  } else if (query === "?category=limited") {
    selectedCategory = "LIMITED";
  }

  for (let i = 0; i < categoryButtons.length; i++) {
    if (categoryButtons[i].innerText === selectedCategory) {
      categoryButtons[i].className = "select-item active";
    } else {
      categoryButtons[i].className = "select-item";
    }
  }
}

applyCategoryFromUrl();

fetch("cars.json")
  .then(response => {
    return response.json();
  })
  .then(data => {
    allCars = data;
    renderCars();
  })
  .catch(error => {
    console.error("데이터 불러오기 실패:", error);
  });

for (let i = 0; i < categoryButtons.length; i++) {
  categoryButtons[i].addEventListener("click", function () {
    for (let j = 0; j < categoryButtons.length; j++) {
      categoryButtons[j].className = "select-item";
    }
    this.className = "select-item active";
    selectedCategory = this.innerText;
    currentPage = 1;
    renderCars();
  });
}

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  renderCars();
});

function getWishList() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function addRecentCar(carId) {
  let recentIds = JSON.parse(localStorage.getItem("recentCars")) || [];
  const idx = recentIds.indexOf(carId);
  if (idx !== -1) {
    recentIds.splice(idx, 1);
  }
  recentIds.unshift(carId);
  if (recentIds.length > 3) {
    recentIds = recentIds.slice(0, 3);
  }
  localStorage.setItem("recentCars", JSON.stringify(recentIds));
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

function toggleWish(carId) {
  let wishList = getWishList();
  let newWishList = [];
  let found = false;

  for (let i = 0; i < wishList.length; i++) {
    if (wishList[i] === carId) {
      found = true;
    } else {
      newWishList.push(wishList[i]);
    }
  }

  if (found) {
    alert("관심차량에서 해제되었습니다.");
  } else {
    newWishList.push(carId);
    alert("관심차량에 추가되었습니다.");
  }

  localStorage.setItem("favorites", JSON.stringify(newWishList));
  renderCars();
}

function getZeroToHundred(car) {
  for (let i = 0; i < car.stats.length; i++) {
    if (car.stats[i].label === "0-100km/h") {
      return parseFloat(car.stats[i].value);
    }
  }
  return 999;
}

function getPopularRank(carId) {
  for (let i = 0; i < popularOrder.length; i++) {
    if (popularOrder[i] === carId) {
      return i;
    }
  }
  return 999;
}

function changePage(pageNum) {
  currentPage = pageNum;
  renderCars();
}

function renderCars() {
  const sortType = sortSelect.value;
  const wishList = getWishList();

  let filtered = allCars.filter(car => {
    return (selectedCategory === "전체") || (car.category === selectedCategory);
  });

  if (sortType === "popular") {
    for (let i = 0; i < filtered.length - 1; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        if (getPopularRank(filtered[i].id) > getPopularRank(filtered[j].id)) {
          let temp = filtered[i];
          filtered[i] = filtered[j];
          filtered[j] = temp;
        }
      }
    }
  } else if (sortType === "speedAsc") {
    for (let i = 0; i < filtered.length - 1; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        if (getZeroToHundred(filtered[i]) > getZeroToHundred(filtered[j])) {
          let temp = filtered[i];
          filtered[i] = filtered[j];
          filtered[j] = temp;
        }
      }
    }
  }

  carCountEl.innerText = filtered.length;

  if (filtered.length === 0) {
    carListEl.innerHTML = "<p>조건에 맞는 차량이 없습니다.</p>";
    paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  if (currentPage > totalPages) {
    currentPage = 1;
  }
  const startIdx = (currentPage - 1) * perPage;
  const pageCars = filtered.slice(startIdx, startIdx + perPage);

  carListEl.innerHTML = pageCars.map(car => {
    let isWished = false;
    for (let w = 0; w < wishList.length; w++) {
      if (wishList[w] === car.id) {
        isWished = true;
      }
    }

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

  if (totalPages > 1) {
    let pageHtml = "";
    for (let p = 1; p <= totalPages; p++) {
      const activeClass = (p === currentPage) ? "active" : "";
      pageHtml += `<button type="button" class="page-btn ${activeClass}" onclick="changePage(${p})">${p}</button>`;
    }
    paginationEl.innerHTML = pageHtml;
  } else {
    paginationEl.innerHTML = "";
  }
}
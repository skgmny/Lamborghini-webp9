let allCars = [];
let selectedCategory = "전체";

const carListEl = document.getElementById("carList");
const carCountEl = document.getElementById("carCount");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.querySelectorAll("#categoryGroup .select-item");

fetch("cars.json")
  .then(response => response.json())
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
    renderCars();
  });
}

searchInput.addEventListener("keyup", () => {
  renderCars();
});

sortSelect.addEventListener("change", () => {
  renderCars();
});

function getWishList() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function goDetail(carId) {
  localStorage.setItem("selectedCar", carId);
  location.href = "detail.html";
}

function toggleWish(carId) {
  let wishList = getWishList();
  const idx = wishList.indexOf(carId);

  if (idx === -1) {
    wishList.push(carId);
    alert("관심차량에 추가되었습니다.");
  } else {
    wishList.splice(idx, 1);
    alert("관심차량에서 해제되었습니다.");
  }

  localStorage.setItem("favorites", JSON.stringify(wishList));
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

function renderCars() {
  const keyword = searchInput.value.toLowerCase();
  const sortType = sortSelect.value;
  const wishList = getWishList();

  let filtered = allCars.filter(car => {
    const matchCategory = (selectedCategory === "전체") || (car.category === selectedCategory);
    const matchKeyword = car.name.toLowerCase().indexOf(keyword) !== -1 ||
                         car.slogan.toLowerCase().indexOf(keyword) !== -1;
    return matchCategory && matchKeyword;
  });

  if (sortType === "priceAsc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortType === "priceDesc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortType === "speedAsc") {
    filtered.sort((a, b) => getZeroToHundred(a) - getZeroToHundred(b));
  }

  carCountEl.innerText = filtered.length;

  if (filtered.length === 0) {
    carListEl.innerHTML = "<p>조건에 맞는 차량이 없습니다.</p>";
    return;
  }

  carListEl.innerHTML = filtered.map(car => {
    const isWished = wishList.indexOf(car.id) !== -1;
    const priceText = car.price === 0 ? "가격 문의" : (car.price / 100000000) + "억 원부터";

    let statsHtml = "";
    for (let i = 0; i < car.stats.length; i++) {
      statsHtml += `
        <div class="car-stat-item">
          <div class="car-stat-value">${car.stats[i].value} <small>${car.stats[i].unit}</small></div>
          <div class="car-stat-label">${car.stats[i].label}</div>
        </div>
      `;
    }

    return `
      <article class="card car-card">
        <img class="car-thumb" src="${car.heroImage}" alt="${car.name}">
        <div class="car-body">
          <span class="car-category">${car.category}</span>
          <h3>${car.name}</h3>
          <p class="car-slogan">${car.slogan}</p>
          <div class="car-stats">${statsHtml}</div>
          <p class="car-price">${priceText}</p>
          <div class="car-actions">
            <button type="button" class="btn" onclick="goDetail('${car.id}')">상세보기</button>
            <button type="button" class="btn-outline ${isWished ? "wished" : ""}" onclick="toggleWish('${car.id}')">
              ${isWished ? "♥ 찜완료" : "♡ 관심차량"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}
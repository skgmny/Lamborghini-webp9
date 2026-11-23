/* =====================================
   SHOWROOM MAIN PAGE JAVASCRIPT
===================================== */


/* =====================================
   01. INTRO SCROLL ANIMATION
===================================== */

const introSection = document.querySelector(".intro-section");
const introCar = document.querySelector(".intro-car");

const titleLeft = document.querySelector(".title-left");
const titleRight = document.querySelector(".title-right");

const introCopyLeft = document.querySelector(".intro-copy-left");
const introCopyRight = document.querySelector(".intro-copy-right");

const scrollGuide = document.querySelector(".scroll-guide");

let ticking = false;


function updateIntroAnimation() {

    if (!introSection) return;

    const rect = introSection.getBoundingClientRect();

    // 스크롤 가능한 전체 길이
    const scrollRange = introSection.offsetHeight - window.innerHeight;

    if (scrollRange <= 0) return;

    // 스크롤 진행률 계산
    let progress = -rect.top / scrollRange;

    progress = Math.max(0, Math.min(1, progress));


    // 부드러운 애니메이션 곡선
    const ease = progress * progress * (3 - 2 * progress);


    /* ---------------------------------
       1. 자동차 애니메이션
    --------------------------------- */

    if (introCar) {

        // 자동차가 아래에서 위로 천천히 올라오는 효과
        const carY = 48 - progress * 75;

        // 자동차 크기
        const carScale = 1.05 + progress * 0.12;

        introCar.style.transform =
            `translateY(${carY}vh) scale(${carScale})`;

        // 자동차는 사라지지 않도록 유지
        introCar.style.opacity = 1;

    }


    /* ---------------------------------
       2. DRIVE / BRAND 글자 분리
    --------------------------------- */

    const titleDistance =
        window.innerWidth <= 600 ? 22 :
        window.innerWidth <= 900 ? 25 : 28;

    const titleMove = ease * titleDistance;

    if (titleLeft) {

        titleLeft.style.transform =
            `translateX(-${titleMove}vw)`;

    }

    if (titleRight) {

        titleRight.style.transform =
            `translateX(${titleMove}vw)`;

    }


    /* ---------------------------------
       3. 좌우 설명 문구 등장
    --------------------------------- */

    let copyOpacity = Math.min(1, Math.max(0, (progress - 0.15) / 0.25));

    if (introCopyLeft) {

        introCopyLeft.style.opacity = copyOpacity;

    }

    if (introCopyRight) {

        introCopyRight.style.opacity = copyOpacity;

    }


    /* ---------------------------------
       4. 스크롤 안내 문구
    --------------------------------- */

    if (scrollGuide) {

        scrollGuide.style.opacity =
            Math.max(0, 1 - progress * 5);

    }

}


// 스크롤 이벤트
window.addEventListener("scroll", () => {

    if (!ticking) {

        window.requestAnimationFrame(() => {

            updateIntroAnimation();

            ticking = false;

        });

        ticking = true;

    }

}, { passive: true });


// 페이지 최초 실행
window.addEventListener("load", updateIntroAnimation);

window.addEventListener("resize", updateIntroAnimation);




/* =====================================
   02. FEATURED MODEL SLIDER
===================================== */

// 주요 차종 및 세부 시리즈 데이터
// 실제 차량 이미지와 내용이 확정되면 수정하면 됨

const models = [

    {
        name: "TEMERARIO",
        slogan: "UNFILTED PERFORMANCE",
        description: "새로운 시대를 여는 강렬한 퍼포먼스",

        series: [

            {
                name: "TEMERARIO SPYDER",
                image: "car2.png"
            },

            {
                name: "TEMERARIO TETTONERO CAPSULE",
                image: "car2.png"
            },

            {
                name: "TEMERARIO",
                image: "car2.png"
            }

        ]

    },

    {
        name: "REVUELTO",
        slogan: "THE QUANTUM OF DRIVING",
        description: "강렬한 성능과 혁신적인 디자인",

        series: [

            {
                name: "REVUELTO SV",
                image: "car2.png"
            },

            {
                name: "REVUELTO MIURA 60° HOMAGE",
                image: "car2.png"
            },

            {
                name: "REVUELTO",
                image: "car2.png"
            }

        ]

    },

    {
        name: "URUS",
        slogan: "URUS AT ITS PEAK",
        description: "일상과 퍼포먼스의 새로운 조화",

        series: [

            {
                name: "URUS SE",
                image: "car2.png"
            },

            {
                name: "URUS SE AD PERSONAM",
                image: "car2.png"
            },

            {
                name: "URUS SE SPECIAL EDITION",
                image: "car2.png"
            }

        ]

    }

];


// 현재 선택된 주요 차종
let currentModel = 0;

// 현재 선택된 세부 시리즈
let currentSeries = 0;


// HTML 요소 가져오기
const modelName = document.getElementById("modelName");

const modelSlogan = document.getElementById("modelSlogan");

const modelImage = document.getElementById("modelImage");

const modelTabs = document.querySelectorAll(".model-tab");

const prevButton = document.getElementById("prevModel");

const nextButton = document.getElementById("nextModel");




// 세부 시리즈 버튼 변경 함수
function updateSeriesTabs() {

    const selectedModel = models[currentModel];

    modelTabs.forEach((tab, i) => {

        const series = selectedModel.series[i];

        if (series) {

            tab.textContent = series.name;

            tab.dataset.index = i;

            tab.style.display = "";

            tab.classList.toggle("active", i === currentSeries);

            tab.setAttribute(
                "aria-pressed",
                i === currentSeries ? "true" : "false"
            );

        } else {

            tab.style.display = "none";

        }

    });

}




// 세부 시리즈 변경 함수
function changeSeries(index) {

    const selectedModel = models[currentModel];

    // 시리즈 인덱스 범위 확인
    if (index < 0 || index >= selectedModel.series.length) return;

    currentSeries = index;

    const selectedSeries = selectedModel.series[currentSeries];


    // 차량 이미지 변경
    if (modelImage) {

        modelImage.style.opacity = 0;

        setTimeout(() => {

            modelImage.src = selectedSeries.image;

            modelImage.alt = selectedSeries.name;

            modelImage.style.opacity = 1;

        }, 200);

    }


    // 선택된 시리즈 버튼 표시
    updateSeriesTabs();


    // 마지막으로 선택한 시리즈 저장
    localStorage.setItem("selectedSeries", currentSeries);

}




// 주요 차종 변경 함수
function changeModel(index) {

    // 주요 차종 인덱스 순환
    currentModel = (index + models.length) % models.length;

    // 차종 변경 시 첫 번째 시리즈 선택
    currentSeries = 0;

    const selectedModel = models[currentModel];


    // 주요 차종 이름 변경
    if (modelName) {

        modelName.textContent = selectedModel.name;

    }


    // 주요 차종 슬로건 변경
    if (modelSlogan) {

        modelSlogan.textContent = selectedModel.slogan;

    }


    // 해당 차종의 세부 시리즈 버튼 변경
    updateSeriesTabs();


    // 첫 번째 시리즈 차량 이미지 표시
    changeSeries(0);


    // 마지막으로 선택한 주요 차종 저장
    localStorage.setItem("selectedModel", currentModel);

}




// 이전 주요 차종 버튼
if (prevButton) {

    prevButton.addEventListener("click", () => {

        changeModel(currentModel - 1);

    });

}


// 다음 주요 차종 버튼
if (nextButton) {

    nextButton.addEventListener("click", () => {

        changeModel(currentModel + 1);

    });

}




// 하단 세부 시리즈 버튼 클릭
modelTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        const index = Number(tab.dataset.index);

        changeSeries(index);

    });

});




// 저장된 주요 차종 불러오기
const savedModel = localStorage.getItem("selectedModel");

const savedSeries = localStorage.getItem("selectedSeries");


if (
    savedModel !== null &&
    Number(savedModel) >= 0 &&
    Number(savedModel) < models.length
) {

    currentModel = Number(savedModel);

} else {

    currentModel = 0;

}


// 저장된 세부 시리즈 불러오기
if (
    savedSeries !== null &&
    Number(savedSeries) >= 0 &&
    Number(savedSeries) < models[currentModel].series.length
) {

    currentSeries = Number(savedSeries);

} else {

    currentSeries = 0;

}


// 초기 화면 설정
changeModel(currentModel);

// 저장된 세부 시리즈가 있다면 해당 시리즈 표시
if (currentSeries !== 0) {

    changeSeries(currentSeries);

}




/* =====================================
   03. CARS.JSON FETCH
===================================== */

// 차량 데이터 파일 불러오기

async function loadCarData() {

    try {

        const response = await fetch("cars.json");

        if (!response.ok) {

            throw new Error("차량 데이터를 불러오지 못했습니다.");

        }

        const carData = await response.json();

        console.log("차량 데이터 불러오기 성공:", carData);


        // JSON에서 TEMERARIO 정보 찾기
        const temerario = carData.find(
            car => car.id === "temerario"
        );


        if (temerario) {

            // JSON의 슬로건을 첫 번째 모델에 적용
            models[0].slogan = temerario.slogan;

            if (currentModel === 0 && modelSlogan) {

                modelSlogan.textContent = temerario.slogan;

            }

        }

    } catch (error) {

        console.log("JSON 데이터 확인:", error.message);

    }

}


// 차량 데이터 실행
loadCarData();




/* =====================================
   04. CURATION CARD ANIMATION
===================================== */

// 화면에 카드가 나타날 때 자연스럽게 등장

const curationCards = document.querySelectorAll(".curation-card");


if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.15

    });


    curationCards.forEach((card) => {

        card.classList.add("reveal");

        observer.observe(card);

    });

} else {

    curationCards.forEach((card) => {

        card.classList.add("show");

    });

}
const introSection = document.querySelector(".intro-section");
const introCar = document.querySelector(".intro-car");
const titleLeft = document.querySelector(".title-left");
const titleRight = document.querySelector(".title-right");
const introCopyLeft = document.querySelector(".intro-copy-left");
const introCopyRight = document.querySelector(".intro-copy-right");
const scrollGuide = document.querySelector(".scroll-guide");

function updateIntroAnimation() {
    const scrollRange = introSection.offsetHeight - window.innerHeight;
    if (scrollRange <= 0) return;

    let progress = -introSection.getBoundingClientRect().top / scrollRange;
    progress = Math.max(0, Math.min(1, progress));

    const ease = progress * progress * (3 - 2 * progress);

    const carY = 48 - progress * 75;
    const carScale = 1.05 + progress * 0.12;
    introCar.style.transform = `translateY(${carY}vh) scale(${carScale})`;

    let titleDistance = 28;
    if (window.innerWidth <= 600) {
        titleDistance = 22;
    } else if (window.innerWidth <= 900) {
        titleDistance = 25;
    }
    titleLeft.style.transform = `translateX(-${ease * titleDistance}vw)`;
    titleRight.style.transform = `translateX(${ease * titleDistance}vw)`;

    let copyOpacity = (progress - 0.15) / 0.25;
    copyOpacity = Math.max(0, Math.min(1, copyOpacity));
    introCopyLeft.style.opacity = copyOpacity;
    introCopyRight.style.opacity = copyOpacity;

    scrollGuide.style.opacity = Math.max(0, 1 - progress * 5);
}

window.addEventListener("scroll", updateIntroAnimation);
window.addEventListener("load", updateIntroAnimation);
window.addEventListener("resize", updateIntroAnimation);

const models = [
    {
        name: "TEMERARIO",
        slogan: "YOU CAN'T HIDE WHO YOU ARE",
        mainCarId: "temerario", 
        series: [
            { id: "temerario-spyder", name: "TEMERARIO SPYDER", image: "images/temerario/9_temerario1.png" },
            { id: "temerario", name: "TEMERARIO", image: "images/temerario/9_temerario3.png" }
        ]
    },
    {
        name: "REVUELTO",
        slogan: "THE QUANTUM OF DRIVING",
        mainCarId: "revuelto-sv",
        series: [
            { id: "revuelto-sv", name: "REVUELTO SV", image: "images/revuelto/9_revuelto2.png" },
            { id: "revuelto", name: "REVUELTO", image: "images/revuelto/9_revuelto1.png" }
        ]
    },
    {
        name: "URUS",
        slogan: "URUS AT ITS PEAK",
        mainCarId: "urus-se-performante",
        series: [
            { id: "urus-se-performante", name: "URUS SE PERFORMANTE", image: "images/urus/9_urus1.png" },
            { id: "urus-se", name: "URUS SE", image: "images/urus/9_urus2.png" }
        ]
    }
];

const modelName = document.getElementById("modelName");
const modelSlogan = document.getElementById("modelSlogan");
const modelImage = document.getElementById("modelImage");
const modelTabs = document.querySelectorAll(".model-tab");
const prevButton = document.getElementById("prevModel");
const nextButton = document.getElementById("nextModel");
const modelDetailButton = document.querySelector(".model-btn-yellow");
const modelConfigureButton = document.querySelector(".model-btn-outline");


let currentModel = Number(localStorage.getItem("selectedModel")) || 0;
let currentSeries = Number(localStorage.getItem("selectedSeries")) || 0;

if (!models[currentModel] || !models[currentModel].series[currentSeries]) {
    currentModel = 0;
    currentSeries = 0;
}

function showCar() {
    const model = models[currentModel];
    const series = model.series[currentSeries];

    modelName.textContent = model.name;
    modelSlogan.textContent = model.slogan;

    modelTabs.forEach((tab, i) => {
        if (model.series[i]) {
            tab.textContent = model.series[i].name;
            tab.style.display = "";
            tab.classList.toggle("active", i === currentSeries);
            tab.setAttribute("aria-pressed", i === currentSeries);   // 스크린리더용: 선택된 탭 알려주기
        } else {
            tab.style.display = "none";
        }
    });

    modelImage.style.opacity = 0;
    setTimeout(() => {
        modelImage.src = series.image;
        modelImage.alt = series.name;
        modelImage.style.opacity = 1;
    }, 200);

    modelDetailButton.href = `9_Lamborguinea_details.html?id=${series.id}`;
    modelConfigureButton.href = `9_Lamborguinea_configure.html?id=${series.id}`;

    localStorage.setItem("selectedModel", currentModel);
    localStorage.setItem("selectedSeries", currentSeries);
}

function changeModel(index) {
    currentModel = (index + models.length) % models.length;
    currentSeries = 0;
    showCar();
}

prevButton.addEventListener("click", () => {
    changeModel(currentModel - 1);
});

nextButton.addEventListener("click", () => {
    changeModel(currentModel + 1);
});

modelTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
        currentSeries = i;
        showCar();
    });
});

showCar();

async function loadSlogans() {
    try {
        const response = await fetch("9_Lamborguinea_cars.json");
        const cars = await response.json();

        models.forEach((model) => {
            const car = cars.find((c) => c.id === model.mainCarId);
            if (car) {
                model.slogan = car.slogan;
            }
        });

        modelSlogan.textContent = models[currentModel].slogan;
    } catch (error) {
        console.log("JSON 데이터를 불러오지 못했습니다:", error);
    }
}

loadSlogans();


const curationCards = document.querySelectorAll(".curation-card");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

curationCards.forEach((card) => {
    card.classList.add("reveal");
    observer.observe(card);
});

const mainOpenRequest = document.getElementById("mainOpenRequest");
const mainRequestModal = document.getElementById("mainRequestModal");
const mainRequestClose = document.getElementById("mainRequestClose");
const mainRequestForm = document.getElementById("mainRequestForm");
const mainRequestCar = document.getElementById("mainRequestCar");
const mainRequestMessage = document.getElementById("mainRequestMessage");

function openRequestModal() {
    const series = models[currentModel].series[currentSeries];
    mainRequestCar.textContent = series.name;
    mainRequestMessage.textContent = "";
    mainRequestModal.classList.add("show");
    mainRequestModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; 
}

function closeRequestModal() {
    mainRequestModal.classList.remove("show");
    mainRequestModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

mainOpenRequest.addEventListener("click", (event) => {
    event.preventDefault(); 
    openRequestModal();
});

mainRequestClose.addEventListener("click", closeRequestModal);

mainRequestModal.addEventListener("click", (event) => {
    if (event.target === mainRequestModal) {
        closeRequestModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeRequestModal();
    }
});

mainRequestForm.addEventListener("submit", (event) => {
    event.preventDefault(); 

    const name = document.getElementById("mainReqName").value.trim();
    const phone = document.getElementById("mainReqPhone").value.trim();
    const date = document.getElementById("mainReqDate").value;
    const memo = document.getElementById("mainReqMemo").value.trim();
    const agree = document.getElementById("mainReqAgree").checked;
    const type = mainRequestForm.querySelector('input[name="mainRequestType"]:checked').value;

    mainRequestMessage.style.color = "#c43d3d";

    if (name === "") {
        mainRequestMessage.textContent = "이름을 입력해 주세요.";
        return;
    }

    if (phone === "") {
        mainRequestMessage.textContent = "연락처를 입력해 주세요.";
        return;
    }

    if (date === "") {
        mainRequestMessage.textContent = "희망 날짜를 선택해 주세요.";
        return;
    }

    if (!agree) {
        mainRequestMessage.textContent = "개인정보 수집 및 이용에 동의해 주세요.";
        return;
    }

    const series = models[currentModel].series[currentSeries];

    const now = new Date();
    const createdAt = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();

    let requests = [];
    try {
        requests = JSON.parse(localStorage.getItem("requests")) || [];
    } catch (error) {
        mainRequestMessage.textContent = "기존 문의 내역을 읽지 못해 저장할 수 없습니다.";
        return;
    }

    requests.push({
        carId: series.id,
        carName: series.name,
        type: type,
        name: name,
        phone: phone,
        date: date,
        memo: memo,
        createdAt: createdAt
    });

    localStorage.setItem("requests", JSON.stringify(requests));

    mainRequestMessage.style.color = "#987000";
    mainRequestMessage.textContent = "신청이 완료되었습니다. MY GARAGE에서 확인할 수 있어요.";

    mainRequestForm.reset();
});
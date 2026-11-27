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

    const scrollRange = introSection.offsetHeight - window.innerHeight;

    if (scrollRange <= 0) return;

    let progress = -rect.top / scrollRange;

    progress = Math.max(0, Math.min(1, progress));

    const ease = progress * progress * (3 - 2 * progress);

    if (introCar) {

        const carY = 48 - progress * 75;

        const carScale = 1.05 + progress * 0.12;

        introCar.style.transform =
            `translateY(${carY}vh) scale(${carScale})`;

        introCar.style.opacity = 1;

    }

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

    let copyOpacity = Math.min(1, Math.max(0, (progress - 0.15) / 0.25));

    if (introCopyLeft) {

        introCopyLeft.style.opacity = copyOpacity;

    }

    if (introCopyRight) {

        introCopyRight.style.opacity = copyOpacity;

    }

    if (scrollGuide) {

        scrollGuide.style.opacity =
            Math.max(0, 1 - progress * 5);

    }

}

window.addEventListener("scroll", () => {

    if (!ticking) {

        window.requestAnimationFrame(() => {

            updateIntroAnimation();

            ticking = false;

        });

        ticking = true;

    }

}, { passive: true });

window.addEventListener("load", updateIntroAnimation);

window.addEventListener("resize", updateIntroAnimation);

const models = [

    {
        name: "TEMERARIO",
        slogan: "YOU CAN'T HIDE WHO YOU ARE",

        series: [

            {
                id: "temerario-spyder",
                name: "TEMERARIO SPYDER",
                image: "images/temerario/9_temerario1.png"
            },

            {
                id: "temerario",
                name: "TEMERARIO",
                image: "images/temerario/9_temerario3.png"
            }

        ]

    },

    {
        name: "REVUELTO",
        slogan: "THE QUANTUM OF DRIVING",

        series: [

            {
                id: "revuelto-sv",
                name: "REVUELTO SV",
                image: "images/revuelto/9_revuelto2.png"
            },

            {
                id: "revuelto",
                name: "REVUELTO",
                image: "images/revuelto/9_revuelto1.png"
            }

        ]

    },

    {
        name: "URUS",
        slogan: "URUS AT ITS PEAK",

        series: [

            {
                id: "urus-se-performante",
                name: "URUS SE PERFORMANTE",
                image: "images/urus/9_urus1.png"
            },

            {
                id: "urus-se",
                name: "URUS SE",
                image: "images/urus/9_urus2.png"
            },

        ]

    }

];

let currentModel = 0;

let currentSeries = 0;

const modelName = document.getElementById("modelName");

const modelSlogan = document.getElementById("modelSlogan");

const modelImage = document.getElementById("modelImage");

const modelTabs = document.querySelectorAll(".model-tab");

const prevButton = document.getElementById("prevModel");

const nextButton = document.getElementById("nextModel");

const modelDetailButton = document.querySelector(".model-btn-yellow");

const modelConfigureButton = document.querySelector(".model-btn-outline");

function getSelectedSeries() {

    return models[currentModel].series[currentSeries];

}

function updateModelActionLinks() {

    const selectedSeries = getSelectedSeries();

    if (!selectedSeries) return;

    const carId = selectedSeries.id;

    if (modelDetailButton) {

        modelDetailButton.href = `9_Lamborguinea_details.html?id=${carId}`;

    }

    if (modelConfigureButton) {

        modelConfigureButton.href = `9_Lamborguinea_configure.html?id=${carId}`;

    }

}

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

function changeSeries(index) {

    const selectedModel = models[currentModel];

    if (index < 0 || index >= selectedModel.series.length) return;

    currentSeries = index;

    const selectedSeries = selectedModel.series[currentSeries];

    if (modelImage) {

        modelImage.style.opacity = 0;

        setTimeout(() => {

            modelImage.src = selectedSeries.image;

            modelImage.alt = selectedSeries.name;

            modelImage.style.opacity = 1;

        }, 200);

    }


    updateSeriesTabs();

    updateModelActionLinks();

    localStorage.setItem("selectedSeries", currentSeries);

}

function changeModel(index) {

    currentModel = (index + models.length) % models.length;

    currentSeries = 0;

    const selectedModel = models[currentModel];

    if (modelName) {

        modelName.textContent = selectedModel.name;

    }

    if (modelSlogan) {

        modelSlogan.textContent = selectedModel.slogan;

    }

    updateSeriesTabs();

    changeSeries(0);

    localStorage.setItem("selectedModel", currentModel);

}

if (prevButton) {

    prevButton.addEventListener("click", () => {

        changeModel(currentModel - 1);

    });

}

if (nextButton) {

    nextButton.addEventListener("click", () => {

        changeModel(currentModel + 1);

    });

}

modelTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        const index = Number(tab.dataset.index);

        changeSeries(index);

    });

});

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

if (
    savedSeries !== null &&
    Number(savedSeries) >= 0 &&
    Number(savedSeries) < models[currentModel].series.length
) {

    currentSeries = Number(savedSeries);

} else {

    currentSeries = 0;

}

changeModel(currentModel);

if (currentSeries !== 0) {

    changeSeries(currentSeries);

}

async function loadCarData() {

    try {

        const response = await fetch("9_Lamborguinea_cars.json");

        if (!response.ok) {

            throw new Error("차량 데이터를 불러오지 못했습니다.");

        }

        const carData = await response.json();

        console.log("차량 데이터 불러오기 성공:", carData);

        const temerario = carData.find(
            car => car.id === "temerario"
        );


        if (temerario) {

            models[0].slogan = temerario.slogan;

            if (currentModel === 0 && modelSlogan) {

                modelSlogan.textContent = temerario.slogan;

            }

        }

    } catch (error) {

        console.log("JSON 데이터 확인:", error.message);

    }

}

loadCarData();

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

const mainOpenRequest = document.getElementById("mainOpenRequest");

const mainRequestModal = document.getElementById("mainRequestModal");

const mainRequestClose = document.getElementById("mainRequestClose");

const mainRequestForm = document.getElementById("mainRequestForm");

const mainRequestCar = document.getElementById("mainRequestCar");

const mainRequestMessage = document.getElementById("mainRequestMessage");

function getMainRequestCarInfo() {

    const selectedSeries = getSelectedSeries();

    return {

        id: selectedSeries.id,

        name: selectedSeries.name

    };

}

if (mainOpenRequest && mainRequestModal) {

    mainOpenRequest.addEventListener("click", (event) => {

        event.preventDefault();

        const selectedCar = getMainRequestCarInfo();

        mainRequestCar.textContent = selectedCar.name;

        mainRequestMessage.textContent = "";

        mainRequestMessage.style.color = "#c43d3d";

        mainRequestModal.classList.add("show");

        mainRequestModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

    });

}

function closeMainRequestModal() {

    if (!mainRequestModal) return;

    mainRequestModal.classList.remove("show");

    mainRequestModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


if (mainRequestClose) {

    mainRequestClose.addEventListener("click", closeMainRequestModal);

}


if (mainRequestModal) {

    mainRequestModal.addEventListener("click", (event) => {

        if (event.target === mainRequestModal) {

            closeMainRequestModal();

        }

    });

}


document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        mainRequestModal &&
        mainRequestModal.classList.contains("show")
    ) {

        closeMainRequestModal();

    }

});

if (mainRequestForm) {

    mainRequestForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = document.getElementById("mainReqName").value.trim();

        const phone = document.getElementById("mainReqPhone").value.trim();

        const date = document.getElementById("mainReqDate").value;

        const memo = document.getElementById("mainReqMemo").value.trim();

        const agree = document.getElementById("mainReqAgree").checked;

        const selectedType = mainRequestForm.querySelector(
            'input[name="mainRequestType"]:checked'
        );

        const type = selectedType ? selectedType.value : "시승";


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

        const selectedCar = getMainRequestCarInfo();

        const now = new Date();

        const createdAt =
            now.getFullYear() + "-" +
            (now.getMonth() + 1) + "-" +
            now.getDate();


        let requests = [];

        const savedRequests = localStorage.getItem("requests");


        if (savedRequests !== null) {

            try {

                requests = JSON.parse(savedRequests);

                if (!Array.isArray(requests)) requests = [];

            } catch (error) {

                console.error("문의 내역을 읽지 못했습니다:", error);

                mainRequestMessage.textContent =
                    "기존 문의 내역을 읽지 못해 저장할 수 없습니다.";

                return;

            }

        }


        requests.push({

            carId: selectedCar.id,

            carName: selectedCar.name,

            type: type,

            name: name,

            phone: phone,

            date: date,

            memo: memo,

            createdAt: createdAt

        });


        localStorage.setItem("requests", JSON.stringify(requests));


        mainRequestMessage.style.color = "#987000";

        mainRequestMessage.textContent =
            "신청이 완료되었습니다. MY GARAGE에서 확인할 수 있어요.";


        mainRequestForm.reset();

    });

}

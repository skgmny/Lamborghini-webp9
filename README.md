# Lamborguinea

Lamborguinea는 **Team 9**이 대학 캡스톤디자인 프로젝트로 만든 람보르기니 브랜드 사이트입니다. 브랜드의 역사와 디자인을 둘러보고, 차량의 제원을 확인한 뒤 외장 색상을 바꿔 볼 수 있습니다.

## 주요 기능

| 페이지 | 할 수 있는 일 |
| --- | --- |
| Home | 프로젝트의 메인 화면에서 브랜드 소개와 차량 페이지로 이동합니다. |
| About | 브랜드의 시작, 로고 변천, 주요 모델, 제작 철학과 미래 비전을 살펴봅니다. |
| Models | 차량 목록을 탐색하고 관심 있는 모델의 상세 페이지로 이동합니다. |
| Vehicle Detail | 선택한 차량의 이미지와 주요 제원을 확인하고, 관심 차량으로 저장하거나 문의를 남깁니다. |
| Customize · Configure | 커스터마이징할 스포츠카 또는 SUV를 선택하고, 외장 색상별 차량 이미지를 미리 봅니다. |
| My Garage | 관심 차량, 최근 본 차량, 시승·구매 상담 문의 내역을 확인합니다. |

차량 정보는 `cars.json`에서 불러옵니다. 관심 차량, 최근 본 차량, 문의 내역은 브라우저의 `localStorage`에 저장됩니다. 문의 양식은 시연용이며, 입력한 내용은 해당 브라우저에서 확인할 수 있습니다.

## 기술 스택

- HTML, CSS, Vanilla JavaScript
- JSON 차량 데이터, Web Storage API

## 로컬 실행

Python 3가 설치된 환경에서 저장소를 내려받고 로컬 서버를 실행합니다.

```bash
git clone https://github.com/skgmny/Lamborghini-webp9.git
cd Lamborghini-webp9
python -m http.server 8000
```

브라우저에서 [http://localhost:8000/main.html](http://localhost:8000/main.html)을 열면 됩니다. VS Code를 사용하는 경우 Live Server로 `main.html`을 열어도 됩니다.

## 팀원

**Team 9** · 김사랑, 김윤하, 조민체, 최석인

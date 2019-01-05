**테스트를 시작하기 전에 Slack으로 @ken에게 환불 계좌 정보를 보내주세요.**

## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

- HTML 수정: `index.ejs`를 수정하시면 됩니다.
- JS 수정: `/app/index.js`를 수정하시면 됩니다.
- CSS 수정: `/assets/styles/index.less`를 수정하시면 됩니다. (파일 형식을 `.scss`로 바꿔서 SCSS를 사용하여도 됩니다.)

## TODO

**아래의 내용을 반드시 꼼꼼하게 읽어주세요.**

여러분이 만들어야 할 웹은 지역 기반 Meetup 관리 어플리케이션입니다. 주요 기능은 다음과 같습니다.

- [ ] 메인 화면에는 Google Map과 Meetup List를 보여줄 수 있어야 합니다.
- [ ] 사용자는 Google Map에서 원하는 지역을 클릭하여 선택할 수 있습니다.
- [ ] [Meetup Upcoming Events API](https://www.meetup.com/meetup_api/docs/find/upcoming_events/)를 이용하여 사용자가 선택한 지역의 Meetup List를 보여주어야 합니다. (API Key는 이 [링크](https://secure.meetup.com/meetup_api/key/)에서 만들 수 있습니다.)
- [ ] Meetup List는 10개만 보여주면 됩니다.
- [ ] Meetup List는 기본적인 이벤트의 정보들을 보여주어야 합니다. 추가적으로 마음껏 Upcoming Events 정보를 이용해서 사용하셔도 됩니다. 아래 목록은 최소한의 요구 사항입니다.
  - [ ] 이벤트 이름
  - [ ] Meetup Group 이름
  - [ ] 이벤트 날짜 및 시간
  - [ ] RSVP 인원
  - [ ] 이벤트 호스트의 이름과 사진
- [ ] Meetup List에는 즐겨찾기 기능이 있어야 합니다.
  - [ ] 사용자는 원하는 Meetup을 즐겨찾기에 추가할 수 있어야 합니다.
  - [ ] 사용자가 Meetup을 즐겨찾기에 추가했다는 표시가 명확히 보여야 합니다.
  - [ ] 사용자는 즐겨찾기에 추가한 Meetup을 다시 즐겨찾기에서 제거할 수 있어야 합니다.
  - [ ] 즐겨찾기에 관련한 Meetup API는 없기 때문에, [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)를 이용하여 즐겨찾기 목록이 저장되도록 해주셔야 합니다.
- [ ] 실제 서비스라 생각하시고 디자인을 입혀주시기 바랍니다.
- [ ] 반응형은 대응하지 않아도 됩니다.

## 안내 사항

- 인터넷을 제외하고는 그 누구(Ken, 동기 포함)에게도 질문할 수 없습니다.
- 인터넷에서 퍼온 소스나 외부 라이브러리를 사용하는 것은 안됩니다.
- JQuery의 Ajax 요청보내는 Method들과 Lodash는 사용해도 괜찮습니다. `package.json`에 이미 추가되어 있습니다. 필요시 업데이트하여 사용하세요.
- JS, CSS등 포함하여 서로 간에 대략적인 의논은 괜찮지만, 그 이상은 안됩니다. **세부 내용이나 솔루션은 공유하면 안됩니다.**
  - OK: "구글 맵 문서 한국어 있나요?" - "네, 있어요. 찾아보세요." - "네, 감사합니다"
  - OK: "Async/Await 사용하려면 추가적으로 설정 손봐야 하나요?" - "네, 저는 웹팩 설정 수정했습니다." - "네, 감사합니다."
  - NOT OK: "구글 맵에서 어떤 정보를 이용해서 Meetup API 연결하셨어요?" (솔루션 요구하는 질문 안됩니다.)
  - NOT OK: "CORS 때문에 요청이 막혔는데, 어떻게 해결하셨어요?" (솔루션 요구하는 질문 안됩니다.)
- 이번 테스트에서는 Git에 대한 논의 또한 금지됩니다.
- 제출하신 코드에 대한 리뷰는 제공하지 않습니다. 채점 결과만 제공합니다.

## 채점 기준

총점 30점 이상은 통과입니다.

- [ ] (15) Feature Requirements
- [ ] (15) Handling Asynchronicity and Data
- [ ] (10) Personal Improvements
- [ ] (5) Consistent Code Style & Readability
- [ ] (5) Git Commit History

## 제출 사항

- 작업 관련 파일들. JS, CSS 등
- UI 동작을 녹화한 GIF 파일

## 제출 기한

- 여러분이 테스트 과제 URL의 초대에 응한 즉시 저에게 알림이 오도록 설정되어 있습니다. 과제를 받은 시간부터 **정확히** 72시간을 지켜주셔야 합니다. Pull Request를 생성한 시간이 72시간으로부터 1분이라도 늦을 시에는 채점하지 않겠습니다. 데드라인은 이유를 막론하고 무조건 지켜주세요.
- 오픈된 시간으로부터 본인이 원하는 시간에 시작하셔서 72시간 또는 96시간(재직자의 경우)동안 작업하신 후 제출해주세요.
- 제출 기한에 대해서는 물어보셔도 됩니다.

## 제출 방법

- 본인에게 주어진 Repository를 클론받아 **작업 브랜치 생성하여** 작업 후, 본인 Repository의 `master` 브랜치로 Pull Request를 만드시고 Slack으로 @ken에게 테스트 완료하셨다고 메시지 주시면 됩니다.

**화이팅..**

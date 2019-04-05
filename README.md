# Vanilla-Meetup

Meetup Api를 기반으로 모임 어플리케이션을 만드는 과제

![meetup](meetup_application_video.gif)


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

- index.ejs 내 google api키 입력 필요
- index.js 내 meetup api키 입력 필요

## Features

- 지도 & Meetup List 출력
- 사용자는 지도에서 원하는 지역을 클릭하여 선택 가능
- [Meetup Upcoming Events API](https://www.meetup.com/meetup_api/docs/find/upcoming_events/)를 이용하여 사용자가 선택한 지역의 Meetup List를 출력 (API Key [링크](https://secure.meetup.com/meetup_api/key/)에서 생성)
- Meetup List는 10개만 출력
- Meetup 기본정보 출력
  - 이벤트 이름
  - Meetup Group 이름
  - 이벤트 날짜 및 시간
  - RSVP 인원
  - 이벤트 호스트의 이름과 사진
  - Meetup List에는 즐겨찾기 기능
  - 사용자는 원하는 Meetup을 즐겨찾기에 추가
  - 사용자가 Meetup을 즐겨찾기에 추가했다는 표시
  - 사용자는 즐겨찾기에 추가한 Meetup을 다시 즐겨찾기에서 제거 가능
  - [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)를 이용하여 즐겨찾기 목록이 저장

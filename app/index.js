// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// You can use jquery for ajax request purpose only.
import $ from 'jquery';

const $noticationButton = document.getElementsByClassName('header-noti')[0];
const $searchBox = document.getElementById('search-box');
const $listContentLayer = document.getElementsByClassName('list-content-layer')[0];
const $searchToggle = document.getElementsByClassName('btn-search-toggle')[0];
const $listContentWrapper = document.getElementsByClassName('list-content-wrapper')[0];
const vanillaMeetup = {
  map: undefined,
  markerStorage: [],
  meetupData: [],
  isDone: true,
  centerPosition: { lat: 37.503219, lon: 127.022119 },
  getApiKey: (() => {
    const key = '2e705e58e1279627c794e2e19767d';

    return function() {
      return key;
    };
  })(),
};

function initMap() {
  vanillaMeetup.map = new google.maps.Map(document.getElementById('map-main'), {
    center: {lat: 37.503219, lng: 127.022119},
    zoom: 12,
  });
  const defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-33.8902, 151.1759),
    new google.maps.LatLng(-33.8474, 151.2631),
  );
  const options = {
    bounds: defaultBounds,
    types: ['establishment'],
  };
  const autocomplete = new google.maps.places.Autocomplete($searchBox, options);

  vanillaMeetup.map.addListener('click', (ev) => {
    if (vanillaMeetup.isDone) {
      vanillaMeetup.centerPosition = { lat: ev.latLng.lat(), lon: ev.latLng.lng() };

      searchAndCleansData();
      $listContentLayer.classList.add('active');
    }
  });

  // map.panTo(marker.getPosition())
  autocomplete.bindTo('bounds', vanillaMeetup.map);
}

window.onload = initMap;

$noticationButton.addEventListener('click', searchAndCleansData);
$searchToggle.addEventListener('click', toggleSearchAndList);

function toggleSearchAndList(ev) {
  if (ev.currentTarget.textContent === '모임 목록') {
    ev.currentTarget.textContent = '모임 검색';
  } else {
    ev.currentTarget.textContent = '모임 목록';
  }

  $listContentLayer.classList.toggle('active');
}

function searchAndCleansData(ev) {
  const url = [
    `https://api.meetup.com/find/upcoming_events?key=${vanillaMeetup.getApiKey()}`,
    `&page=10&lat=${vanillaMeetup.centerPosition.lat}&lon=${vanillaMeetup.centerPosition.lon}`,
    `&fields=event_hosts`
  ].join(' ');

  makeAjaxPromise(url)
    .then((meetupData) => {
      console.log('성공', meetupData);
      cleansData(meetupData.events);
      renderData(vanillaMeetup.meetupData);
    })
    .catch((err) => {
      console.log('실패', err);
    });
}

function makeAjaxPromise(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      dataType: 'jsonp',
      jsonpCallback: 'myCallback',
      success: (responsedData) => {
        resolve(responsedData.data);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

function cleansData(meetupData) {
  console.log(meetupData);
  meetupData.forEach((data, index) => {
    const position = {};
    const hostName = [];
    const hostPhoto = [];
    const hostThumbnail = [];
    const date = data.local_date + '  ' + data.local_time;

    position.lat = data.venue ? data.venue.lat : data.group.lat;
    position.lng = data.venue ? data.venue.lon : data.group.lon;
    data.event_hosts.forEach(item => hostName.push(item.name));
    data.event_hosts.forEach((item) => {
      if (item.photo) {
        hostPhoto.push(item.photo.photo_link);
        hostThumbnail.push(item.photo.thumb_link);
      } else {
        hostPhoto.push('/assets/images/sub_img.png');
        hostThumbnail.push('/assets/images/sub_img.png');
      }
    });

    vanillaMeetup.meetupData[index] = {
      title: data.name,
      groupName: data.group.name,
      position,
      date,
      rvsp: { limit: data.rsvp_limit, yes: data.yes_rsvp_count },
      hostName,
      hostPhoto,
      hostThumbnail,
    };
  });
}

function renderData(cleansedData) {
  if (vanillaMeetup.markerStorage.length) {
    removeMarker();
  }

  cleansedData.forEach(data => makeMarker(data));
  cleansedData.forEach(data => makeListItem(data));
}

function makeListItem(data) {
  const contentList = document.createElement('li');
  const titleParagraph = document.createElement('p');
  const groupParagraph = document.createElement('p');
  const timeParagraph = document.createElement('p');
  const photoWrapperDiv = document.createElement('div');
  const rvspWrapperDiv = document.createElement('div');
  const favoriteButtonSpan = document.createElement('span');
  const rvspSpan = document.createElement('span');

  contentList.classList.add('list-content');
  titleParagraph.classList.add('list-item-title');
  groupParagraph.classList.add('list-item-group');
  timeParagraph.classList.add('list-item-time');
  photoWrapperDiv.classList.add('list-item-photo-wrapper');
  rvspWrapperDiv.classList.add('list-item-rvsp-wrapper');
  favoriteButtonSpan.classList.add('btn-add-favorite');

  titleParagraph.textContent = data.title;
  groupParagraph.textContent = data.groupName;
  timeParagraph.textContent = data.date;
  rvspSpan.textContent = `${data.rvsp.yes}명이 참석 예정입니다.`;
  favoriteButtonSpan.innerHTML = '<i class="fas fa-plus"></i>';

  $listContentWrapper.appendChild(contentList);
  contentList.appendChild(titleParagraph);
  contentList.appendChild(groupParagraph);
  contentList.appendChild(timeParagraph);
  contentList.appendChild(photoWrapperDiv);
  contentList.appendChild(rvspWrapperDiv);
  contentList.appendChild(favoriteButtonSpan);
  data.hostThumbnail.forEach((item) => {
    const photoDiv = document.createElement('div');

    photoDiv.classList.add('list-item-photo');
    photoDiv.style.backgroundImage = `url('${item}')`;
    photoWrapperDiv.appendChild(photoDiv);
  });
  rvspWrapperDiv.appendChild(rvspSpan);

  if (data.rvsp.limit) {
    const rvspSpan = document.createElement('span');
    let limitMinusYes = data.rvsp.limit - data.rvsp.yes;

    if (limitMinusYes < 0) {
      limitMinusYes = 0;
    }

    rvspSpan.classList.add('list-item-rvsp');
    rvspSpan.textContent = `자리가 ${limitMinusYes} 개 남았습니다.`;
    rvspWrapperDiv.appendChild(rvspSpan);
  }
}

function makeMarker(data) {
  const marker = new google.maps.Marker({
    position: data.position,
    map: vanillaMeetup.map,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: makeContentForm(data),
  });

  marker.addListener('mouseover', () => {
    infoWindow.open(vanillaMeetup.map, marker);
  });

  marker.addListener('mouseout', () => {
    infoWindow.close();
  });

  vanillaMeetup.markerStorage.push(marker);

  function makeContentForm(contents) {
    return `<h3>${contents.title}</h3>`;
  }
}

function removeMarker() {
  vanillaMeetup.markerStorage.forEach(marker => marker.setMap(null));
  vanillaMeetup.markerStorage = [];
}

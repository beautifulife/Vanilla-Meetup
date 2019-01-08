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
    $listContentLayer.classList.add('active');
    ev.currentTarget.textContent = '모임 검색';
  } else {
    $listContentLayer.classList.remove('active');
    ev.currentTarget.textContent = '모임 목록';
  }
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
    vanillaMeetup.meetupData[index] = {
      title: data.name,
      position: {
        lat: data.venue ? data.venue.lat : data.group.lat,
        lng: data.venue ? data.venue.lon : data.group.lon,
      },
      date: data.local_date,
      time: data.local_time,
      rvsp: { limit: data.rsvp_limit, yes: data.yes_rsvp_count },
      hostName: data.event_hosts.reduce((acc, item) => {
        acc.push(item.name);

        return acc;
      }, []),
      hostPhoto: data.event_hosts.reduce((acc, item) => {
        if (item.photo) {
          acc.push(item.photo.photo_link);
        } else {
          acc.push('/assets/images/sub_img.png');
        }

        return acc;
      }, []),
    };
  });
}

function renderData(cleansedData) {
  if (vanillaMeetup.markerStorage.length) {
    removeMarker();
  }

  cleansedData.forEach(data => makeMarker(data));
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
    return `<h1>${contents.title}</h1>`;
  }
}

function removeMarker() {
  vanillaMeetup.markerStorage.forEach(marker => marker.setMap(null));
  vanillaMeetup.markerStorage = [];
}

// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// You can use jquery for ajax request purpose only.
import $ from 'jquery';

window.onload = function initApplication() {
  const $favoriteButton = document.getElementsByClassName('header-favorite')[0];
  const $notificationButton = document.getElementsByClassName('header-notification')[0];
  const $notificationIcon = document.getElementsByClassName('notification-icon')[0];
  const $searchSection = document.getElementsByClassName('section-search')[0];
  const $searchBox = document.getElementById('search-box');
  const $searchToggle = document.getElementsByClassName('btn-search-toggle')[0];
  const $listContentLayer = document.getElementsByClassName('list-content-layer')[0];
  let $listContentWrapper = document.getElementsByClassName('list-content-wrapper')[0];
  const vanillaMeetup = {
    map: undefined,
    markerStorage: [],
    meetupData: {},
    isDone: true,
    centerPosition: { lat: 37.503219, lon: 127.022119 },
    favoriteMeetupData: localStorage.getItem('favoriteData') ? JSON.parse(localStorage.getItem('favoriteData')) : {},
    getApiKey: (() => {
      const key = '2e705e58e1279627c794e2e19767d';

      return function() {
        return key;
      };
    })(),
    notificationCount: 0,
    notificationData: [],
  };

  $favoriteButton.addEventListener('click', showFavoriteList);
  $notificationButton.addEventListener('click', showNotificationList);
  $searchToggle.addEventListener('click', toggleSearchAndList);

  function initMap() {
    const autocomplete = new google.maps.places.Autocomplete($searchBox, { types: ['(cities)'] });
    
    vanillaMeetup.map = new google.maps.Map(document.getElementById('map-main'), {
      center: {lat: 37.503219, lng: 127.022119},
      zoom: 12,
    });

    vanillaMeetup.map.addListener('click', (ev) => {
      if (vanillaMeetup.isDone) {
        vanillaMeetup.centerPosition = { lat: ev.latLng.lat(), lon: ev.latLng.lng() };

        searchAndCleansData();
        $listContentLayer.classList.add('active');
      }
    });

    autocomplete.addListener('place_changed', (ev) => {
      const place = autocomplete.getPlace();
      console.log(place);

      if (place.geometry) {
        vanillaMeetup.map.panTo(place.geometry.location);
        vanillaMeetup.map.setZoom(12);

        vanillaMeetup.centerPosition = {
          lat: place.geometry.location.lat(),
          lon: place.geometry.location.lng(),
        };

        searchAndCleansData();
        $listContentLayer.classList.add('active');
      } else {
        $searchBox.placeholder = '도시를 선택하세요';
      }
    });

    autocomplete.bindTo('bounds', vanillaMeetup.map);
    // map.panTo(marker.getPosition())
  }

  initMap();

  function showFavoriteList(ev) {
    $listContentLayer.classList.add('active');
    
    if (Object.keys(vanillaMeetup.favoriteMeetupData).length) {
      renderData(vanillaMeetup.favoriteMeetupData);
    }
  }

  function showNotificationList(ev) {
    console.log(vanillaMeetup.notificationData);

    const notificationLayer = document.createElement;
  }

  function toggleSearchAndList(ev) {
    if (ev.currentTarget.textContent === '모임 목록') {
      ev.currentTarget.textContent = '모임 검색';
    } else {
      ev.currentTarget.textContent = '모임 목록';
    }

    $listContentLayer.classList.toggle('active');
  }

  function searchAndCleansData(ev) {
    console.log(vanillaMeetup.centerPosition);

    const url = [
      `https://api.meetup.com/find/upcoming_events?key=${vanillaMeetup.getApiKey()}`,
      `&page=10&lat=${vanillaMeetup.centerPosition.lat}&lon=${vanillaMeetup.centerPosition.lon}`,
      `&fields=event_hosts`
    ].join(' ');

    makeAjaxPromise(url)
      .then((meetupData) => {
        console.log('성공', meetupData);
        vanillaMeetup.meetupData = {};
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
    meetupData.forEach((data) => {
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

      vanillaMeetup.meetupData[data.id] = {
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

    removeList();

    Object.keys(cleansedData).forEach(data => makeMarker(cleansedData[data]));
    Object.keys(cleansedData).forEach(data => makeListItem(cleansedData[data], data));
  }

  function makeListItem(data, dataId) {
    const contentList = document.createElement('li');
    const titleParagraph = document.createElement('p');
    const groupParagraph = document.createElement('p');
    const timeParagraph = document.createElement('p');
    const photoWrapperDiv = document.createElement('div');
    const rvspWrapperDiv = document.createElement('div');
    const addFavoriteSpan = document.createElement('span');
    const rvspYesSpan = document.createElement('span');

    contentList.classList.add('list-content');
    titleParagraph.classList.add('list-item-title');
    groupParagraph.classList.add('list-item-group');
    timeParagraph.classList.add('list-item-time');
    photoWrapperDiv.classList.add('list-item-photo-wrapper');
    rvspWrapperDiv.classList.add('list-item-rvsp-wrapper');

    titleParagraph.textContent = data.title;
    groupParagraph.textContent = data.groupName;
    timeParagraph.textContent = data.date;
    rvspYesSpan.textContent = `${data.rvsp.yes}명이 참석 예정입니다.`;

    if (vanillaMeetup.favoriteMeetupData[dataId]) {
      addFavoriteSpan.classList.add('btn-remove-favorite');
      addFavoriteSpan.innerHTML = '<i class="fas fa-star"></i>';
      addFavoriteSpan.addEventListener('click', removeFavorite);
    } else {
      addFavoriteSpan.classList.add('btn-add-favorite');
      addFavoriteSpan.innerHTML = '<i class="fas fa-plus"></i>';
      addFavoriteSpan.addEventListener('click', addFavorite);
    }
    
    contentList.dataset.id = dataId;

    $listContentWrapper.appendChild(contentList);
    contentList.appendChild(titleParagraph);
    contentList.appendChild(groupParagraph);
    contentList.appendChild(timeParagraph);
    contentList.appendChild(photoWrapperDiv);
    contentList.appendChild(rvspWrapperDiv);
    contentList.appendChild(addFavoriteSpan);
    data.hostThumbnail.forEach((item) => {
      const photoDiv = document.createElement('div');

      photoDiv.classList.add('list-item-photo');
      photoDiv.style.backgroundImage = `url('${item}')`;
      photoWrapperDiv.appendChild(photoDiv);
    });
    rvspWrapperDiv.appendChild(rvspYesSpan);

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

  function addFavorite(ev) {
    const savedCurrentTarget = ev.currentTarget;
    const dataId = savedCurrentTarget.parentNode.dataset.id;
    const removeFavoriteSpan = document.createElement('span');

    vanillaMeetup.favoriteMeetupData[dataId] = vanillaMeetup.meetupData[dataId];
    localStorage.setItem('favoriteData', JSON.stringify(vanillaMeetup.favoriteMeetupData));
    console.log(JSON.parse(localStorage.getItem('favoriteData')));

    ev.currentTarget.classList.add('active');
    removeFavoriteSpan.classList.add('btn-remove-favorite');
    removeFavoriteSpan.innerHTML = '<i class="fas fa-star"></i>';
    removeFavoriteSpan.addEventListener('click', removeFavorite);

    handleNotification('add', dataId);

    setTimeout(() => {
      savedCurrentTarget.parentNode.appendChild(removeFavoriteSpan);
      savedCurrentTarget.remove();
    }, 500);
  }

  function removeFavorite(ev) {
    const savedCurrentTarget = ev.currentTarget;
    const dataId = savedCurrentTarget.parentNode.dataset.id;
    const addFavoriteSpan = document.createElement('span');

    delete vanillaMeetup.favoriteMeetupData[dataId];
    localStorage.setItem('favoriteData', JSON.stringify(vanillaMeetup.favoriteMeetupData));
    console.log(JSON.parse(localStorage.getItem('favoriteData')));

    ev.currentTarget.classList.add('active');
    addFavoriteSpan.classList.add('btn-add-favorite');
    addFavoriteSpan.innerHTML = '<i class="fas fa-plus"></i>';
    addFavoriteSpan.addEventListener('click', addFavorite);

    handleNotification('remove', dataId);

    setTimeout(() => {
      savedCurrentTarget.parentNode.appendChild(addFavoriteSpan);
      savedCurrentTarget.remove();
    }, 500);
  }

  function handleNotification(action, dataId) {
    if (Object.keys(vanillaMeetup.favoriteMeetupData).length) {
      $notificationIcon.classList.remove('hidden');
      vanillaMeetup.notificationCount++;
      $notificationIcon.textContent = vanillaMeetup.notificationCount;
    } else {
      $notificationIcon.classList.add('hidden');
    }

    vanillaMeetup.notificationData.push({ [dataId]: action });
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

  function removeList() {
    $listContentWrapper.remove();
    $listContentWrapper = document.createElement('ul');
    $listContentWrapper.classList.add('list-content-wrapper');
    $listContentLayer.appendChild($listContentWrapper);
  }
};

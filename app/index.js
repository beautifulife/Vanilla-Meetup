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
  const $searchToggle = document.getElementsByClassName('btn-search-toggle')[0];
  const $searchMapBox = document.getElementById('search-map-box');
  const $searchMeetupBox = document.getElementById('search-meetup-box');
  const $searchRadiusSlider = document.getElementById('search-radius-slider');
  const $searchOrderBest = document.getElementById('btn-search-order-best');
  const $searchOrderTime = document.getElementById('btn-search-order-time');
  const $searchCategoryButton = document.getElementsByClassName('btn-search-category')[0];
  const $listContentLayer = document.getElementsByClassName('list-content-layer')[0];
  let $listContentWrapper = document.getElementsByClassName('list-content-wrapper')[0];
  const vanillaMeetup = {
    map: null,
    markerStorage: {},
    meetupData: {},
    categoryData: {},
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
    advanceSearch: {
      radius: 3,
      order: 'best',
      text: '',
      category: null,
    },
  };

  $favoriteButton.addEventListener('click', showFavoriteList);
  $notificationButton.addEventListener('click', showNotificationList);
  $searchToggle.addEventListener('click', toggleSearchAndList);
  $searchMeetupBox.addEventListener('keydown', setMeetupTextValue);
  $searchRadiusSlider.addEventListener('change', setRadiusValue);
  $searchRadiusSlider.addEventListener('input', changeRadiusView);
  $searchCategoryButton.addEventListener('click', getCategoryData);
  $searchCategoryButton.addEventListener('click', (ev) => {
    ev.currentTarget.lastElementChild.classList.toggle('hidden');
  });
  [$searchOrderBest, $searchOrderTime].forEach(button => button.addEventListener('input', setOrderValue));

  function setMeetupTextValue(ev) {
    console.log(ev.currentTarget.value);
    if (ev.keyCode === 13) {
      vanillaMeetup.advanceSearch.text = ev.currentTarget.value;
      searchAndGetData();
    }
  }

  function setOrderValue(ev) {
    console.log(ev.currentTarget.value, ev.currentTarget.checked);
    if (ev.currentTarget.value === 'best') {
      $searchOrderTime.checked = false;
    } else {
      $searchOrderBest.checked = false;
    }

    vanillaMeetup.advanceSearch.order = ev.currentTarget.value;
  }

  function setRadiusValue(ev) {
    if (ev.currentTarget.value > 160) {
      vanillaMeetup.advanceSearch.radius = 'Infinity';
    } else {
      const radiusMile = Math.floor(Number(ev.currentTarget.value) / 1.609);

      vanillaMeetup.advanceSearch.radius = radiusMile;
    }
  }

  function changeRadiusView(ev) {
    if (ev.currentTarget.value > 160) {
      ev.currentTarget.nextElementSibling.textContent = '모든거리';
    } else {
      ev.currentTarget.nextElementSibling.textContent = `${ev.currentTarget.value} km`;
    }
  }

  function initMap() {
    const autocomplete = new google.maps.places.Autocomplete($searchMapBox, { types: ['(cities)'] });
    
    vanillaMeetup.map = new google.maps.Map(document.getElementById('map-main'), {
      center: {lat: 37.503219, lng: 127.022119},
      zoom: 12,
    });

    vanillaMeetup.map.addListener('click', (ev) => {
      if (vanillaMeetup.isDone) {
        vanillaMeetup.centerPosition = { lat: ev.latLng.lat(), lon: ev.latLng.lng() };
        searchAndGetData();
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
        searchAndGetData();
      } else {
        $searchMapBox.placeholder = '도시를 선택하세요';
      }
    });

    autocomplete.bindTo('bounds', vanillaMeetup.map);
  }

  initMap();

  function showFavoriteList(ev) {
    if (Object.keys(vanillaMeetup.favoriteMeetupData).length) {
      $listContentLayer.classList.add('active');
      ev.currentTarget.classList.add('active');
      renderData(vanillaMeetup.favoriteMeetupData);
    } else {
      alert('등록된 관심 모임이 없습니다.');
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

  function getCategoryData() {
    if (!Object.keys(vanillaMeetup.categoryData).length) {
      const url = `https://api.meetup.com/find/topic_categories?key=${vanillaMeetup.getApiKey()}&photo-host=public`;

      makeAjaxPromise(url)
        .then((categoryData) => {
          console.log('카테고리', categoryData);
          categoryData.forEach((data) => {
            vanillaMeetup.categoryData[data.id] = data.name;
          });
          renderCategory();
        })
        .catch((err) => {
          console.error(err.message);
        });
    }

    function renderCategory() {
      const searchCategoryLayer = document.getElementsByClassName('search-category-layer')[0];

      Object.keys(vanillaMeetup.categoryData).forEach((dataKey) => {
        const categoryItem = document.createElement('li');

        categoryItem.classList.add('search-category-item');
        categoryItem.dataset.id = dataKey;
        console.log(categoryItem.dataset.id);
        categoryItem.textContent = vanillaMeetup.categoryData[dataKey];
        searchCategoryLayer.appendChild(categoryItem);
      });

      searchCategoryLayer.addEventListener('click', (ev) => {
        ev.stopPropagation();
        ev.target.classList.contains('search-category-item');
        ev.currentTarget.classList.add('hidden');
        $searchCategoryButton.firstElementChild.textContent = ev.target.textContent;
        vanillaMeetup.advanceSearch.category = ev.target.dataset.id;
      });
    }
  }

  function searchAndGetData() {
    const url = [
      `https://api.meetup.com/find/upcoming_events?key=${vanillaMeetup.getApiKey()}`,
      `&page=10&lat=${vanillaMeetup.centerPosition.lat}&lon=${vanillaMeetup.centerPosition.lon}`,
      `&radius=${vanillaMeetup.advanceSearch.radius}&order=${vanillaMeetup.advanceSearch.order}`,
      `&text=${vanillaMeetup.advanceSearch.text}&topic_category=${vanillaMeetup.advanceSearch.category}&fields=event_hosts`,
    ].join('');

    $listContentLayer.classList.add('active');
    $listContentLayer.firstElementChild.classList.add('hidden');
    console.log(url, vanillaMeetup.centerPosition);

    makeAjaxPromise(url)
      .then((meetupData) => {
        console.log('성공', meetupData);
        vanillaMeetup.meetupData = {};
        cleansData(meetupData.events);
        renderData(vanillaMeetup.meetupData);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  function makeAjaxPromise(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        dataType: 'jsonp',
        success: (responsedData) => {
          if (responsedData.data.errors) {
            reject(responsedData.data.errors[0]);
          } else {
            resolve(responsedData.data);
          }
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

      try {
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
      } catch(err) {
        console.error(err);

        return;
      }

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
    if (Object.keys(vanillaMeetup.markerStorage).length) {
      removeMarker();
    }

    removeList();

    Object.keys(cleansedData).forEach(dataId => makeMarker(cleansedData[dataId], dataId));
    Object.keys(cleansedData).forEach(dataId => makeListItem(cleansedData[dataId], dataId));
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
    photoWrapperDiv.addEventListener('mouseover', (ev) => {
      if (ev.target.classList.contains('list-item-photo')) {
        ev.target.firstElementChild.classList.remove('hidden');
      }
    });
    photoWrapperDiv.addEventListener('mouseout', (ev) => {
      if (ev.target.classList.contains('list-item-photo')) {
        ev.target.firstElementChild.classList.add('hidden');
      }
    });
  
    contentList.addEventListener('mouseover', focusOnItem);
    contentList.addEventListener('mouseout', unfocusItem);
    
    contentList.dataset.id = dataId;

    $listContentWrapper.appendChild(contentList);
    contentList.appendChild(titleParagraph);
    contentList.appendChild(groupParagraph);
    contentList.appendChild(timeParagraph);
    contentList.appendChild(photoWrapperDiv);
    contentList.appendChild(rvspWrapperDiv);
    contentList.appendChild(addFavoriteSpan);
    data.hostThumbnail.forEach((item, index) => {
      const photoDiv = document.createElement('div');
      const hostNameSpan = document.createElement('span');

      hostNameSpan.textContent = data.hostName[index];
      hostNameSpan.classList.add('list-item-hostname', 'hidden');
      photoDiv.appendChild(hostNameSpan);
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

  function focusOnItem(ev) {
    const targetMarker = vanillaMeetup.markerStorage[ev.currentTarget.dataset.id];

    ev.currentTarget.classList.add('focus');
    vanillaMeetup.map.panTo(targetMarker.getPosition());
  }

  function unfocusItem(ev) {
    ev.currentTarget.classList.remove('focus');
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
    let isFavoriteActive = false;

    delete vanillaMeetup.favoriteMeetupData[dataId];
    localStorage.setItem('favoriteData', JSON.stringify(vanillaMeetup.favoriteMeetupData));

    if ($favoriteButton.classList.contains('active')) {
      isFavoriteActive = true;
    }

    ev.currentTarget.classList.add('active');
    addFavoriteSpan.classList.add('btn-add-favorite');
    addFavoriteSpan.innerHTML = '<i class="fas fa-plus"></i>';
    addFavoriteSpan.addEventListener('click', addFavorite);

    handleNotification('remove', dataId);

    setTimeout(() => {
      if (isFavoriteActive) {
        savedCurrentTarget.parentNode.remove();
      } else {
        savedCurrentTarget.parentNode.appendChild(addFavoriteSpan);
        savedCurrentTarget.remove();
      }
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

  function makeMarker(data, dataId) {
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

    vanillaMeetup.markerStorage[dataId] = marker;

    function makeContentForm(contents) {
      return `<h3>${contents.title}</h3>`;
    }
  }

  function removeMarker() {
    Object.keys(vanillaMeetup.markerStorage).forEach(dataId => vanillaMeetup.markerStorage[dataId].setMap(null));
    vanillaMeetup.markerStorage = {};
  }

  function removeList() {
    $listContentWrapper.remove();
    $listContentWrapper = document.createElement('ul');
    $listContentWrapper.classList.add('list-content-wrapper');
    $listContentLayer.appendChild($listContentWrapper);
  }
};

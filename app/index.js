// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// You can use jquery for ajax request purpose only.
import $ from 'jquery';

window.onload = function() {
  const $startAppButton = document.getElementsByClassName('btn-start-session')[0];
  const $favoriteButton = document.getElementsByClassName('btn-header-favorite')[0];
  const $notificationButton = document.getElementsByClassName('header-notification')[0];
  const $notificationIcon = document.getElementsByClassName('notification-icon')[0];
  const $searchToggleButton = document.getElementsByClassName('btn-search-toggle')[0];
  const $searchMapBox = document.getElementById('search-map-box');
  const $searchMeetupBox = document.getElementById('search-meetup-box');
  const $searchRadiusSlider = document.getElementById('search-radius-slider');
  const $searchBestOrderButton = document.getElementById('btn-search-order-best');
  const $searchTimeOrderButton = document.getElementById('btn-search-order-time');
  const $searchCategoryButton = document.getElementsByClassName('btn-search-category')[0];
  const $listContentLayer = document.getElementsByClassName('list-content-layer')[0];
  let $listContentWrapper = document.getElementsByClassName('list-content-wrapper')[0];
  const vanillaMeetup = {
    map: null,
    markerData: {},
    meetupData: {},
    categoryData: {},
    notificationData: {},
    notificationCount: 0,
    errorData: [],
    isDone: true,
    centerPosition: {
      lat: 37.503219,
      lon: 127.022119
    },
    advanceSearch: {
      radius: 3,
      order: 'best',
      text: '',
      category: ''
    },
    favoriteMeetupData: localStorage.getItem('favoriteData') ? JSON.parse(localStorage.getItem('favoriteData')) : {},
    getApiKey: (() => {
      const key = '[APIKEY]';

      return function() {
        return key;
      };
    })()
  };

  $favoriteButton.addEventListener('click', showFavoriteList);
  $notificationButton.addEventListener('click', showNotificationList);
  $searchToggleButton.addEventListener('click', toggleSearchAndList);
  $searchMeetupBox.addEventListener('keydown', setMeetupTextValue);
  $searchRadiusSlider.addEventListener('change', setRadiusValue);
  $searchRadiusSlider.addEventListener('input', changeRadiusView);
  $searchCategoryButton.addEventListener('click', getCategoryData);
  $searchBestOrderButton.addEventListener('input', setOrderValue);
  $searchTimeOrderButton.addEventListener('input', setOrderValue);

  $searchCategoryButton.addEventListener('click', (ev) => {
    ev.currentTarget.lastElementChild.classList.toggle('hidden');
  });

  $startAppButton.addEventListener('click', () => {
    document.getElementsByClassName('intro-page')[0].style.left = '-100%';
  });

  initMap();

  function initMap() {
    const autoComplete = new google.maps.places.Autocomplete($searchMapBox, { types: ['(cities)'] });

    vanillaMeetup.map = new google.maps.Map(document.getElementById('map-main'), {
      center: { lat: 37.503219, lng: 127.022119 },
      zoom: 12
    });

    vanillaMeetup.map.addListener('click', (ev) => {
      if (vanillaMeetup.isDone) {
        vanillaMeetup.isDone = false;
        vanillaMeetup.centerPosition = { lat: ev.latLng.lat(), lon: ev.latLng.lng() };
        searchAndGetData();
        vanillaMeetup.map.panTo({ lat: ev.latLng.lat(), lng: ev.latLng.lng() });
      }
    });

    autoComplete.addListener('place_changed', () => {
      const place = autoComplete.getPlace();

      if (place.geometry) {
        vanillaMeetup.map.panTo(place.geometry.location);
        vanillaMeetup.map.setZoom(12);

        vanillaMeetup.centerPosition = {
          lat: place.geometry.location.lat(),
          lon: place.geometry.location.lng()
        };

        searchAndGetData();
      } else {
        $searchMapBox.placeholder = '도시를 선택하세요';
      }
    });

    autoComplete.bindTo('bounds', vanillaMeetup.map);
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

    makeAjaxPromise(url)
      .then((meetupData) => {
        if (meetupData.events.length) {
          vanillaMeetup.meetupData = {};
          cleansData(meetupData.events);
          renderData(vanillaMeetup.meetupData);
        }

        $listContentWrapper.classList.remove('hidden');
        vanillaMeetup.isDone = true;
      })
      .catch((err) => {
        vanillaMeetup.isDone = true;
        vanillaMeetup.errorData.push(err);
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
        }
      });
    });
  }

  function cleansData(meetupData) {
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
      } catch (err) {
        vanillaMeetup.isDone = true;
        vanillaMeetup.errorData.push(err);
        console.error(err);
      }
    });
  }

  function renderData(cleansedData) {
    if (Object.keys(vanillaMeetup.markerData).length) {
      removeMarker();
    }

    removeList();
    Object.keys(cleansedData).forEach(dataId => makeListItem(cleansedData[dataId], dataId));
    Object.keys(cleansedData).forEach(dataId => makeMarker(cleansedData[dataId], dataId));
    vanillaMeetup.isDone = true;
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
    contentList.dataset.id = dataId;

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
    $listContentWrapper.appendChild(contentList);
    contentList.appendChild(titleParagraph);
    contentList.appendChild(groupParagraph);
    contentList.appendChild(timeParagraph);
    contentList.appendChild(photoWrapperDiv);
    contentList.appendChild(rvspWrapperDiv);
    contentList.appendChild(addFavoriteSpan);
    rvspWrapperDiv.appendChild(rvspYesSpan);

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

  function setMeetupTextValue(ev) {
    if (ev.keyCode === 13) {
      vanillaMeetup.advanceSearch.text = ev.currentTarget.value;
      searchAndGetData();
    }
  }

  function setOrderValue(ev) {
    if (ev.currentTarget.value === 'best') {
      $searchTimeOrderButton.checked = false;
    } else {
      $searchBestOrderButton.checked = false;
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
    if (vanillaMeetup.notificationCount === 0) {
      return;
    }

    if (!ev.currentTarget.lastElementChild.classList.contains('notification-layer')) {
      const notificationLayer = document.createElement('ul');

      $notificationButton.appendChild(notificationLayer);
      notificationLayer.classList.add('notification-layer');

      Object.keys(vanillaMeetup.notificationData).forEach((key) => {
        const notificationItem = `<li class="notification-item">
            <span><b>${vanillaMeetup.notificationData[key].action}</b> favorite meetup</span><br>
            <span>${vanillaMeetup.notificationData[key].title}</span>
          </li>`;

        notificationLayer.innerHTML += notificationItem;
      });
    } else {
      ev.currentTarget.lastElementChild.remove();
      vanillaMeetup.notificationData = {};
      vanillaMeetup.notificationCount = 0;
      $notificationIcon.classList.add('hidden');
    }
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
          categoryData.forEach((data) => {
            vanillaMeetup.categoryData[data.id] = data.name;
          });

          renderCategory();
        })
        .catch((err) => {
          vanillaMeetup.isDone = true;
          vanillaMeetup.errorData.push(err);
          console.error(err.message);
        });
    }

    function renderCategory() {
      const searchCategoryLayer = document.getElementsByClassName('search-category-layer')[0];

      Object.keys(vanillaMeetup.categoryData).forEach((key) => {
        const categoryItem = document.createElement('li');

        categoryItem.classList.add('search-category-item');
        categoryItem.dataset.id = key;
        categoryItem.textContent = vanillaMeetup.categoryData[key];
        searchCategoryLayer.appendChild(categoryItem);
      });

      searchCategoryLayer.addEventListener('click', (ev) => {
        ev.stopPropagation();

        if (ev.target.classList.contains('search-category-item')) {
          ev.currentTarget.classList.add('hidden');
          $searchCategoryButton.firstElementChild.textContent = ev.target.textContent;
          vanillaMeetup.advanceSearch.category = ev.target.dataset.id;
        }
      });
    }
  }

  function focusOnItem(ev) {
    const targetMarker = vanillaMeetup.markerData[ev.currentTarget.dataset.id];

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

    handleNotification('add', dataId);

    ev.currentTarget.classList.add('active');
    removeFavoriteSpan.classList.add('btn-remove-favorite');
    removeFavoriteSpan.innerHTML = '<i class="fas fa-star"></i>';
    removeFavoriteSpan.addEventListener('click', removeFavorite);

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

    handleNotification('remove', dataId);

    delete vanillaMeetup.favoriteMeetupData[dataId];
    localStorage.setItem('favoriteData', JSON.stringify(vanillaMeetup.favoriteMeetupData));

    if ($favoriteButton.classList.contains('active')) {
      isFavoriteActive = true;
    }

    ev.currentTarget.classList.add('active');
    addFavoriteSpan.classList.add('btn-add-favorite');
    addFavoriteSpan.innerHTML = '<i class="fas fa-plus"></i>';
    addFavoriteSpan.addEventListener('click', addFavorite);

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

    vanillaMeetup.notificationData[dataId] = {
      action,
      title: vanillaMeetup.favoriteMeetupData[dataId].title
    };
  }

  function makeMarker(data, dataId) {
    const marker = new google.maps.Marker({
      position: data.position,
      map: vanillaMeetup.map,
      animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
      content: makeContentForm(data)
    });

    marker.addListener('mouseover', () => {
      infoWindow.open(vanillaMeetup.map, marker);
    });

    marker.addListener('mouseout', () => {
      infoWindow.close();
    });

    vanillaMeetup.markerData[dataId] = marker;

    function makeContentForm(contents) {
      return `<span>${contents.title}</span>`;
    }
  }

  function removeMarker() {
    Object.keys(vanillaMeetup.markerData).forEach((dataId) => {
      vanillaMeetup.markerData[dataId].setMap(null);
    });

    vanillaMeetup.markerData = {};
  }

  function removeList() {
    $listContentWrapper.remove();
    $listContentWrapper = document.createElement('ul');
    $listContentWrapper.classList.add('list-content-wrapper');
    $listContentLayer.appendChild($listContentWrapper);
  }
};

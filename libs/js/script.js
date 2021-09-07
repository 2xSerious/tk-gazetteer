var countryCode;
var countryBorder;
var flyto;
var countryBool =false;
var north, south, east, west;
var markersArray = [];
var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
var webcamMarkers = L.layerGroup();
var markers = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    return L.divIcon({ html: "<b> " + cluster.getChildCount() + " </b>" });
  },
});
var customMarker = L.ExtraMarkers.icon({
  shape: "circle",
  markerColor: "yellow",
  prefix: "bi bi-info",
  icon: "bi-info-lg",
  iconColor: "#000",
  iconRotate: 0,
  extraClasses: "",
  number: "",
  svg: false,
});
var webcamMarker = L.ExtraMarkers.icon({
  shape: "square",
  markerColor: "cyan",
  prefix: "bi bi-camera-video",
  icon: "bi bi-camera-video",
  iconColor: "#fff",
  iconRotate: 0,
  extraClasses: "",
  number: "",
  svg: false,
})

$(document).ready(function () {
  $("#loading").fadeOut("slow");

  getCountryList();
  $("#slCountries").change(getCountryBorder);
  $(document).on("select2:open", () => {
    document.querySelector(".select2-search__field").focus();
  });
  $("#close img").click(function () {
    $(".card").animate({ left: -999 }, 1000);
    $("#info-circle-fill").show("slide", { direction: "left" });
    countryBool = false;
  });

  $('#covid-btn').click(function () {
    $('#covid-container').addClass('covid-unhide');
    $('#overlay').show();
  });
  $('.covid-div-close').click(function () {
    $('#covid-container').removeClass('covid-unhide');
    $('#overlay').hide();
  })
  $('#holiday-btn').click(function () {
    $('#holiday-container').addClass('holiday-unhide');
    $('#overlay').show();
  })
  $('.holiday-div-close').click(function () {
    $('#holiday-container').removeClass('holiday-unhide');
    $('#overlay').hide();
  })
  $("#info-circle-fill").click(toggleDiv);
  $(".weather-div-close").click(function () {
    $("#weather-container").toggleClass("weather-div-hidden");
    $("#overlay").hide();
    //   console.log("close");
  });
  $("#btn-weather").click(function () {
    $("#weather-container").toggleClass("weather-div-hidden");
    $("#overlay").show();
    // console.log("open");
  });
  $(".news-div-close").click(function () {
    $("#news-container").removeClass("news-div-hidden");
    $("#overlay").hide();
  });
  $("#btn-news").click(function () {
    $("#news-container").addClass("news-div-hidden");
    $("#overlay").show();
  });
  
  $("#compass-btn").click(function() {
    clearMap();
  });
  

  });
function getCountryList() {
  $.ajax({
    url: "./libs/php/getCountries.php",
    dataType: "json",
    success: function (result) {
      //   console.log(result);
      result.forEach((element) => {
        $("#slCountries")
          .append(`<option value="${element[1]}"> ${element[0]} </option>`)
          
      });
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}

function getCountryBorder() {
  countryCode = $("#slCountries").val();
  if (countryCode == null || countryCode == 0) {
    return;
  }

  $.ajax({
    url: "./libs/php/getCountryBorders.php",
    dataType: "json",
    data: {
      countryCode: countryCode,
    },
    beforeSend: function () {
      $("#loading").fadeIn("slow");
    },

    success: function (result) {
      if (countryBorder != null) {
        countryBorder.clearLayers();
      }
      countryBorder = L.geoJSON(result, {
        style: {
          color: "808080",
          weight: 5,
          opacity: 0.3,
        },
      });
      countryBorder.addTo(mymap);
    },
    complete: function () {
      $("#loading").fadeOut("slow");
      var position = $("#slCountries").offset();
      var bounds = countryBorder.getBounds();
      var southWest = bounds.getSouthWest();
      var northEast = bounds.getNorthEast();
      north = bounds.getNorth();
      south = bounds.getSouth();
      east = bounds.getEast();
      west = bounds.getWest();
      console.log(north, south);
      $(".card").animate({ left: 5, right: position.right }, 1000);
      countryBool = true;

      flyto = L.latLngBounds(southWest, northEast);
      mymap.flyToBounds(flyto, { duration: 1, easeLinearity: 0.75 });
      //   console.log(bounds);
      getCountryInfo(countryCode);
      getWikipedia(north, south, east, west);
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}

function getCountryInfo(countryCode) {
  
  $.ajax({
    url: "./libs/php/getCountryInfo.php",
    dataType: "json",
    data: {
      countryCode: countryCode,
    },
    success: function (result) {
      console.log(result);
      countryLan = result.latlng[0];
      countryLng = result.latlng[1];
      var populationFormat = result["population"].toLocaleString('en');
      $("#capital").html(result["capital"]);
      $("#country-name").html(result["name"]);
      $("#country-flag").attr("src", result["flag"]);
      $("#population").html(populationFormat);
      $("#time-zone").html(result["timezones"][0]);
      $("#currency").html(result["currencies"][0]["name"]);
      getWikipedia(countryCode);
      getWebcams(countryCode);
      getNews(countryCode);
      getCovid(countryCode);
      getHolidays(countryCode);
    },
    complete: function (result) {
      // console.log(result);
      var json = result.responseJSON;
      var capital = json["capital"];
      // GET Weather call
      $.ajax({
        url: "./libs/php/getWeather.php",
        dateType: "json",
        data: {
          city: capital,
        },
        success: function (data) {
          // console.log(data);
          var obj = JSON.parse(data);
          console.log(obj);
          var listArr = obj.list;

          $("#weather-title").html(obj.city["name"]);

          console.log("Before for loop " + listArr.length);
          $("#fc-table-head").empty();
          $("#fc-icon").empty();
          $("#fc-temp").empty();
          for (let i = 0; i < listArr.length; i++) {
            var elementDt = listArr[i]["dt_txt"];

            if (elementDt.substring(11) == "21:00:00") {
              // console.log("Date: " + listArr[i]['dt_txt']);
              var today = new Date();
              var d = new Date(elementDt.substring(0, 10));
              var day = days[d.getUTCDay()];
              var temp = Math.round(listArr[i]["main"]["temp"]);
              var icon = listArr[i]["weather"][0]["icon"];

              if (today.getUTCDate() === d.getUTCDate()) {
                let imgUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                $("#weather-icon").attr("src", imgUrl);
                $("#weather-temp").html(temp + "&#8451");
                $("#weather-text").html(
                  listArr[i]["weather"][0]["description"]
                );
              }
              $("#fc-table-head").append(`<th>${day}</th>`);
              $("#fc-icon").append(
                `<td><img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon"></td>`
              );
              $("#fc-temp").append(`<td>${temp}&#8451</td>`);
            }
          }
        },
      });
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}
function getWikipedia(south, north, east, west) {
  $.ajax({
    url: "./libs/php/getWikipedia.php",
    dataType: "json",
    async: false,
    data: {
      south: south,
      north: north,
      east: east,
      west: west,
    },
    success: function (result) {
      console.log(result);
      let arr = result.entry;
      if (arr !== undefined) {
        markersArray = [];
        arr.forEach((element) => {
          markersArray.push(element);
        });
      }
      console.log(markersArray);
    },
    complete: createMarkers,
  });
}

function getNews(countryCode) {
  $.ajax({
    url: "./libs/php/getNews.php",
    dataType: "json",
    data: {
      countryCode: countryCode
    },
    success: function (data) {
      let results = data.results;
      $("#news-inner").empty();
      results.forEach(result => {
        let artImg = result.image_url ? result.image_url : "./img/no-imag.jpg";
        $('#news-inner').append(
          `<div class="news-article">
          <a href="${result.link}" target="_blank">
            <h2>${result.title}</h2>
            <p>${result.pubDate}</p>
            <img src="${artImg}" alt="article-image" />
            </a>
          </div>`
        )
      })
    }
  })
}

function getCovid(countrCode) {
  $.ajax({
    url: "./libs/php/getCovid.php",
    dataType: "json",
    data: {
      countryCode: countryCode,
    },
    success: function(result) {
      
      let data = result.data;
      let date = new Date(data.updated_at);
      let dateUpd = date.toDateString();
      let latest = data.latest_data;
      console.log(latest);
      let recoveryRate = latest.calculated.recovery_rate;
      $('#covid-country').html(data.name);
      $('#covid-updated').html(dateUpd);
      $('#covid-confirmed').html(latest.confirmed.toLocaleString('en'));
      $('#covid-recovered').html(latest.recovered.toLocaleString('en'));
      $('#covid-deaths').html(latest.deaths.toLocaleString('en'));
      $('#covid-critical').html(latest.critical.toLocaleString('en'));
      $('#covid-recovery-rate').html(Math.round(recoveryRate) + "%");
    }
  })
}

function getWebcams(ccode) {
  if (webcamMarkers != undefined) {
    webcamMarkers.clearLayers();
  }
  
  $.ajax({
    url: './libs/php/getWebcams.php',
    dataType: 'json',
    data: {
      countrCode: ccode,
    },
    success: function (data) {
      let webArr = data.result['webcams'];
      console.log(webArr);

      webArr.forEach(element => {
        var lat = element.location['latitude'];
        var lng = element.location['longitude'];
        console.log(element.player['live']['embed'])
        let content = `<h3>${element.location.city}</h3><iframe src="${element.player['day']['embed']}?autoplay=1" width="300vw"></iframe>`;
        webcamMarkers.addLayer(
          L.marker([lat,lng], {icon: webcamMarker}).bindPopup(content)
        )
      } )
      console.log(webcamMarkers);
      mymap.addLayer(webcamMarkers);

    }
  });
  
}

function getHolidays(countrCode) {
  $.ajax({
    url: "./libs/php/getHolidays.php",
    dataType: "json",
    data: {
      countryCode: countryCode
    },
    success: function(result) {
      $('#holiday-inner').empty();
      result.forEach(holiday => {
        $('#holiday-inner').append(
          `<div class="card-holiday card bg-light mb-3" style="max-width: 18rem;">
            <div class="card-header">${holiday.name}</div>
            <div class="card-body">
            <h5 class="card-title">${holiday.types[0]}</h5>
            <p class="card-text"> ${holiday.date}</p>
          </div>
        </div>`
        )
      })
    }
  })
}

function createMarkers() {
  markers.clearLayers();
  console.log(markersArray);
  markersArray.forEach((element) => {
    let lat = element.lat;
    let lng = element.lng;
    let img =
      typeof element.thumbnailImg === "string"
        ? `<img src="${element.thumbnailImg}" height="62" />`
        : "";
    let content = `<h2>${element.title}</h2>${img}<br><p>${element.summary}</p><a href="${element.wikipediaUrl}" target="_blank">Wikipedia</>`;

    markers.addLayer(
      L.marker([lat, lng], { icon: customMarker }).bindPopup(content)
    );
  });
  mymap.addLayer(markers);
}

function toggleDiv() {
  if (!countryBool) {
    $(".card").animate({ left: 5 }, 500);
    $("#info-circle-fill").hide("slide", { direction: "left" }, 500);
  } else {
    $(".card").animate({ left: -999 }, 500);
    if (countryCode != null) {
      $("#info-circle-fill").show("slide", { direction: "left" }, 500);
    }
  }
}

function clearMap() {
  if (countryBool) {
    $(".card").animate({ left: -999 }, 500);
    $("#info-circle-fill").hide("slide", { direction: "left" }, 500);
    if (countryBorder != null) {
      countryBorder.clearLayers();
      markers.clearLayers();
      webcamMarkers.clearLayers();
    }
    countryBool = false;
    $("#slCountries").val("0").trigger("change");
  } else {
    $("#info-circle-fill").hide("slide", { direction: "left" }, 500);
    if (countryBorder != null) {
      countryBorder.clearLayers();
      markers.clearLayers();
      webcamMarkers.clearLayers();
    }
    $("#slCountries").val("0").trigger("change");
  }
    mymap.locate({ setView: true, maxZoom: 15, });

}

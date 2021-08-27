var countryCode;
var countryBorder;
var countryBool;
var north, south, east, west;
var markersArray = [];
var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
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
  $("#compass-btn").click(clearMap);
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
          .select2();
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
      var position = $(".select2-container").offset();
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
  var countryLan;
  var countryLng;
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
      $("#capital").html(result["capital"]);
      $("#country-name").html(result["name"]);
      $("#country-flag").attr("src", result["flag"]);
      $("#population").html(result["population"]);
      $("#time-zone").html(result["timezones"][0]);
      $("#currency").html(result["currencies"][0]["name"]);
      getWikipedia(countryCode);
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
                let imgUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
                $("#weather-icon").attr("src", imgUrl);
                $("#weather-temp").html(temp + "&#8451");
                $("#weather-text").html(
                  listArr[i]["weather"][0]["description"]
                );
              }
              $("#fc-table-head").append(`<th>${day}</th>`);
              $("#fc-icon").append(
                `<td><img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon"></td>`
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
    countryBool = false;
    if (countryBorder !== null) {
      countryBorder.clearLayers();
      markers.clearLayers();
    }
    $("#slCountries").val("0").trigger("change");
  } else {
    $("#info-circle-fill").hide("slide", { direction: "left" }, 500);
    if (countryBorder !== null) {
      countryBorder.clearLayers();
      markers.clearLayers();
    }
    $("#slCountries").val("0").trigger("change");
  }
}

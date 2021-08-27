var mymap = L.map("mapid", {
  zoomControl: false,
  tap: false
});
var popup = L.popup();
var clocation, mrk;
var clickMarker = L.ExtraMarkers.icon({
  shape: "circle",
  markerColor: "orange-dark",
  prefix: "bi bi-pin-map-fill",
  icon: "bi-pin-map-fill",
  iconColor: "#fff",
  iconRotate: 0,
  extraClasses: "",
  number: "",
  svg: false,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}
).addTo(mymap);
L.control.scale().addTo(mymap);
L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(mymap);


mymap.locate({ setView: true, maxZoom: 15, });
mymap.on("locationfound", onLocationFound);
mymap.on("click", onMapClick);

var myloc = L.ExtraMarkers.icon({
  shape: "circle",
  markerColor: "violet",
  prefix: "bi bi-person-fill",
  icon: "bi-person-fill",
  iconColor: "#000",
  iconRotate: 0,
  extraClasses: "",
  number: "",
  svg: false,
});

var compassBtn = L.easyButton({
  id: "compass-btn",
  position: "bottomright",
  leafletClasses: true,
  states: [
    {
      stateName: "get-location",
      onClick: function (btn, map) {
        if (clocation == undefined) {
          alert(
            "ERROR: Location blocked! Please allow the browser to use your location."
          );
          return;
        }
        map.flyTo(clocation, 14, {duration: 0.5, easeLinearity: 0.75});
      },
      icon: '<i class="bi bi-compass" style="font-size: 1.2rem"></i>',
    },
  ],
});
compassBtn.addTo(mymap);

function onLocationFound(e) {
  var address;
  clocation = e.latlng;
  // console.log("Location latlng: " + e.latlng)
  var lat = clocation["lat"];
  var lng = clocation["lng"];
  var marker = L.marker(e.latlng, { icon: myloc }).addTo(mymap);

  $.ajax({
    url: "./libs/php/getPinLocation.php",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (data) {
      // console.log(data['results'][0]['formatted']);
      address = data["results"][0]["formatted"];
      popup.setContent(address);
      marker.bindPopup(popup);
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}

function onMapClick(e) {
  var address;
  var location = e.latlng;
  var lat = location["lat"];
  var lng = location["lng"];
  console.log(lat);
  console.log(lng);
  if (mrk != undefined) {
    mymap.removeLayer(mrk);
  }
  mrk = L.marker(location, { icon: clickMarker });
  mrk.on("popupclose", function () {
    mymap.removeLayer(mrk);
  });
  $.ajax({
    url: "./libs/php/getPinLocation.php",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (data) {
      // console.log(data['results'][0]['formatted']);
      address = data["results"][0]["formatted"];
      popup.setContent(address);
      mrk.bindPopup(popup).addTo(mymap).openPopup();
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}



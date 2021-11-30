Vue.config.devtools = true;

var resultView = new Vue({
  el: '#app',
  data: {
    curPage: 'main',
    locateOptions: new Set(),
    locateDistance: 0,
    locateResults: [],
  },
  methods: {
    addLocateOption(option) {
      this.locateOptions.add(option)
      this.$forceUpdate();
    },

    removeLocateOption(option) {
      this.locateOptions.delete(option)
      this.$forceUpdate();
    },

    handleDistanceInput(evt) {
      this.locateDistance = parseFloat(evt.target.value);
    },

    handleLocate() {
      axios
          .get('https://sheets.googleapis.com/v4/spreadsheets/1w8qms9wIXwbTyU_N0tBiNIii3t3-t_OIwmKTX6RSc08/values/A2:J1000?key=AIzaSyAyPyz8Df6KljEVecXIsxRRNhEe1QmRTMA')
          .then(response => (this.handleSheetsResponse(response)));
    },

    withinUserRange(lat, lng) {
      if (!this.locateDistance) {
        return true;
      }

      let RADIUS = 6371; // Radius of the earth in km
      let dLat = this.degToRad(lat-crd.latitude);  // degToRad below
      let dLon = this.degToRad(lng-crd.longitude); 
      let a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.degToRad(crd.latitude)) * Math.cos(this.degToRad(lat)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      let distance = (RADIUS * c) / 1.609; // Distance in mi

      if (distance <= this.locateDistance) {
        return true;
      }
      return false

    },

    degToRad(degrees) {
      return degrees * (Math.PI/180)
    },

    handleSheetsResponse(response) {
      //Clear results array
      this.locateResults = [];

      for (i = 0; i < Object.keys(response.data.values).length; ++i) {
        let valid = true;
        let options = ['landfill', 'recycle', 'bottle', 'metal', 'chemical', 'electronic']

        //Check if types match user options
        for (j = 0; j < 6; ++j) {
          if (response.data.values[i][j + 3] == "FALSE" && this.locateOptions.has(options[j])) {
            valid = false;
          }
        }

        //Check if distance is within preferred user range
        if (!this.withinUserRange(response.data.values[i][1], response.data.values[i][2])) {
          valid = false;
        }

        //Populate locateResults with valid locations
        if (valid) {
          this.locateResults.push(response.data.values[i]);
        }
      }
      console.log('Locate Results:')
      console.log(this.locateResults);
	  deleteMarkers();
	  initMarkers();
    },
	showMap() {
		document.getElementById( 'map' ).style.display = "block";
		initMap();
	},
	hideMap() {
		document.getElementById( 'map' ).style.display = "none";
	}
	

  }
})
let infoWindow;
let map;
let marker; // this is just the center marker
let markers = []
// temporary marker array
let disposals = [
	{ lat: 42.2921, lng: -83.71585 },
	{ lat: 42.2919, lng: -83.71585 },
	{ lat: 42.2920, lng: -83.71575 },
	{ lat: 42.2920, lng: -83.71595 },
]

var options = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0
};
var crd;
function success(pos) {
	crd = pos.coords;

	console.log('Your current position is:');
	console.log(`Latitude : ${crd.latitude}`);
	console.log(`Longitude: ${crd.longitude}`);
	console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
	console.warn(`ERROR(${err.code}): ${err.message}`);
}
function initMarkers() {
	// loop through locateResults
	for(var i = 0; i < resultView.locateResults.length; i++) {
		const img = findIcon(resultView.locateResults[i]);
		markers[i] = new google.maps.Marker({
			position: { lat: parseFloat(resultView.locateResults[i][1]), lng: parseFloat(resultView.locateResults[i][2])},
			map: map,
			id: parseInt(resultView.locateResults[i][0]),
			icon: img,
		});
	};
}
navigator.geolocation.getCurrentPosition(success, error, options);
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(
	browserHasGeolocation
		? "Error: The Geolocation service failed."
		: "Error: Your browser doesn't support geolocation."
	);
	infoWindow.open(map);
}
function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: { lat: crd.latitude, lng: crd.longitude},
		zoom: 18,
	});
	infoWindow = new google.maps.InfoWindow();

	const locationButton = document.createElement("button");

	locationButton.textContent = "Pan to Current Location";
	locationButton.classList.add("custom-map-control-button");
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
	locationButton.addEventListener("click", function() {map.setCenter({ lat: crd.latitude, lng: crd.longitude})});
}
// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = [];
}

// Marker Icon
function findIcon(mark){
	var x;
	if(mark[3] == "TRUE"){
		x = "images/landfill.png";
	}
	if(mark[4] == "TRUE"){
		x = "images/recycle.png";
	}
	if(mark[5] == "TRUE"){
		x = "images/bottles.png";
	}
	if(mark[6] == "TRUE"){
		x = "images/metals.png";
	}
	if(mark[7] == "TRUE"){
		x = "images/chemicals.png";
	}
	if(mark[8] == "TRUE"){
		x = "images/electronics.png";
	}
	return x;
}
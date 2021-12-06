Vue.config.devtools = true;

var resultView = new Vue({
  el: '#app',
  data: {
    curPage: 'main',
    locateOptions: new Set(),
    locateDistance: 0,
    locateResults: [],
	submission: {
	  id: 0,
	  latitude: 0,
	  longitude: 0,
	  landfill: 'TRUE',
	  recycle: 'FALSE',
	  bottle: 'FALSE',
	  metals: 'FALSE',
	  chemical: 'FALSE',
	  electronic: 'FALSE',
	  description: 'user submitted',
	}
  },
  methods: {
	resetLocateOptions() {
		this.locateOptions = new Set();
		this.$forceUpdate();
	},
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
	  deleteMarkers(markers);
	  initMarkers();
    },
	showMap() {
		document.getElementById( 'map' ).style.display = "block";
		document.getElementById( 'legend' ).style.display = "block";
		initMap();
		initLegend();
		this.handleLocate();
	},
	hideMap() {
		document.getElementById( 'map' ).style.display = "none";
		document.getElementById( 'legend' ).style.display = "none";
		google.maps.event.clearInstanceListeners(map);
	}
	

  }
})

let infoWindow;
let map;
let marker; // this is just the center marker
let markers = []
let subMarkers = [];
let subMarker;
let subSelected = false;
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
}
function error(err) {
	console.warn(`ERROR(${err.code}): ${err.message}`);
	crd = {latitude: 42.29208364363135, longitude: -83.71624887321929};
}
function initMarkers() {
	// loop through locateResults
	for(var i = 0; i < resultView.locateResults.length; i++) {
		const img = findIcon(resultView.locateResults[i]);
		markers[i] = new google.maps.Marker({
			position: { lat: parseFloat(resultView.locateResults[i][1]), lng: parseFloat(resultView.locateResults[i][2])},
			map: map,
			id: i,
			icon: img,
		});
		const msg = getInfo(resultView.locateResults[i], "<b>This disposal takes: </b>");
		const mapLink = 
			"https://www.google.com/maps/dir/?api=1" +
			"&origin=" + crd.latitude + "%2C" + crd.longitude +
			"&destination=" + parseFloat(resultView.locateResults[i][1]) + "%2C" + parseFloat(resultView.locateResults[i][2]);
		addInfoWindow(markers[i], msg, mapLink);
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
		zoom: 16,
	});
	marker = new google.maps.Marker({
			position: { lat: crd.latitude, lng: crd.longitude},
			map: map,
			icon: "images/user.png",
		});

	const locationButton = document.createElement("button");
	locationButton.style.marginBottom = "8px";
	locationButton.style.backgroundColor = "#28a745";
	locationButton.style.color = "#fff";
	locationButton.style.fontFamily = "Roboto,Arial,sans-serif";
	locationButton.style.fontSize = "16px";
	locationButton.style.border = "2px solid #28a745";
	locationButton.style.borderRadius = "3px";
	locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
	locationButton.style.cursor = "pointer";
	locationButton.textContent = "Pan to Current Location";
	locationButton.classList.add("custom-map-control-button");
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(locationButton);
	locationButton.addEventListener("click", function() {map.setCenter({ lat: crd.latitude, lng: crd.longitude})});

}
let legend = document.getElementById("legend");
function initLegend(){ 
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}

function submitListener(){
	const centerControlDiv = document.createElement("div");

	CenterControl(centerControlDiv, map);
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

	var listener1 = google.maps.event.addListener(map, 'click', function(event) {
		//make sure to record lat and long to put into database
		//REMOVE
		//alert(event.latLng.lat() + ", " + event.latLng.lng());
		const img = findIcon2(resultView.submission);
		addMarker(event.latLng, map, img);
    });
}
function delListener(){
	google.maps.event.removeListener(listener1);
}
//adds marker to the map and then to database
function addMarker(loc, map, img) {
	resultView.submission.latitude = loc.lat();
	resultView.submission.longitude = loc.lng();
	if (subSelected == true){
		subMarker.setPosition(loc);
		subMarker.setIcon(img);
	}
	else {
		subSelected = true;
		subMarker = new google.maps.Marker({
			position: loc,
			icon: img,
			map: map,
		});
	}
	
}
function CenterControl(controlDiv, map) {
  // Set CSS for the control border.
  const controlUI = document.createElement("div");

  controlUI.style.backgroundColor = "#FF0000";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Click to submit selected location";
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  const controlText = document.createElement("div");

  controlText.style.color = "#fff";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "20px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Submit";
  controlUI.appendChild(controlText);
  
  controlUI.addEventListener("click", () => {
	submitHelper();
  });
}
function submitHelper(){
	const data = resultView.submission;
	if(subSelected == false){
		alert("No location selected. Please select a location from the map to submit.");
	}
	else {
		// Add one line to the sheet
		fetch("https://sheet.best/api/sheets/097b1968-d3ab-42f9-8497-aacb94b246b6", {
		  method: "POST",
		  mode: "cors",
		  headers: {
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify(data),
		})
		  .then((r) => r.json())
		  .then((data) => {
			// The response comes here
			alert("Disposal location submitted! Returning to main page.")
			resetSubmit();
			resultView.curPage = 'main';
			resultView.hideMap();
			subSelected = false;
		  })
		  .catch((error) => {
			// Errors are reported there
			console.log(error);
		  });
	}
	
}
function resetSubmit(){
	resultView.submission.latitude = 0;
	resultView.submission.longitude = 0;
	resultView.submission.landfill = 'TRUE';
	resultView.submission.recycle = 'FALSE';
	resultView.submission.bottle = 'FALSE';
	resultView.submission.metals = 'FALSE';
	resultView.submission.chemical = 'FALSE';
	resultView.submission.electronic = 'FALSE';
}
// Sets the map on all markers in the array.
function setMapOnAll(map,m) {
  for (let i = 0; i < markers.length; i++) {
    m[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers(m) {
  setMapOnAll(null,m);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers(m) {
  hideMarkers(m);
  m = [];
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
function findIcon2(submission){
	var x;
	if(submission.landfill == "TRUE"){
		x = "images/landfill.png";
	}
	if(submission.recycle == "TRUE"){
		x = "images/recycle.png";
	}
	if(submission.bottle == "TRUE"){
		x = "images/bottles.png";
	}
	if(submission.metals == "TRUE"){
		x = "images/metals.png";
	}
	if(submission.chemical == "TRUE"){
		x = "images/chemicals.png";
	}
	if(submission.electronic == "TRUE"){
		x = "images/electronics.png";
	}
	return x;
}
// Marker Info
function getInfo(mark, msg){
	var arr = []
	if(mark[3] == "TRUE"){
		arr.push("Landfill");
	}
	if(mark[4] == "TRUE"){
		arr.push("Recyclables");
	}
	if(mark[5] == "TRUE"){
		arr.push("Bottles");
	}
	if(mark[6] == "TRUE"){
		arr.push("Metals");
	}
	if(mark[7] == "TRUE"){
		arr.push("Chemicals");
	}
	if(mark[8] == "TRUE"){
		arr.push("Electronics");
	}
	var addText = arr.join(", ")
	return msg + addText;
}
function addInfoWindow(marker, message, lnk) {
	const cont = 
		'<p>' + message + ' </p>' +
		'<a href="' + lnk + '" target="_blank" rel="noopener noreferrer"> Get Directions</a>'
	var infoWindow = new google.maps.InfoWindow({
		content: cont
	});

	google.maps.event.addListener(marker, 'click', function () {
		infoWindow.open(map, marker);
	});
}
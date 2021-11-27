var resultView = new Vue({
  el: '#app',
  data: {
    curPage: 'main',
    locateOptions: new Set(),
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
          .then(response => (handleSheetsResponse(response)));
    },

    //TODO | @RAUL: This function returns true or false depending on whether the given location is within this.locateDistance from the user
    //              Will return False when the given location is too far away.
    withinUserRange(lat, long) {
      return false;
    },

    handleSheetsResponse(response) {
      for (i = 0; i < Object.keys(response.data.values).length; ++i) {
        let valid = true;
        let options = ['landfill', 'recycle', 'bottle', 'can', 'chemical', 'electronic']

        //Check if types match user options
        for (j = 0; j < 6; ++j) {
          if (response.data.values[i][j + 3] == "TRUE" && !this.locateOptions.has(options[j])) {
            valid = false;
          }
          else if (response.data.values[i][j + 3] == "FALSE" && this.locateOptions.has(options[j])) {
            valid = false;
          }
        }

        //Check if distance is within preferred user range
        if (!withinUserRange(response.data.values[i][1], response.data.values[i][2])) {
          valid = false;
        }

        //Populate locateResults with valid locations
        if (valid) {
          this.locateResults.append(response.data.values[i]);
        }
      }
      console.log(this.locateResults)
    }

  }
})


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
const bellTower = { lat: 42.29208364363135, lng: -83.71624887321929 };
function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: bellTower,
		zoom: 20,
	});
	// this is just the center marker
	marker = new google.maps.Marker({
		position: { lat: 42.2920, lng: -83.71585 },
		map: map,
	});
	// loop through marker array
	for(var i = 0; i < disposals.length; i++) {
		markers[i] = new google.maps.Marker({
			position: disposals[i],
			map: map,
			id: i,
		});
		console.log("marker");
	};
}
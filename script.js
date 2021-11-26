window.googleDocCallback = function () { return true; };

var resultView = new Vue({
  el: '#app',
  data: {
    curPage: 'locate',
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

      
      /*axios
          .get('https://sheets.googleapis.com/v4/spreadsheets/1w8qms9wIXwbTyU_N0tBiNIii3t3-t_OIwmKTX6RSc08/values/', {
            headers: {
              'Authorization': `Bearer ya29.a0ARrdaM88XuuQ8BBTkPm1HjGAb4iSPAAHfwifqq8eqr1ncWIcXtmaMiolOR7FabS_dxpoVCmpgeeGIhga6h7DAbUQChcAIYrRDsCbQB2LLLP7rbHgydVXfcc8ZbfZgij4ih081fIIp-3XP-MCx_iKT3kQX1Wi&callback=googleDocCallback`,
              'content-type':'application/json',
            }
          })
          .then(response => (console.log(response)));
      */
    },

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
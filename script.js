var resultView = new Vue({
  el: '#app',
  data: {
    curPage: 'main',
    locateOptions: new Set(),
  },
  methods: {

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
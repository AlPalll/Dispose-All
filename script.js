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

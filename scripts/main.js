// Include the following line in the HTML file
// <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

var startLoc = ''; //NEEDS to be connected to html
const birdUrl='https://mds.bird.co/gbfs/louisville/free_bikes';
const limeUrl='https://data.lime.bike/api/partners/v1/gbfs/louisville/free_bike_status.json';
const boltUrl='https://bolt.miami/bolt2/lou/gbfs/en/free_bike_status.json';
const spinUrl='https://web.spin.pm/api/gbfs/v1/louisville/free_bike_status';

var startLoc = ''; //NEEDS to be connected to html
startLocLatLng = codeAddress(startLoc);

var urls = [birdUrl, limeUrl, boltUrl, spinUrl];
// Stores arrays of the data []
var data = [];

var i;
for (i = 0; i < urls.length; i++) {
    $('.btn').click(function(){
        $.ajax({
            url:urls[i],
            type:"GET",
            success: function(result){
                // var resultArray = [urls[i], result];
                data.push(result);
            },
            error:function(error){
                console.log(`Error ${error}`);
            }
        })
    })
}


var birdDistancePoint = distancesToList(data[0].data.bikes);
var limeDistancePoint = distancesToList(data[1].data.bikes);
var boltDistancePoint = distancesToList(data[2].data.bikes);
var spinDistancePoint = distancesToList(data[3].data.bikes);

var birdShortIndex = findShortestDistance(birdDistancePoint);
var limeShortIndex = findShortestDistance(limeDistancePoint);
var boltShortIndex = findShortestDistance(boltDistancePoint);
var spinShortIndex = findShortestDistance(spinDistancePoint);



// ______________________________________________________________________________________________________________
// Geocode
// ______________________________________________________________________________________________________________

var geocoder;
var map;
function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(38.2527, 85.7585);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function codeAddress(address) {
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == 'OK') {
        return results[0].geometry.location;
    //   map.setCenter(results[0].geometry.location);
    //   var marker = new google.maps.Marker({
    //       map: map,
    //       position: results[0].geometry.location
    //   });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// ______________________________________________________________________________________________________________
// Reverse Geocode
// ______________________________________________________________________________________________________________

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      center: {lat: 40.731, lng: -73.997}
    });
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;
  
    document.getElementById('submit').addEventListener('click', function() {
      geocodeLatLng(geocoder, map, infowindow);
    });
  }
  
  function geocodeLatLng(latlngStr, geocoder, map, infowindow) {
    var latlngStr = input.split(',', 2);
    var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          map.setZoom(11);
          var marker = new google.maps.Marker({
            position: latlng,
            map: map
          });
          infowindow.setContent(results[0].formatted_address);
          infowindow.open(map, marker);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

// ______________________________________________________________________________________________________________________________
// Distance functions
// ______________________________________________________________________________________________________________________________

function findDistance(latlng1, lat2, lon2) {
    lat1 = latlng1[0]
    lon1 = latlng1[1]
    var R = 6371e3; // metres
    var φ1 = toRadians(lat1);
    var φ2 = toRadians(lat2);
    var Δφ = toRadians(lat2-lat1);
    var Δλ = toRadians(lon2-lon1);

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return d;

  }

function toRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

  function distancesToList(currentData) {
    var outputList = [];
    for (var j = 0; j < currentData.length; j++) {
        var lat2 = currentData[j].lat;
        var lon2 = currentData[j].lng;
        var distance = findDistance(startLocLatLng, lat2, lon2);
        outputList.push([distance, lat2, lon2]);
    }
    return outputList;
  }

  function findShortestDistance(dataList) {
    var smallest = dataList[0][0]
    var minIndex = 0;
    for (var i = 0; i < dataList.length; i++) {
        if (dataList[i][0] < smallest) {
            smallest = dataList[i][0];
            minIndex = i;
        }
    }
    return minIndex;
  }
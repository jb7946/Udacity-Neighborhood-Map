//Instantiate map
var map;
function ViewModel() {

	var self = this;
	this.markers = [];
	this.searchText  = ko.observable("");


	//when a user clicks a map marker, this creates the div section
    this.buildMarkerInfo = function(marker, yelpInfo) {
      if (yelpInfo.marker != marker) {
			yelpInfo.setContent('<div>' + marker.name + '</div><br><pre></pre><br><br><br><br>');
        yelpInfo.marker = marker;
        // Hides the marker via listener
        yelpInfo.addListener('closeclick', function(){yelpInfo.marker = null;});
		$.ajax({
			method: "GET",
			headers: {"Accept":"*/*",
				"Authorization": "Bearer aBwOq5yTXUGotRULz8yTKOquqthW_h4M831CIKyX3b9aAbx-m7i8W-dPt6ZnoJ9VRiPksOYaVUSDAFWxCx4U4zPObHuFGkAllcLHPngXGa-PEjVBdRrrlxHnIlC-XHYx"},
			// Use this to get around the CORS issues with local testing
			url: "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/" + marker.idYelp,
			// Use this when not doing local testing
			//url: "https://api.yelp.com/v3/businesses/" + marker.idYelp,
			dataType: "json",
			// Build the Yelp Marker Info division if we get data back from Yelp
			success: function(businessDataJson) {
				// local testing only
				//console.log("name: " + businessDataJson.name + " is_closed: " + businessDataJson.is_closed)
				console.log(businessDataJson.name + ' ' + businessDataJson.url)
				// instead of true and false, convert to more readable text to inform user if business is open now
				if(businessDataJson.is_closed) {
					var storeOpen = ' Currently Closed '
				} else
					var storeOpen = ' Currently Open for Business'

				if(businessDataJson.rating > 1) {
					var ratingPlural = " stars "
				} else {
					var ratingPlural = " star "
				}

			 	yelpInfo.setContent(
					'<div> ' + marker.name + ' is ' + storeOpen + '</div>' +
		 			'<div> Cuisine: ' + businessDataJson.categories[0].title + '</div>' +
		 			'<div> Address: ' + businessDataJson.location.display_address + '</div>' +
					'<div> Contact: ' + businessDataJson.display_phone + '</div>' +
		 			'<div> Rating: ' + businessDataJson.rating + ratingPlural + ' from  ' + businessDataJson.review_count +' reviews</div>' +
					'<div> Cost: ' + businessDataJson.price + '</div>' +
		 			'<a href=' + businessDataJson.url + ' target=_blank>' +
	 				'Click to visit this business on Yelp.' +
		 			'</a>'
	 			);
			},
			error: function(e) {
				console.log("Yelp Response Fault: " + e.message)
				yelpInfo.setContent('<div>' + marker.name + '</div>' +'<div>Unable to retrieve Yelp information for this business.</div>');
			}
		});
		// Display the marker info division
        yelpInfo.open(map, marker);
      }
    };

		// Initialize the Map around my local Neighborhood
    this.initMap = function() {
    	map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 29.709076, lng: -95.461662},
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
			zoom: 15
    	});
    	var bounds = new google.maps.LatLngBounds();
	    this.markerInfoWindow = new google.maps.InfoWindow();
			//  Build the list from js/premiumRestaurants.js
	    for (var i = 0; i < topfive.length; i++) {
	    	var name = topfive[i].name;
	    	var cuisine = topfive[i].cuisine;
	    	var position = topfive[i].coord;
	    	var idYelp = topfive[i].idYelp;
			// Define a marker for each position from the premiumRestaurants.js position data
			var marker = new google.maps.Marker({
				map: map,
				name: name,
				cuisine: cuisine,
			  position: position,
			  idYelp: idYelp,
			  animation: google.maps.Animation.DROP,
			  id: i
			});
			// Define Map Marker
			this.markers.push(marker);
			// Define a click listener to open specific marker info window
        marker.addListener('click', function() {
				self.buildMarkerInfo(this, self.markerInfoWindow);
			});
        bounds.extend(this.markers[i].position);
	    }
			// reposition map around markers
	    map.fitBounds(bounds);
    };
		// function to show markers on map
    this.topLocationsShow = function(){
		self.buildMarkerInfo(this,self.markerInfoWindow);
		this.setAnimation(google.maps.Animation.BOUNCE);
		// Set the marker bounce duration
		setTimeout((function() {this.setAnimation(null);}).bind(this), 1000);
		};
    this.initMap();
    this.markerInfoWindow.close();
    this.topLocations = ko.computed(function() {
    	var bounds = new google.maps.LatLngBounds();
    	this.markerInfoWindow.close();
			// Define result array to define which list items are present via filter
    	var result = [];
				// loop through list to determine which markers match filter setting and display them
        for (var i = 0; i < this.markers.length; i++)
            if ((this.markers[i].cuisine.toUpperCase().includes(this.searchText().toUpperCase())) || (this.searchText() == "ANY")){
                result.push(this.markers[i]);
                this.markers[i].setVisible(true);
                bounds.extend(this.markers[i].position);
            }
            else{
                this.markers[i].setVisible(false);
						}
					// reposition map around markers
        	map.fitBounds(bounds);
        	return result;
        }, this);
}

function buildMap() {
    ko.applyBindings(new ViewModel());
}

function googleError() {
	alert("There was an issue when trying to load the Google map.");
}

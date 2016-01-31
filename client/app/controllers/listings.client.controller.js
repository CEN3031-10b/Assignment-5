angular.module('listings').controller('ListingsController', ['$scope', '$location', '$stateParams', '$state', 'Listings', 
  function($scope, $location, $stateParams, $state, Listings){
    $scope.find = function() {
      /* set loader*/
      $scope.loading = true;
	  $scope.markers = [];

      /* Get all the listings, then bind it to the scope */
      Listings.getAll().then(function(response) {
        $scope.loading = false; //remove loader
        $scope.listings = response.data;
		
		for(var i = 0; i < $scope.listings.length; ++i){
			if($scope.listings[i].coordinates){
				$scope.markers.push({
					id: i,
					title: $scope.listings[i].name,
					code: $scope.listings[i].code,
					address: $scope.listings[i].address,
					latitude: $scope.listings[i].coordinates.latitude,
					longitude: $scope.listings[i].coordinates.longitude,
					options: { draggable: true },
					show: false
				});
			}
		}
      }, function(error) {
        $scope.loading = false;
        $scope.error = 'Unable to retrieve listings!\n' + error;
      });
    };

    $scope.findOne = function() {
      debugger;
      $scope.loading = true;

      /*
        Take a look at 'list-listings.client.view', and find the ui-sref attribute that switches the state to the view 
        for a single listing. Take note of how the state is switched: 

          ui-sref="listings.view({ listingId: listing._id })"

        Passing in a parameter to the state allows us to access specific properties in the controller.

        Now take a look at 'view-listing.client.view'. The view is initialized by calling "findOne()". 
        $stateParams holds all the parameters passed to the state, so we are able to access the id for the 
        specific listing we want to find in order to display it to the user. 
       */

      var id = $stateParams.listingId;

      Listings.read(id)
              .then(function(response) {
                $scope.listing = response.data;
				
				// save a copy of the selected listing for editing
				if($state.current.name == 'listings.edit'){
					$scope.edited_listing = {
						_id: $scope.listing._id,
						__v: $scope.listing.__v,
						name: $scope.listing.name,
						code: $scope.listing.code,
						address: $scope.listing.address,
						coordinates: $scope.listing.coordinates || {latitude:"", longitude:""},
						created_at: $scope.listing.created_at,
						updated_at: $scope.listing.updated_at
					};
				}
                
				$scope.loading = false;
              }, function(error) {  
                $scope.error = 'Unable to retrieve listing with id "' + id + '"\n' + error;
                $scope.loading = false;
              });
    };  

    $scope.create = function(isValid) {
      $scope.error = null;

      /* 
        Check that the form is valid. (https://github.com/paulyoder/angular-bootstrap-show-errors)
       */
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      /* Create the listing object */
      var listing = {
        name: $scope.name, 
        code: $scope.code, 
        address: $scope.address
      };

      /* Save the article using the Listings factory */
      Listings.create(listing)
              .then(function(response) {
                //if the object is successfully saved redirect back to the list page
                $state.go('listings.list', { successMessage: 'Listing succesfully created!' });
              }, function(error) {
                //otherwise display the error
                $scope.error = 'Unable to save listing!\n' + error;
              });
    };

    $scope.update = function(isValid) {
      /*
        Fill in this function that should update a listing if the form is valid. Once the update has 
        successfully finished, navigate back to the 'listing.list' state using $state.go(). If an error 
        occurs, pass it to $scope.error. 
       */
	   $scope.loading = true;
		if (!isValid) {
			$scope.$broadcast('show-errors-check-validity', 'articleForm');
			$scope.loading = false;
			return false;
		}
		
		Listings.update($scope.edited_listing._id, $scope.edited_listing)
				.then(function(response){
					$scope.loading = false;
					$state.go('listings.list', { successMessage: 'Edited listing succesfully!' });
				}, function(error){
					$scope.loading = false;
					$scope.error = 'Unable to update listing!\n' + error;
					console.log(error);
				});
		
    };

    $scope.remove = function() {
      /*
        Implement the remove function. If the removal is successful, navigate back to 'listing.list'. Otherwise, 
        display the error. 
       */
	  $scope.loading = true;
	  Listings.delete($scope.listing._id)
	  	.then(function(response){
	  		$scope.loading = false;
			$scope.listing = {};
	  		$state.go('listings.list', { successMessage: 'Deleted listing succesfully!' });
	  	}, function(error){
	  		$scope.loading = false;
	  		$scope.error = 'Unable to delete listing!\n' + error;
	  		console.log(error);
	  	});
    };

    /* Bind the success message to the scope if it exists as part of the current state */
    if($stateParams.successMessage) {
      $scope.success = $stateParams.successMessage;
    }

    /* Map properties */
    $scope.map = {
      center: {
        latitude: 29.65163059999999,
        longitude: -82.3410518
      }, 
      zoom: 14
    }
	
	/* 
		Adapted from angular google maps example: 
		http://angular-ui.github.io/angular-google-maps/#!/api/window 
	*/
	$scope.prev_click = {};
	$scope.onClick = function(marker, eventName, model) {
		$scope.prev_click.show = false;
		model.show = !model.show;
		$scope.prev_click = model;
	};
	
  }
]);
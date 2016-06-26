//Creates fake entries for Learners LogBook. 
//Gets a random suburb and then request google API for the time it will take to traverse that distance during random time interval
// CREATED PRIOR TO INTRO TO PROGRAMMING ; Realise my code is very inefficient after INTRO TO PROGRAMMING
//<script>
console.log('script loaded');
//Running total
var totalSecondsDriven = 0;

//Odometer counters
var odometerConstant = 0;
var odometerCounter = 0;
var odometerStart = 174600;

// CSV array
var csv_array = [];
csv_array.push(['date', 'timeStart', 'timeFinish', 'drivingTimeThisTrip', 'drivingTimeTotal', 'null', 'null', 'odometerStart', 'odometerFinish']);

function submitRequest() {
  $.get("https://raw.githubusercontent.com/mr360/elf-logbook-generator/master/suburbs.txt", function(data) {
    //Add suburb list to array & randomise the selection of the destination suburb
	var destinationSuburbs = data.split(',');
	var randSuburb = destinationSuburbs[Math.floor(Math.random() * destinationSuburbs.length)];
	
	// Converts inputted time (24hr) to unix timestamp (uses date.js library)
	var today = new Date();
	var dateFixed = (today.getMonth() + 1) + ' ' + (today.getDate() + 1) + ' ' + (today.getFullYear());
	
	// Generates fake hour time between 17:00 - 18:40
	var hours = (17) + Math.floor(Math.random() * 1.5) + 0 ;
	var minutes = (0) + Math.floor(Math.random() * 40) + 0 ;
	var unixTime = Date.parse(dateFixed + ' ' + (hours + ':' + minutes + ':' + minutes)) / 1000;
	
	// Converts unix time to 10:14 format time
	function unixConversion (unixTime) {
		var date = new Date(unixTime * 1000);
		var hours = date.getHours();
		var minutes = "0" + date.getMinutes();
		var formattedTime = (hours - 12) + ':' + minutes.substr(-2); 
		return formattedTime;
		}

	// Constructs the Google api directions request link
	var orgin = document.getElementsByName("orgin")[0].value;
	var destination = randSuburb;
	var units = "metric";
	var departureTime = unixTime;
	var googleKey = document.getElementsByName("googleKey")[0].value;
	var requestLink = "https://maps.googleapis.com/maps/api/directions/json?origin="+orgin+"&destination="+destination+"&units="+units+"&departure_time="+departureTime+"&key="+googleKey;

	// Parse the JSON file requested  (This section suffers from cross-domain error! - Disable cross-domain )
	var json = jQuery.parseJSON(
        jQuery.ajax({
            url: requestLink, 
            async: false,
            dataType: 'json'
        }).responseText
    );
	
	// Process log date data
	var dateLicenceRecieved = document.getElementsByName("dateLicenceRecieved")[0].value;
	if (dateLicenceRecieved != dateLogEntry) {
		var dateLogEntry = moment(01-01-16).subtract(1, "days").format("DD-MM-YY");								
		console.log(dateLogEntry);
	
		//Store travel distances and time in variable
		var travelDistance = json.routes[0].legs[0].distance.value;
		var travelTime = json.routes[0].legs[0].duration.value;
		
		//Process odometer log data
		odometerConstant=odometerStart;
		odometerConstant += Math.round( ((Math.floor(Math.random() * 38500) + 25600) / 1000));								
		odometerCounter = Math.round((travelDistance / 1000));
		odometerStart = odometerConstant + odometerCounter;


		//Process time period driven											
		var startTravelTime = (hours - 12) + ':' + minutes;								// hours-12 = display time in 10:30:23 format
		var finishTravelTime = unixConversion((unixTime + travelTime));
		
		// Converts seconds total to hh:mm format (fixes 24hr reset issue)
		function secondsToHrsMin(totalSecondsDriven) {
			var hrs = parseInt(((totalSecondsDriven / 60) / 60), 10); // timestap 23.999777
			var min = parseInt((((totalSecondsDriven / 60) / 60) - hrs) * 60);
			var totalHrsMin = 0;
			if (min === 0 || min == 1 || min == 2 || min == 3 || min == 4 || min == 5 || min == 6 || min == 7 || min == 8 || min == 9 ) {
				totalHrsMin = hrs + ':0' + min;
			}
			else {
				totalHrsMin = hrs + ':' + min;
			}
			return totalHrsMin;
		}
	
		//Process hours driven and total hours driven (in minutes)
		var timeDriven = new Date(travelTime * 1000).toISOString().substr(11, 8);
		totalSecondsDriven += travelTime;
		var totalHrsMinDriven = secondsToHrsMin(totalSecondsDriven);
		
		
		//Pop process data into array
		//[date,timeStart,timeFinish,drivingTimeThisTrip,drivingTimeTotal,null,null,odometerStart,odometerFinish]
		csv_array.push([dateLogEntry, startTravelTime, finishTravelTime, timeDriven, totalHrsMinDriven, 0, 0, odometerConstant, odometerStart]);
		console.log(csv_array);
	}
	// Save generated data in CSV format
	//var csv_array = [["name1", 2, 3], ["name2", 4, 5], ["name3", 6, 7], ["name4", 8, 9], ["name5", 10, 11]];
	var fname = "IJGResults";

	var csvContent = "data:text/csv;charset=utf-8,";
	$("#pressme").click(function(){
		csv_array.forEach(function(infoArray, index){
			dataString = infoArray.join(",");
			csvContent += dataString+ "\n";
		});

		var encodedUri = encodeURI(csvContent);
		window.open(encodedUri);
	});
	
	/*
	//Test script (time logging)
	console.log('TimeLeftHouse:'+startTravelTime);
	console.log('TimeReachDestination:'+finishTravelTime);
	//Test json parser
 	console.log('TravelTime:'+travelTime);
  	console.log('TravelDistance:'+travelDistance);
	// Test date&time
	console.log('RequestLink:'+requestLink);
	console.log('Unix Time:'+unixTime); 
    // Test the randomisation of suburbs	
	console.log('RandomSuburb:'+randSuburb);
	//Test script (hours logging)
	console.log('CurrentTripHrsDriven:'+timeDriven);
	console.log('TotalSecondsDriven:'+totalSecondsDriven);
	console.log('TotalHrsMinDriven:'+totalHrsMinDriven);
	//Test Odometer
	console.log('OdometerConstant(strt)'+odometerConstant);
	console.log('OdometerCounter'+odometerCounter);
	console.log('OdometerStart(finsh)'+odometerStart);
	*/
    }); 
}


//</script>
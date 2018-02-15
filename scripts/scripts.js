
//get user location from input, user date

const myApp = {};

//takes userlocation and user date from form submission to submit to ticketgmaster
//looks for events in ticketmaster based on location and date
myApp.getTicketMasterEvents = (userLocation, userStartDate, userEndDate) => {
    console.log("were in ticketMaster");
    //ticketmaster API
        $.ajax({
            url: "https://app.ticketmaster.com/discovery/v2/events",
            dataType: "json",
            method: "GET",
            data: {
                apikey: "7elxdku9GGG5k8j0Xm8KWdANDgecHMV0",
                format: "jsonp",
                city: userLocation,
                classificationName: "music",
                startDateTime: `${userStartDate}T12:30:00Z`,
                endDateTime: `${userEndDate}T23:30:00Z`
                
            }
        }).then(function(res){
                const events = res._embedded.events;

                console.log(events);

                console.log(events[0].name)

                let displayedEventInfo = events
                    .filter(item => item._embedded.attractions !== undefined)
                    .map(function(item){
                        return {
                            name: item._embedded.attractions[0].name,
                            startDate: item.dates.start.localDate,
                            url: item.url, 
                            venue: item._embedded.venues[0].name
                        }
                    })
                console.log(displayedEventInfo);

            });
}

// //spotify API
// let headers = {};

// $.ajax({
//     url: "http://proxy.hackeryou.com",
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//     },
//     data: JSON.stringify({
//         reqUrl: 'https://accounts.spotify.com/api/token',
//         params: {
//             grant_type: 'client_credentials'
//         },
//         proxyHeaders: {
//             "Authorization": "Basic YzExYWIyNTAxYjA0NDg2YjhlN2M2MzJjYmIxM2M1NjQ6ODBkZDZkZWUwYWMyNGZiNzk2YTc3MDcwYWY3NmMxMjY="
//         }
//     })
// }).then(function (res) {
//     // console.log(res);
//     headers = {
//         "Authorization": res.token_type + " " + res.access_token
//     }



//     let url = "https://api.spotify.com/v1/";


//     $.ajax({
//         url: url + "search",
//         method: "GET",
//         headers: headers,
//         dataType: "json",
//         data: {
//             type: "artist",
//             q: "Drake"
//         }
//     }).then(function (res) {
//         console.log(res);
//     });


// });



myApp.formSubmit = function() {
    $("form").on("submit", function(e){
        e.preventDefault();
        let userLocation = $("input[type=text]").val();
        console.log(userLocation);

        let userStartDate = $(".userStartDate").val();
        console.log(userStartDate);

        let userEndDate = $(".userEndDate").val();
        console.log(userEndDate);

        myApp.getTicketMasterEvents(userLocation, userStartDate, userEndDate);

    });
}


$(function (){
    myApp.formSubmit();
})


//get back all the events with thte tag of music

//retrieve artists name and store in container on html

//connect artist name, and search for artist ID on spotify

//pull top songs from artist, and display for user











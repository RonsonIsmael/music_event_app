
//get user location from input, user date

const myApp = {};

//takes userlocation and user date from form submission to submit to ticketgmaster
//looks for events in ticketmaster based on location and date
myApp.getTicketMasterEvents = (userLocation, userStartDate, userEndDate) => {
    // console.log("were in ticketMaster");
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
                myApp.getEventInfo(res);
        });
}

myApp.getEventInfo = function(res) {
                const events = res._embedded.events;

                // console.log(events);

                // console.log(events[0].name)

                let eventInfo = events
                    .filter(item => item._embedded.attractions !== undefined)
                    .map(function (item) {
                        return {
                            name: item._embedded.attractions[0].name,
                            startDate: item.dates.start.localDate,
                            url: item.url,
                            venue: item._embedded.venues[0].name
                        }
                    })
                // console.log(eventInfo);
                myApp.setupSpotify(eventInfo);  

}

// //spotify API
let headers = {};

myApp.setupSpotify = function(eventInfo) {
    $.ajax({
        url: "http://proxy.hackeryou.com",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: JSON.stringify({
            reqUrl: 'https://accounts.spotify.com/api/token',
            params: {
                grant_type: 'client_credentials'
            },
            proxyHeaders: {
                "Authorization": "Basic YzExYWIyNTAxYjA0NDg2YjhlN2M2MzJjYmIxM2M1NjQ6ODBkZDZkZWUwYWMyNGZiNzk2YTc3MDcwYWY3NmMxMjY="
            }
        })
    }).then(function (res) {
        // console.log(res);
        headers = {
            "Authorization": res.token_type + " " + res.access_token
        }
        myApp.getArtistID(eventInfo);
    });
      
}

myApp.getArtistID = function(eventInfo) {

            // console.log(eventInfo);

            const getResponses = function(artist) {
                let url = "https://api.spotify.com/v1/";
               return $.ajax({
                   url: url + "search",
                   method: "GET",
                   headers: headers,
                   dataType: "json",
                   data: {
                       type: "artist",
                       q: artist.name,
                       limit: 1
                   }
                });
            }

            const responses = [];
            eventInfo.forEach(function(item){
                responses.push(getResponses(item));
            });

            $.when(...responses) 
                .then((...args) => {
                    //args is the artist information
                    // console.log(args);
                   args = args.map(arg => arg[0].artists.items);
                   args = args.filter(item => item.length > 0);
                   artistID = args.map(arg => arg[0].id);
                   //this args represents the artist id
                //    console.log(args);   
                    myApp.getArtistTracks(artistID, eventInfo);
                })
}




//using arists's id, we look for the top tracks
myApp.getArtistTracks = function(id, eventInfo) {

    //function to be used to run url from id to get sets of top tracks per artist
    const getTracks = function(url) {
        return $.ajax({
            url: url,
            method: "GET",
            headers: headers,
            dataType: "json"
        })
    }
    
    // console.log(id);
    //empty array that we will stuff the tracks into
    const topTracks = [];
    //per artist id, we will run the function get tracks
    id.forEach((item) => {
        let url = `https://api.spotify.com/v1/artists/${item}/top-tracks?country=CA`;
        // console.log(url);
        //pushes each set of tracks into topTracks
        topTracks.push(getTracks(url));
    })

    // console.log(topTracks);

    //whait all items of topTracks to be done done loading, 
    $.when(...topTracks)
        //then takes all of the resolved tracks and stores them as arguements
        .then((...args) => {
            // console.log(args);
            args = args.map((tracks) => {
                return tracks[0].tracks;
            })
            // console.log(args);
            args = args.map((tracks) => {
                return tracks.map((item) => {
                    return item.uri;
                })
            })
            // console.log(args);
            myApp.displayOnScreen(topTracks, eventInfo);
        })

       

        // const responses = [];
        // eventInfo.forEach(function(item){
        //     responses.push(getTracks(item));
        // });
    
        // $.when(...responses) 
        //     .then((...args) => {
        //         console.log(args);
        //     //    args = args.map(arg => arg[0].artists.items);
        //     //    args = args.filter(item => item.length > 0);
        //     //    artistID = args.map(arg => arg[0].id);
        //     //    console.log(args);     
        //     })
    // }
}
 
             
        //        let url = "https://api.spotify.com/v1/";
        //        $.ajax({
        //            url: url + "search",
        //            method: "GET",
        //            headers: headers,
        //            dataType: "json",
        //            data: {
        //                type: "artist",
        //                q: artist.name,
        //                limit: 1
        //            }
        //        }).then(function (res) {
        //        });
              

        //    }).then(function(){

        //    })
        // artistsWithIDs = artistsWithIDs.filter(artist => {
        //     artist.artists.items.length !== 0;
        // });

//         console.log(artistsWithIDs);
// }

// eventInfo.forEach(function (artist) {
    // console.log(artist.name);


// });

//displays information on screen
myApp.displayOnScreen = function(tracks, artistInfo) {
    
    //adding the tracks array to the object
    artistInfo.forEach(function(item){
        tracks.forEach(function(track){
            item.trackList = track.responseJSON.tracks
        });
    });
    console.log(artistInfo);

}


myApp.formSubmit = function() {
    $("form").on("submit", function(e){
        e.preventDefault();
        let userLocation = $("input[type=text]").val();
        // console.log(userLocation);

        let userStartDate = $(".userStartDate").val();
        // console.log(userStartDate);

        let userEndDate = $(".userEndDate").val();
        // console.log(userEndDate);

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











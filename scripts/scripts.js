
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
                

                if (res._embedded === undefined) {
                    console.log("No events available in your area");
                    $(".error-message").addClass("error-message-display");
                    $(".masterContainer").html("");
                }
                else {
                    
                    $(".error-message").removeClass("error-message-display");

                }

                const events = res._embedded.events;

                console.log(events);

                // console.log(events[0].name)

                let eventInfo = events
                    .filter(item => item._embedded.attractions !== undefined)
                    .map(function (item) {
                        return {
                            name: item._embedded.attractions[0].name,
                            startDate: item.dates.start.localDate,
                            url: item.url,
                            venue: item._embedded.venues[0].name,
                            image: item.images[0].url
                        }
                    })
                // console.log(eventInfo);
                myApp.setupSpotify(eventInfo);  

}

// //spotify API
let headers = {};

myApp.setupSpotify = function(eventInfo) {
    $.ajax({
        url: "https://proxy.hackeryou.com",
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
            console.log(args);
            args = args.map(arg => arg[0].artists.items);
            console.log(args);
            // artistID = args.map(arg => arg[0].id);
            let finalInfo = eventInfo.map((item, i) => {
                return {
                    artist: item,
                    spotify: args[i]
                }
            })
            
            console.log(finalInfo);
            finalInfo = finalInfo.filter(item => item.spotify.length > 0);

            console.log(finalInfo);
            
            //this args represents the artist id
            myApp.displayOnScreen(finalInfo);
        })
}




//displays information on screen
myApp.displayOnScreen = function(finalInfo) {
    // console.log("display on te screen");
   

    $(".masterContainer").html("");

    finalInfo = finalInfo.map((item) => {
        return {
            name: item.artist.name,
            startDate: item.artist.startDate,
            image: item.artist.image,
            url: item.artist.url,
            venue: item.artist.venue,
            uri: item.spotify[0].uri
        }
    });

    console.log(finalInfo)

    finalInfo = finalInfo.reduce(function (accumulator, current) {
        if (checkIfAlreadyExist(current)) {
            return accumulator
        } else {
            return accumulator.concat([current]);
        }

        function checkIfAlreadyExist(currentVal) {
            return accumulator.some(function (item) {
                return (item.name === currentVal.name)
            });
        }
    }, []);

    console.log(finalInfo);

    finalInfo.forEach((item) => {
        const playlist = item.uri;
        $(".masterContainer").append(`<div class='container container-${item.name}' id="card">
                                            <div class="artistInfoContainer">
                                                
                                                <div class="artist-title">
                                                    <h2>${item.name}</h2>
                                                </div>
                                                <div class="date-location">
                                                    <h3>${item.venue}</h3>
                                                    <div class="ticket-info">
                                                        <p>${item.startDate}</p>
                                                        <a href="${item.url}" target="_blank"><i class="fa fa-ticket" aria-hidden="true"></i></a>
                                                    </div>
                                                </div>
                                                <div class="imgHolder">
                                                    <img src="${item.image}" alt="picture of ${item.name}">
                                                </div>
                                            </div>
                                        <div class="spotifyContainer">
                                            <iframe class="tracks" src="https://open.spotify.com/embed?uri=${playlist}&amp;theme=white" width="100%" height="600" frameborder="0" allowtransparency="true"></iframe>
                                        </div>
                                    </div>`);
        console.log(item);

    })
}

myApp.smoothScroll = function () {
    const scroll = setTimeout(function () {
        $('html, body').animate({
            scrollTop: $("#card").offset().top
        }, 1000);
        $(".type-it").text("Submit");
    }, 4000);

}  
 

myApp.formSubmit = function() {
    $("form").on("submit", function(e){
        e.preventDefault();
        $(".type-it").text("Processing...");
        // myApp.typeIt(); 
        myApp.smoothScroll();
        // myApp.fadeIn();
        
        let userLocation = $("input[type=text]").val();
        // console.log(userLocation);

        let userStartDate = $(".userStartDate").val();
        // console.log(userStartDate);

        let userEndDate = $(".userEndDate").val();
        // console.log(userEndDate);

        myApp.getTicketMasterEvents(userLocation, userStartDate, userEndDate);
    });

    $(".arrowHolder").on("click", function(){
        $("form").slideToggle({
            duration: 500
        });

        $(".up, .down").toggleClass("displayNone");
    });
}


$(function (){
    myApp.formSubmit();
})


//get back all the events with thte tag of music

//retrieve artists name and store in container on html

//connect artist name, and search for artist ID on spotify

//pull top songs from artist, and display for user











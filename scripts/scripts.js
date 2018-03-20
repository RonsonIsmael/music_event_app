
const myApp = {};

//queries the TicketMaster API for music events in ticketmaster based on location and date
myApp.getTicketMasterEvents = (userLocation, userStartDate, userEndDate) => {
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

//Checks if there are music events in the area
//Checks if the event contains the attractions object
//If yes, returns an object with information about the event
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
                myApp.setupSpotify(eventInfo);  

}

let headers = {};

//Authorization for Spotify
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
        headers = {
            "Authorization": res.token_type + " " + res.access_token
        }
        myApp.getArtistID(eventInfo);
    });
      
}

//Searches the spotify API for an artist and returns the first artist found matching the query
myApp.getArtistID = function(eventInfo) {

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
            args = args.map(arg => arg[0].artists.items);
            let finalInfo = eventInfo.map((item, i) => {
                return {
                    artist: item,
                    spotify: args[i]
                }
            })
    
            finalInfo = finalInfo.filter(item => item.spotify.length > 0);
            myApp.displayOnScreen(finalInfo);
        })
}




//displays information on screen
myApp.displayOnScreen = function(finalInfo) {
   
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

    //remove duplicates
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

    //appending artist information and spotify to the screen
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
    })
}

//smooth scroll with delay
myApp.smoothScroll = function () {
    const scroll = setTimeout(function () {
        $('html, body').animate({
            scrollTop: $("#card").offset().top
        }, 1000);
        $(".type-it").text("Submit");
    }, 4000);

}  
 
//retrieves user input information on submit
myApp.formSubmit = function() {
    $("form").on("submit", function(e){
        e.preventDefault();
        $(".type-it").text("Processing...");
        myApp.smoothScroll();
        
        let userLocation = $("input[type=text]").val();

        let userStartDate = $(".userStartDate").val();

        let userEndDate = $(".userEndDate").val();

        myApp.getTicketMasterEvents(userLocation, userStartDate, userEndDate);
    });

    //toggles the input container
    $(".arrowHolder").on("click", function(){
        $("form").slideToggle({
            duration: 500
        });

        $(".up, .down").toggleClass("displayNone");
    });
}

//document ready
$(function (){
    myApp.formSubmit();
})













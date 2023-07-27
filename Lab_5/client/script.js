let addBtn, putBtn, searchBtn;
let sportsmanId;
let token = null;

window.onload = async function(){
    let body = {query:`
            {
                sportsmans {
                    id
                    name
                    country
                    podiums
                    champion_wins
                }
            }
            `};

    const data = await clientRequest("/", "POST", body);

    let sportsmans = data.data.sportsmans;
    console.log(data.data.sportsmans);

    for (let i = 0; i < sportsmans.length; i++){
        getCard(sportsmans[i]);
    }

   addBtn = document.getElementById("btnID").onclick = async function () {
        let sportsman = {};
        sportsman.name = document.getElementById("name").value;
        sportsman.country = document.getElementById("country").value;
        sportsman.podiums = document.getElementById("wins").value;
        sportsman.champion_wins = document.getElementById("champ_wins").value;

        let body = {query:`
                    mutation {
                        createSportsman(input:{
                            name: "${sportsman.name}"
                            country: "${sportsman.country}"
                            podiums: ${sportsman.podiums}
                            champion_wins: ${sportsman.champion_wins}
                        })
                        {
                            id
                            name
                            country
                            podiums
                            champion_wins
                        }
                    }`};

        const response = await clientRequest("/", "POST", body);

        let newSportsman = response.data.createSportsman;
        console.log(response);


        //getCard(newSportsman);
        if (newSportsman === null){
            alert("Ошибка 401, пользователь не авторизован");
        }else {
            getCard(newSportsman);
            //console.log(response);
        }
   };

    putBtn = document.getElementById("updateData").onclick = async function () {
        let sportsman = {};

        sportsman.id = sportsmanId;
        sportsman.name = document.getElementById("nameUpdate").value;
        sportsman.country = document.getElementById("countryUpdate").value;
        sportsman.podiums = document.getElementById("winsUpdate").value;
        sportsman.champion_wins = document.getElementById("champ_winsUpdate").value;

        let body = {query:
                `mutation {
                    updateSportsman(input:{
                        id: "${sportsman.id}"
                        name: "${sportsman.name}"
                        country: "${sportsman.country}"
                        podiums: ${sportsman.podiums}
                        champion_wins: ${sportsman.champion_wins} 
                    })
                    {
                        id
                        name
                        country
                        podiums
                        champion_wins
                    }
                }
                `
            };

        const response = await clientRequest(`/`, "POST", body);

        let updateSportsman = response.data.updateSportsman;

        if (updateSportsman === null) {
            alert("Ошибка 401, пользователь не авторизован");
        }else {
            const elem = document.getElementsByClassName(sportsmanId.toString())[0];
            const elements = document.getElementsByClassName("sportsman-card-fxv");

            for (let i = 0; i < elements.length; i++){
                if (elements[i] === elem){
                    getCard(updateSportsman, i);
                }
            }
        }
    };

    searchBtn = document.getElementById("searchSportsmanBtn").onclick = async function () {
         let filterObject = {};

         filterObject.country = document.getElementById("countryFilter").value;
         filterObject.firstValue = document.getElementById("first_number").value;
         filterObject.secondValue = document.getElementById("second_number").value;
         filterObject.sortParam = document.getElementById("sortParamSelect").value;
         console.log(filterObject);

         let body = { query:`
            mutation {
                sortSportsmans (input: {
                    countryFilter: "${filterObject.country}"
                    firstValue: ${filterObject.firstValue}
                    secondValue: ${filterObject.secondValue}
                    sortParam: "${filterObject.sortParam}"
                })
                {
                    id
                    name
                    country
                    podiums
                    champion_wins
                }
            }`
         };

         const response = await clientRequest('/', "POST", body);
         console.log(response);

         let sportsmans = response.data.sortSportsmans;
         document.getElementById('sportsmans').innerHTML = '';
         for (let i = 0; i < sportsmans.length; i++) {
             getCard(sportsmans[i]);
         }
    };
};

async function Delete (id){
    let body = {query: `
            mutation {
                deleteSportsman(input: {
                    id: "${id}"
                })
                {
                    id
                }
            }
    `};

    const response = await clientRequest(`/`, "POST", body);
    let deletedId = response.data.deleteSportsman;
    console.log(response);
       if (deletedId !== null)
        document.getElementsByClassName(deletedId.id.toString())[0].remove();
    else {
        alert("Ошибка 401, пользователь не авторизован");
    }
}

function Update(id, name, country, wins, ch_wins) {
    sportsmanId = id;
    document.getElementById("nameUpdate").value = name;
    document.getElementById("countryUpdate").value = country;
    document.getElementById("winsUpdate").value = wins;
    document.getElementById("champ_winsUpdate").value = ch_wins;
}


async function auth(email, password, flag = false) {
    const user = {};
    user.email = email;
    user.password = password;

    console.log(user);
    let responseData;

    if (flag) {
        console.log("reg");

        let body = {query: `
            mutation {
                registerUser( input: {
                    email: "${user.email}"
                    password: "${user.password}"
                })
                {
                    message
                }
            }
        `};

        let response = await clientRequest("/", "POST", body);

        //console.log(response.data.registerUser.message);
        document.getElementById('reg-auth-Modal').modal = "hide";

        responseData = response.data.registerUser;

    } else {
        console.log("auth");
        let body = {query: `
            mutation {
                loginUser( input: {
                    email: "${user.email}"
                    password: "${user.password}"
                })
                {
                    message
                    token
                }
            }
        `};

        let response = await clientRequest("/", "POST", body);
        console.log(response.data.loginUser);

        responseData = response.data.loginUser;
        //console.log(get_cookie("token"));
        //token = response.token;
    }

    if(responseData.message !== null) {
        document.getElementById('warning').style.display = "block";
        document.getElementById('warning').innerText = responseData.message;
        document.getElementById('auth-reg').style.display = "none";
    }else {
        document.getElementById('auth-reg').style.display = "block";

        if (flag)
            document.getElementById('auth-reg').innerText = "The user is registered";
        else {
            document.getElementById('auth-reg').innerText = "The user is logged in";
            if (responseData.token !== null){
                token = responseData.token;
            }

            let date = new Date(Date.now() + 3600e3);
            date = date.toUTCString();
            document.cookie = "Token" + '=' + token + "; path=/; expires="+ date ;

        }
        document.getElementById('warning').style.display = "none";

        document.getElementById('passwordField').value = "";
        document.getElementById('emailField').value = "";
    }

}

function get_cookie ( cookie_name )
{
    let results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

    if ( results )
        return ( unescape ( results[2] ) );
    else
        return null;
}

async function clientRequest(url, method, data = null) {
    try {
        let headers = {};
        if (get_cookie("Token")){
            headers['Authorization'] = get_cookie("Token");
        }

        let body;

        if (data) {
            headers['Content-type'] = 'application/json';
            body = JSON.stringify(data);
        }

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });

        return await response.json();
    } catch (e) {
        console.warn(e.message);
    }
}

function getCard(sportsman, position = null) {
    if (position === null) {
        const x = ` <div class="col-6 py-md-2 ${sportsman.id} sportsman-card-fxv">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title" id="name">${sportsman.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="country">${sportsman.country}</h6>

                                <div id="wins">Podiums: ${sportsman.podiums}</div>
                                <div id="champ_wins">Championships wins: ${sportsman.champion_wins}</div>

                                <hr>

                                <button type="button" class="btn btn-danger" id="deleteBtn" onclick="Delete('${sportsman.id}')">Delete</button>
                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal" id="putBtn" onclick="Update('${sportsman.id}','${sportsman.name}','${sportsman.country}', '${sportsman.podiums}', '${sportsman.champion_wins}')">Update</button>
                            </div>
                        </div>
                    </div>`;
        document.getElementById('sportsmans').innerHTML = document.getElementById('sportsmans').innerHTML + x;
    }else{
        document.getElementsByClassName('sportsman-card-fxv')[position].innerHTML = `<div class="card">
                            <div class="card-body">
                                <h5 class="card-title" id="name">${sportsman.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="country">${sportsman.country}</h6>

                                <div id="wins">Podiums: ${sportsman.podiums}</div>
                                <div id="champ_wins">Championships wins: ${sportsman.champion_wins}</div>

                                <hr>

                                <button type="button" class="btn btn-danger" id="deleteBtn" onclick="Delete('${sportsman.id}')">Delete</button>
                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal" id="putBtn" onclick="Update('${sportsman.id}','${sportsman.name}','${sportsman.country}', '${sportsman.podiums}', '${sportsman.champion_wins}')">Update</button>
                            </div>
                        </div>`;
    }
}

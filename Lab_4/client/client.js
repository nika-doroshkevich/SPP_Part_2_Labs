let socket = new WebSocket("ws://localhost:4000");
let addBtn, putBtn, getCorrectBtn;
let noteId;
let client = {};

window.onload = function () {
    addBtn = document.getElementById("btnID").onclick = async function () {
        let note = {};
        note.title = document.getElementById("title").value;
        note.description = document.getElementById("description").value;
        sendMessageToServer(client, note, "addNote");
    };

    putBtn = document.getElementById("updateData").onclick = async function () {
        let note = {};

        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month <= 9) {
            month = "0" + month;
        }
        if (day <= 9) {
            day = "0" + day;
        }

        note.id = noteId;
        note.title = document.getElementById("titleUpdate").value;
        note.description = document.getElementById("descriptionUpdate").value;
        note.createdDate = document.getElementById("createdDateUpdate").value;
        note.updatedDate = date.getFullYear() + "-" + month + "-" + day;

        sendMessageToServer(client, note,  "putNote");
    };

    getCorrectBtn = document.getElementById("getCorrectData").onclick = async function () {
        let filterObject = {};

        filterObject.firstValue = document.getElementById("first_value").value;
        filterObject.secondValue = document.getElementById("second_value").value;
        filterObject.sortParam = document.getElementById("sortParamSelect").value;

        sendMessageToServer(client, filterObject, "filterNotes");
    };
};

// Message handler from the server
socket.onmessage = function(event) {
    let resMessage = event.data;
    let res = JSON.parse(resMessage);

    switch (res.type) {
        case "initFront": {
            client.id = res.userID;
            client.token = null;
            let notes = res.resData;

            for (let i = 0; i < notes.length; i++){
                getCard(notes[i]);
            }
            break;
        }

        case "addNote": {
            if (res.isDone){
                getCard(res.resData);
                document.getElementById('title').value = "";
                document.getElementById('description').value = "";
            }else {
                alert("User is unauthorized");
            }
            break;
        }

        case "deleteNote": {
            if (res.isDone){
                console.log("is deleted");
                document.getElementsByClassName(res.resData.toString())[0].remove();
            }else{
            alert("User is unauthorized");
            }
            break;
        }

        case "putNote": {
            if (res.isDone){
                console.log("PUT is Done: "+ res.resData);
                const elem = document.getElementsByClassName(res.resData.id.toString())[0];
                const elements = document.getElementsByClassName("note-card-fxv");

                for (let i = 0; i < elements.length; i++){
                    if (elements[i] === elem){
                        getCard(res.resData, i);
                    }
                }
            }else{
                alert("User is unauthorized");
            }
            break;
        }

        case "filterNotes": {
            if (res.isDone) {
                document.getElementById('notes').innerHTML = '';
                for (let i = 0; i < res.resData.length; i++) {
                    getCard(res.resData[i]);
                }
            }
            break;
        }

        case "login": {
            if (res.resData.msg){
                document.getElementById('warning').style.display = "block";
                document.getElementById('warning').innerText = res.resData.msg;
                document.getElementById('auth-reg').style.display = "none";
            }else {
                document.getElementById('auth-reg').style.display = "block";
                document.getElementById('auth-reg').innerText = "The user is logged in";
                document.getElementById('warning').style.display = "none";

                document.getElementById('passwordField').value = "";
                document.getElementById('emailField').value = "";

                let date = new Date(Date.now() + 3660e3);
                date = date.toUTCString();
                document.cookie = "Token" + '=' + res.resData.token + "; path=/; expires="+ date ;
                console.log("login client " + res.resData.token);

                location.reload();
                
            }
            break;
        }

        case "logout": {
            console.log("logout");
            let date = new Date(Date.now());
            date = date.toUTCString();
            document.cookie = "Token" + '=' + res.resData.token + "; path=/; expires="+ date ;
            console.log("logout client " + res.resData.token);
            break;
        }

        case "register": {
            if (res.resData.msg) {
                document.getElementById('warning').style.display = "block";
                document.getElementById('warning').innerText = res.resData.msg;
                document.getElementById('auth-reg').style.display = "none";
            }else {
                document.getElementById('auth-reg').style.display = "block";
                document.getElementById('auth-reg').innerText = "The user is registered";
                document.getElementById('warning').style.display = "none";

                document.getElementById('passwordField').value = "";
                document.getElementById('emailField').value = "";
            }
        }
    }
};

function sendMessageToServer(client, mesData, type) {
    let message = {};

    client.token = get_cookie("Token");

    message.client = client;
    message.messageData = mesData;
    message.type = type;

    let data = JSON.stringify(message);
    socket.send(data);
}

function Update(note_id, title, description, createdDate) {
    noteId = note_id;
    document.getElementById("titleUpdate").value = title;
    document.getElementById("descriptionUpdate").value = description;
    document.getElementById("createdDateUpdate").value = createdDate;
}

function Delete(note_id) {
    sendMessageToServer(client, note_id, "deleteNote");
}

function reg(email, password) {
    const user = {};
    user.email = email;
    user.password = password;

    console.log(user);
    console.log("reg");

    sendMessageToServer(client, user, "register");
}

function login(email, password) {
    const user = {};
    user.email = email;
    user.password = password;

    console.log(user);
    console.log("login");

    sendMessageToServer(client, user, "login");
}

function logout() {
    sendMessageToServer(client, null, "logout");
    location.reload();
}

function get_cookie ( cookie_name )
{
    let results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
    if ( results )
        return ( unescape ( results[2] ) );
    else
        return null;
}

function getCard(note, position = null) {
    if (position === null) {
        const x = ` <div class="col-6 py-md-2 ${note.id} note-card-fxv">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title" id="title">${note.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="description">${note.description}</h6>

                                <div id="createdDate">Created date: ${note.createdDate}</div>
                                <div id="updatedDate">Updated date: ${note.updatedDate}</div>

                                <hr>

                                <button type="button" class="btn btn-danger" id="deleteBtn" onclick="Delete('${note.id}')">Delete</button>
                                <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#myModal" id="putBtn" onclick="Update('${note.id}','${note.title}','${note.description}', '${note.createdDate}')">Update</button>
                            </div>
                        </div> 
                    </div>`;
        document.getElementById('notes').innerHTML = document.getElementById('notes').innerHTML + x;
    }  else{
        document.getElementsByClassName('note-card-fxv')[position].innerHTML = `<div class="card">
                            <div class="card-body">
                                <h5 class="card-title" id="title">${note.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="description">${note.description}</h6>

                                    <div id="createdDate">Created date: ${note.createdDate}</div>
                                    <div id="updatedDate">Updated date: ${note.updatedDate}</div>

                                <hr>

                                <button type="button" class="btn btn-danger" id="deleteBtn" onclick="Delete('${note.id}')">Delete</button>
                                <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#myModal" id="putBtn" onclick="Update('${note.id}','${note.title}','${note.description}', '${note.createdDate}')">Update</button>
                            </div>
                        </div>`;
    }
}

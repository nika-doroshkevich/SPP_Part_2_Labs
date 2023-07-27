let addBtn, putBtn, searchBtn;
let noteId;
let token = "ereQR124ERwqgWOEQIFHdwuefhe";

window.onload = async function () {
    const data = await clientRequest("/api/notes", "GET");
    console.log(data);

    for (let i = 0; i < data.length; i++) {
        getCard(data[i]);
    }

    addBtn = document.getElementById("btnID").onclick = async function () {
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

        note.title = document.getElementById("title").value;
        note.description = document.getElementById("description").value;
        note.createdDate = date.getFullYear() + "-" + month + "-" + day;

        const response = await clientRequest("/api/notes", "POST", note);

        if (response.message === "Unauthorized user") {
            alert("Error 401, the user is not authorized.");
        } else {
            getCard(response);
            console.log(response);
        }
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
        note.createdDate = date.getFullYear() + "-" + month + "-" + day;

        const response = await clientRequest(`/api/notes/${noteId}`, "PUT", note);

        if (response.message === "Unauthorized user") {
            alert("Error 401, the user is not authorized.");
        } else {
            const elem = document.getElementsByClassName(noteId.toString())[0];
            const elements = document.getElementsByClassName("note-card-fxv");

            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === elem) {
                    getCard(response, i);
                }
            }
        }
    };

    searchBtn = document.getElementById("searchNoteBtn").onclick = async function () {
        let filterObject = {};

        filterObject.firstValue = document.getElementById("first_value").value;
        filterObject.secondValue = document.getElementById("second_value").value;
        filterObject.sortParam = document.getElementById("sortParamSelect").value;
        console.log(filterObject);

        const response = await clientRequest('/api/notes/filter', "POST", filterObject);

        document.getElementById('notes').innerHTML = '';
        for (let i = 0; i < response.length; i++) {
            getCard(response[i]);
        }
    };
};

async function Delete(id) {
    const response = await clientRequest(`/api/notes/${id}`, "DELETE");
    if (response.message !== "Unauthorized user")
        document.getElementsByClassName(id.toString())[0].remove();
    else {
        alert("Error 401, the user is not authorized.");
    }
}

function Update(id, title, description, createdDate) {
    noteId = id;
    document.getElementById("titleUpdate").value = title;
    document.getElementById("descriptionUpdate").value = description;
}

async function auth(email, password, flag = false) {
    const user = {};
    user.email = email;
    user.password = password;

    console.log(user);
    let response;

    if (flag) {
        console.log("reg");
        response = await clientRequest("/register", "POST", user);
        document.getElementById('reg-auth-Modal').modal = "hide";
    } else {
        console.log("auth");
        response = await clientRequest("/login", "POST", user);
        console.log(response);
        console.log(get_cookie("token"));
    }

    if (response.message) {
        document.getElementById('warning').style.display = "block";
        document.getElementById('warning').innerText = response.message;
        document.getElementById('auth-reg').style.display = "none";
    } else {
        document.getElementById('auth-reg').style.display = "block";

        if (flag)
            document.getElementById('auth-reg').innerText = "The user is registered";
        else
            document.getElementById('auth-reg').innerText = "The user is logged in";

        document.getElementById('warning').style.display = "none";

        document.getElementById('passwordField').value = "";
        document.getElementById('emailField').value = "";
    }
}

function get_cookie(cookie_name) {
    let results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');

    if (results)
        return (unescape(results[2]));
    else
        return null;
}

async function clientRequest(url, method, data = null) {
    try {
        let headers = {};
        headers['Authorization'] = get_cookie("token");
        //console.log(headers['Authorization']);

        let body;

        if (data) {
            headers['Content-type'] = 'application/json';
            body = JSON.stringify(data);
        }

        const response = await fetch(url, {
            method,
            headers,
            body
        });

        return await response.json();
    } catch (e) {
        console.warn(e.message);
    }
}

function getCard(note, position = null) {
    if (position === null) {
        const x = ` <div class="col-6 py-md-2 ${note.id} note-card-fxv">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title" id="title">${note.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="description">${note.description}</h6>

                                <div id="createdDate">Created date: ${note.createdDate}</div>

                                <hr>

                                <button type="button" class="btn btn-danger" id="deleteBtn" onclick="Delete('${note.id}')">Delete</button>
                                <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#myModal" id="putBtn" onclick="Update('${note.id}','${note.title}','${note.description}', '${note.createdDate}')">Update</button>
                            </div>
                        </div> 
                    </div>`;
        document.getElementById('notes').innerHTML = document.getElementById('notes').innerHTML + x;
    } else {
        document.getElementsByClassName('note-card-fxv')[position].innerHTML = `<div class="card">
                            <div class="card-body">
                                <h5 class="card-title" id="title">${note.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="description">${note.description}</h6>

                                    <div id="createdDate">Created date: ${note.createdDate}</div>

                                <hr>

                                <button type="button" class="btn btn-danger" id="deleteBtn" onclick="Delete('${note.id}')">Delete</button>
                                <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#myModal" id="putBtn" onclick="Update('${note.id}','${note.title}','${note.description}', '${note.createdDate}')">Update</button>
                            </div>
                        </div>`;
    }
}

var apiURL = "https://localhost:44352/";
var path = window.location.pathname;

//REGISTER

$("#frmRegister").submit(function (e) {
    e.preventDefault();
    var pwdReg = $("#inputPasswordRegister");
    var pwdRegConfirm = $("#inputConfirmPasswordRegister");

    $.ajax({
        type: "post",
        url: apiURL + "api/Account/Register",
        data: $("#frmRegister").serialize(),
        success: function (data) {
            toastr.success("Your account has been successfuly created Please Go To Login");
            pwdReg.val("");
            pwdRegConfirm.val("");
        },
        error: function (data) {
            if (pwdReg.val() != pwdRegConfirm.val()) {
                toastr.error("Passwords do not match !");
            }
            else if (data) {
                toastr.error("Something Wrong");
            }
            else {
                toastr.error("This mail is used by someone else");
            }
            pwdReg.val("");
            pwdRegConfirm.val("");
        }
    });
});

//LOGIN

$("#frmLogin").submit(function (e) {
    e.preventDefault();
    $.ajax({
        type: "post",
        url: apiURL + "api/Account/Login",
        data: $("#frmLogin").serialize(),
        success: function (data) {
            localStorage.removeItem("login");
            sessionStorage.removeItem("login");
            var remember = $("#rememberMe").prop("checked");
            var storage = remember ? localStorage : sessionStorage;
            storage["login"] = JSON.stringify(data);
            toastr.success("Login is successful, you are redirected to the site");
            window.location.href = "index.html" + location.hash;
            $("#frmLogin").reset();
        },
        error: function () {
            toastr.error("An error occured while logging in, please check your information");
        }
    });
});

//LOGOUT

$("#btnLogout").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("login");
    sessionStorage.removeItem("login");
    window.location.href = "login.html" + location.hash;
});


//LOGIN FUNCTIONS

//GET TOKEN
function getAccessToken() {
    var loginDataJson = sessionStorage["login"] || localStorage["login"];
    var loginData;

    try {
        loginData = JSON.parse(loginDataJson);
    } catch (error) {
        window.location.href = "login.html";
        return null;
    }

    if (!loginData || !loginData.token) {
        return window.location.href = "login.html";
    }

    return loginData.token;
}

//AUTHORIZATION TOKEN
function getAuthHeaders() {
    return { Authorization: "Bearer " + getAccessToken() };
}

//LOGIN CONTROL
function loginControl() {
    if (path.endsWith("/login.html")) return;

    var accessToken = getAccessToken();

    if (!accessToken) {
        window.location.href = "login.html";
        return;
    }

    $.ajax({
        type: "get",
        url: apiURL + "api/Account",
        data: { token: accessToken },
        success: function (data) {
            $("#loginName").text(window.location.hash == "#it" || window.location.hash == "" ? "Benvenuta " + data : "Hoşgeldin " + data);
        },
        error: function () {
            window.location.href = "login.html";
        }
    });
}

//FIRST INDEX PAGE LOAD

$(document).ready(function () {
    SetFilters();
    $.ajax({
        type: 'GET',
        dataType: 'json',
        async: false,
        url: apiURL + "api/Json",
        data: { jsonLanguage: location.hash },
        success: function (data) {
            GetImportantEvent(data);
        }
    });
});

//SEARCH BOX

$("#searchEvent").submit(function (e) {
    e.preventDefault();
    $('#addEventHear').html('');
    var searchField = $("#searchBox").val().toLowerCase();
    var selectedType = $("#typeOfEvent").val();
    var dayValue = $("#dayFilter").val();
    var month = $("#monthFilter").val();
    var dayOfMonth = dayValue + " " + month;
    $.ajax({
        type: "GET",
        dataType: 'json',
        headers: getAuthHeaders(),
        async: false,
        url: path == "/index.html" ? apiURL + "api/Json" : apiURL + "api/FavoriteMemories/MyFavoriteMemories",
        data: { searchContent: searchField, jsonLanguage: location.hash, type: selectedType, time: dayOfMonth },
        success: function (data) {
            if (data.length < 1) {
                $("#myTable tbody").empty();
                $("#countDiv").html("<span class='mt-2 text-white'> <strong>" + data.length + "</strong> incidents found</span>");
                toastr.error("Search result not found");
                $("#nextValue").css("display", "none");
            }
            else {
                GetImportantEvent(data);
                $("#countDiv").html("<span class='mt-2 text-white'> <strong>" + data.length + "</strong> incidents found</span>");
            }
        },
        error: function () {
            toastr.error("Something wrong")
        }
    });
});

//WHEN FILTER CHANGE

$("body").on("change", "select", function () {
    $("#searchBox").val("");
    ChangeDaysForMonth();
    var searchField = $("#searchBox").val().toLowerCase();
    var selectedType = $("#typeOfEvent").val();
    var dayValue = $("#dayFilter").val();
    var month = $("#monthFilter").val();
    var dayOfMonth = dayValue + " " + month;
    $.ajax({
        type: "GET",
        headers: getAuthHeaders(),
        dataType: 'json',
        async: false,
        data: { jsonLanguage: location.hash, type: selectedType, time: dayOfMonth, searchContent: searchField },
        url: path == "/index.html" ? apiURL + "api/Json" : apiURL + "api/FavoriteMemories/MyFavoriteMemories",
        success: function (data) {
            if (data.length < 1) {
                $("#myTable tbody").empty();
                $("#countDiv").html("<span class='mt-2 text-white'> <strong>" + data.length + "</strong> incidents found</span>");
                toastr.error("Search result not found");
                $("#nextValue").css("display", "none");
            }
            else {
                GetImportantEvent(data);
                $("#countDiv").html("<span class='mt-2 text-white'> <strong>" + data.length + "</strong> incidents found</span>");
            }
        }
    });
});

//INDEX FUNCTIONS

//GET IMPORTANT EVENTS
function GetImportantEvent(events) {
    if (path == "/index.html") {
        var table = $('#addEventHear');
    }
    else {
        var table = $('#myMemories');
    }
    var max_size = events.length;
    var sta = 0;
    var elements_per_page = 8;
    if (events.length < elements_per_page) {
        elements_per_page = events.length;
    }
    var limit = elements_per_page;
    paginate(sta, limit);
    function paginate(sta, limit) {
        if (limit == max_size) {
            $("#nextValue").css("display", "none");
        }
        else {
            $("#nextValue").css("display", "block");
        }
        if (sta == 0) {
            $("#PreValue").css("display", "none");
        }
        else {
            $("#PreValue").css("display", "block");
        }
        var html = new Array(0), j = -1;
        for (var i = sta; i < limit; i++) {
            if (location.hash == null || location.hash == "#tr") {

                html[++j] = "<tr><td>";
                html[++j] = path == "/index.html" ? events[i].ID : events[i].id;
                html[++j] = "</td><td>";
                html[++j] = path == "/index.html" ? events[i].dc_Zaman : events[i].time;
                html[++j] = "</td><td>"
                html[++j] = path == "/index.html" ? events[i].dc_Kategori : events[i].category;
                html[++j] = "</td><td>"
                html[++j] = path == "/index.html" ? events[i].dc_Olay : events[i].description;
                if (path == "/index.html") {
                    html[++j] = '</td><td><button class="btn btn-primary" Id="rememberAddButton" data-event-id="' + (events[i].ID) + '" data-event-time="' + (events[i].dc_Zaman) + '" data-event-category="' + (events[i].dc_Kategori) + '" data-event-description="' + (events[i].dc_Olay) + '"><i class="fas fa-calendar-plus"></i></button></td></tr>';
                }
                else {
                    html[++j] = '</td><td><button class="btn btn-danger" id="btnDelete" data-delete-id = "' + events[i].id + '"><i class="fas fa-trash"></i></button</td><td><button class="btn btn-warning" id="btnEdit" data-edit-id = "' + events[i].id + '" data-time-value="' + events[i].time + '" data-category-value="' + events[i].category + '" data-description-value="' + events[i].description + '" data-toggle="modal" data-target="#myEditModal"><i class="fas fa-edit"></i></td></tr>';
                }
            }
            else {
                html[++j] = "<tr><td>";
                html[++j] = path == "/index.html" ? events[i].ID : events[i].id;
                html[++j] = "</td><td>";
                html[++j] = path == "/index.html" ? events[i].dc_Orario : events[i].time;
                html[++j] = "</td><td>"
                html[++j] = path == "/index.html" ? events[i].dc_Categoria : events[i].category;
                html[++j] = "</td><td>"
                html[++j] = path == "/index.html" ? events[i].dc_Evento : events[i].description;
                if (path == "/index.html") {
                    html[++j] = '</td><td><button class="btn btn-primary" Id="rememberAddButton" data-event-id="' + (events[i].ID) + '" data-event-time="' + (events[i].dc_Orario) + '" data-event-category="' + (events[i].dc_Categoria) + '" data-event-description="' + (events[i].dc_Evento) + '"><i class="fas fa-calendar-plus"></i></button></td></tr>';
                }
                else {
                    html[++j] = '</td><td><button class="btn btn-danger" id="btnDelete" data-delete-id = "' + events[i].id + '"><i class="fas fa-trash"></i></button</td><td><button class="btn btn-warning" id="btnEdit" data-edit-id = "' + events[i].id + '" data-time-value="' + events[i].time + '" data-category-value="' + events[i].category + '" data-description-value="' + events[i].description + '" data-toggle="modal" data-target="#myEditModal"><i class="fas fa-edit"></i></td></tr>';
                }
            }
        };

        table.html(html.join(''));
    }

    //PAGINATION
    $('#nextValue').click(function () {
        var next = limit;
        if (max_size >= next) {
            limit = limit + elements_per_page;
            if (limit > max_size) {
                limit = elements_per_page + (max_size - elements_per_page);
            }
            table.empty();
            paginate(next, limit);
        }
    });
    $('#PreValue').click(function () {
        var pre = limit - (2 * elements_per_page);
        if (pre >= 0) {
            limit = limit - elements_per_page;
            table.empty();
            paginate(pre, limit);
        }
        else {
            var pre = limit - (elements_per_page + (limit - elements_per_page));
            if (pre >= 0) {
                limit = elements_per_page;
                table.empty();
                paginate(pre, limit);
            }
        }
    });
}

//Days to be at first boot
function SetFilters() {
    for (var i = 1; i <= 31; i++) {
        $("#dayFilter").append("<option value=" + i + ">" + i + "</option>")
    }

    if (location.hash == "#tr") {
        $("#typeOfEvent").append('<option value="Olay" id="event1">Olay</option><option value="Doğum" id="birth">Doğum</option><option value="Ölüm" id="death">Ölüm</option><option value="Tatil ve Özel Gün" id="holidays">Tatil ve Özel Gün</option>');
        $("#monthFilter").append('<option value="Ocak" id="january">Ocak</option><option value="Şubat" id="february">Şubat</option><option value="Mart" id="march">Mart</option><option value="Nisan" id="april">Nisan</option><option value="Mayıs" id="may">Mayıs</option><option value="Haziran" id="june">Haziran</option><option value="Temmuz" id="july">Temmuz</option><option value="Ağustos" id="august">Ağustos</option><option value="Eylül" id="september">Eylül</option><option value="Ekim" id="october">Ekim</option><option value="Kasım" id="november">Kasım</option><option value="Aralık" id="december">Aralık</option>');
    }
    else {
        $("#typeOfEvent").append('<option value="Eventi" id="event1">Eventi</option><option value="Altri progetti" id="birth">Altri progetti</option><option value="Morti" id="death">Morti</option><option value="Feste e ricorrenze" id="holidays">Feste E Ricorrenze</option>');
        $("#monthFilter").append('<option value="gennaio" id="january">Gennaio</option><option value="febbraio" id="february">Febbraio</option><option value="marzo" id="march">Marzo</option><option value="aprile" id="april">Aprile</option><option value="maggio" id="may">Maggio</option><option value="giugno" id="june">Giugno</option><option value="luglio" id="july">Luglio</option><option value="agosto" id="august">Agosto</option><option value="settembre" id="september">Settembre</option><option value="ottobre" id="october">Ottobre</option><option value="novembre" id="november">Novembre</option><option value="dicembre" id="december">Dicembre</option>');
    }
}

//Days that should happen when the months change
function ChangeDaysForMonth() {
    var dayFilter = $("#dayFilter");
    var monthFilterValue = $("#monthFilter").val();
    if (monthFilterValue == "Ocak" || monthFilterValue == "Mart" || monthFilterValue == "Mayıs" || monthFilterValue == "Temmuz" || monthFilterValue == "Ağustos" || monthFilterValue == "Ekim" || monthFilterValue == "Aralık") {
        if (dayFilter.children().length == 30) {
            for (var i = 30; i <= 31; i++) {
                dayFilter.append("<option value=" + i + ">" + i + "</option>")
            }
        }
        else if (dayFilter.children().length == 31) {
            for (var i = 31; i <= 31; i++) {
                dayFilter.append("<option value=" + i + ">" + i + "</option>")
            }
        }
    }
    else if (monthFilterValue == "Şubat") {
        if (dayFilter.children().length == 32) {
            $("#dayFilter option:last-child").remove();
            $("#dayFilter option:last-child").remove();
        }
        else if (dayFilter.children().length == 31) {
            $("#dayFilter option:last-child").remove();
        }
    }
    else if (monthFilterValue == "Nisan" || monthFilterValue == "Haziran" || monthFilterValue == "Ağustos" || monthFilterValue == "Eylül" || monthFilterValue == "Kasım") {
        if (dayFilter.children().length == 30) {
            for (var i = 30; i <= 30; i++) {
                dayFilter.append("<option value=" + i + ">" + i + "</option>")
            }
        }
        else if (dayFilter.children().length == 32) {
            $("#dayFilter option:last-child").remove();
        }
    }
}


//ADD FAVORITE MEMOMERY TO USER

$("body").on("click", "[data-event-id]", function (e) {
    e.preventDefault();
    var eventId = $(this).data("event-id");
    var eventTime = $(this).data("event-time");
    var eventCategory = $(this).data("event-category");
    var eventDescription = $(this).data("event-description");
    $.ajax({
        type: "POST",
        headers: getAuthHeaders(),
        url: apiURL + "api/FavoriteMemories/AddFavoriteMemory",
        data: { Time: eventTime, Category: eventCategory, Description: eventDescription, jsonLanguage: location.hash },
        success: function (data) {
            toastr.success("An event has been added to your favorite")
        },
        error: function (data) {
            toastr.error("Something Wrong")
        }
    });
});



//GET MY FAVORITE MEMORY

if (path == "/MyMemories.html") {
    $.ajax({
        type: "Get",
        url: apiURL + "api/FavoriteMemories/MyFavoriteMemories",
        headers: getAuthHeaders(),
        data: { jsonLanguage: location.hash },
        success: function (data) {
            GetImportantEvent(data)
        },
        error: function (data) {

        }
    })
}


//DELETE SELECTED MEMORY
$("body").on("click", "[data-delete-id]", function (e) {
    e.preventDefault();
    var deleteId = $(this).data("delete-id");
    if (!confirm("Your selected favorite memory will be delete after this process ?")) {
        return false;
    }
    $.ajax({
        type: "POST",
        url: apiURL + "api/FavoriteMemories/DeleteFavoriteMemory",
        headers: getAuthHeaders(),
        data: { eventId: deleteId },
        success: function (data) {
            toastr.success("Selected event successfuly deleted");
            setTimeout(function () {
                location.reload();
            }, 500)
        },
        error: function (data) {
            toastr.error("Something wrong");
        }
    });
});

//EDIT SELECTED MEMORY
$("#frmEditEvent").submit(function (e) {
    e.preventDefault();
    $("#description").focusout();
    var editedEventId = $("#btnEdit").data("edit-id");
    var eventTime = $("#dayFilterEdit").val() + " " + $("#monthFilterEdit").val();
    var eventCategory = $("#typeOfEventEdit").val();
    var eventDescription = $("#description").val();

    $.ajax({
        type: "POST",
        url: apiURL + "api/FavoriteMemories/EditFavoriteMemory",
        headers: getAuthHeaders(),
        data: { eventId: editedEventId, Time: eventTime, Category: eventCategory, Description: eventDescription,jsonLanguage:location.hash },
        success: function (data) {
            toastr.success("Selected favorite memory has been updated successfuly.");
            setTimeout(function () {
                location.reload();
            }, 500)
        },
        error: function (data) {
            toastr.error("Something wrong");
        }
    })
});


//GET EVENT INFO IN MODAL
$("body").on("click", "[data-edit-id]", function () {
    SetDaysOfMonthEdit();
    var editedEventId = $(this).data("edit-id");
    var editedEventTime = $(this).data("time-value");
    var editedEventCategory = $(this).data("category-value");
    var editedEventDescription = $(this).data("description-value");

    $("#description").text(editedEventDescription);
    $("#myModalLabel").html("Edit Favorite Memory ( ID : " + editedEventId + " )");
    $('[name=categoryoption][value="' + editedEventCategory + '"]').attr("selected", "selected");
    $('[name=monthOption][value="' + editedEventTime.split(" ").pop() + '"]').attr("selected", "selected");
    $('[name=dayOption][value="' + editedEventTime.split(" ")[0] + '"]').attr("selected", "selected");
});

//CHANGE DAYS FOR MONTH IN EDIT MODAL
$("body").on("change", "select", function () {
    ChangeDaysForMonthEdit();
});

function ChangeDaysForMonthEdit() {
    var dayFilter = $("#dayFilterEdit");
    var monthFilterValue = $("#monthFilterEdit").val();
    if (monthFilterValue == "Ocak" || monthFilterValue == "Mart" || monthFilterValue == "Mayıs" || monthFilterValue == "Temmuz" || monthFilterValue == "Ağustos" || monthFilterValue == "Ekim" || monthFilterValue == "Aralık") {
        if (dayFilter.children().length == 30) {
            for (var i = 30; i <= 31; i++) {
                dayFilter.append("<option name='dayOption' value=" + i + ">" + i + "</option>")
            }
        }
        else if (dayFilter.children().length == 31) {
            for (var i = 31; i <= 31; i++) {
                dayFilter.append("<option name='dayOption' value=" + i + ">" + i + "</option>")
            }
        }
    }
    else if (monthFilterValue == "Şubat") {
        if (dayFilter.children().length == 32) {
            $("#dayFilterEdit option:last-child").remove();
            $("#dayFilterEdit option:last-child").remove();
        }
        else if (dayFilter.children().length == 31) {
            $("#monthFilterEdit option:last-child").remove();
        }
    }
    else if (monthFilterValue == "Nisan" || monthFilterValue == "Haziran" || monthFilterValue == "Ağustos" || monthFilterValue == "Eylül" || monthFilterValue == "Kasım") {
        if (dayFilter.children().length == 30) {
            for (var i = 30; i <= 30; i++) {
                dayFilter.append("<option name='dayOption' value=" + i + ">" + i + "</option>")
            }
        }
        else if (dayFilter.children().length == 32) {
            $("#dayFilterEdit option:last-child").remove();
        }
    }
}

//SET DAYS OF MONTH IN EDIT
function SetDaysOfMonthEdit() {
    for (var i = 1; i <= 31; i++) {
        $("#dayFilterEdit").append("<option name='dayOption' value=" + i + ">" + i + "</option>")
    }

    if (location.hash == "#tr") {
        $("#typeOfEventEdit").append('<option value="Olay" id="event1" name=categoryoption>Olay</option><option value="Doğum" id="birth" name=categoryoption>Doğum</option><option value="Ölüm" id="death" name=categoryoption>Ölüm</option><option value="Tatil ve Özel Gün" id="holidays" name=categoryoption>Tatil ve Özel Gün</option>');
        $("#monthFilterEdit").append('<option value="Ocak" id="january" name="monthOption">Ocak</option><option value="Şubat" id="february" name="monthOption">Şubat</option><option value="Mart" id="march" name="monthOption">Mart</option><option value="Nisan" id="april" name="monthOption">Nisan</option><option value="Mayıs" id="may" name="monthOption">Mayıs</option><option value="Haziran" id="june" name="monthOption">Haziran</option><option value="Temmuz" id="july" name="monthOption">Temmuz</option><option value="Ağustos" id="august" name="monthOption">Ağustos</option><option value="Eylül" id="september" name="monthOption">Eylül</option><option value="Ekim" id="october" name="monthOption">Ekim</option><option value="Kasım" id="november" name="monthOption">Kasım</option><option value="Aralık" id="december" name="monthOption">Aralık</option>');
    }
    else {
        $("#typeOfEventEdit").append('<option value="Eventi" id="event1" name=categoryoption>Eventi</option><option value="Altri progetti" id="birth" name=categoryoption>Altri progetti</option><option value="Morti" id="death" name=categoryoption>Morti</option><option value="Feste e ricorrenze" id="holidays" name=categoryoption>Feste E Ricorrenze</option>');
        $("#monthFilterEdit").append('<option value="gennaio" id="january" name="monthOption">Gennaio</option><option value="febbraio" id="february" name="monthOption">Febbraio</option><option value="marzo" id="march" name="monthOption">Marzo</option><option value="aprile" id="april" name="monthOption">Aprile</option><option value="maggio" id="may" name="monthOption">Maggio</option><option value="giugno" id="june" name="monthOption">Giugno</option><option value="luglio" id="july" name="monthOption">Luglio</option><option value="agosto" id="august" name="monthOption">Agosto</option><option value="settembre" id="september" name="monthOption">Settembre</option><option value="ottobre" id="october" name="monthOption">Ottobre</option><option value="novembre" id="november" name="monthOption">Novembre</option><option value="dicembre" id="december" name="monthOption">Dicembre</option>');
    }
}

//setHash
$("#myFavoriteMemorylink").click(function (e) {
    e.preventDefault()
    window.location.href = "MyMemories.html" + location.hash;

});

$("#home").click(function (e) {
    e.preventDefault()
    window.location.href = "index.html" + location.hash;
})




//AJAX START-STOP

$(document).ajaxStart(function () {
    $("#loading").removeClass("d-none");
});

$(document).ajaxStop(function () {
    $("#loading").addClass("d-none");
});

//Control User and Get Info
loginControl();



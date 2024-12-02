// import { fallback }         from './fallback.js';
// import { notes }            from './notes.js';
// import { standardizeNames } from './wardList.js';
// import { whoWhatWhere }     from './whoWhatWhere.js';
// theWard.forEach(m => console.log( 
//     `${m.id},"${m.name}",${m.last},${m.first},${m.city},${m.address1},${m.address2},${m.zip},${m.age},
//     ${m.gender},${m.baptized},${m.birthday},"${m.minBros}","${m.minSiss}",
//     ${m.email},${m.phone},${m.institute},${m.convert},${m.endowed},${m.RM},${m.sealed},${m.movedIn},
//     ${m.priesthood},${m.recExpire},${m.recStatus},${m.recType},${m.lat},${m.long},"${m.notes}","${m.callings}"`) );
   
let theWard = [];
let wardMap = {};
let map;
let clickMarker;
let savedGPS = [];
let distances = [];
let wardMembers = [];
let popup = L.popup();
let popups = [], markers = [];

loadData();
function loadData()  {
    if (+document.location.port === 3000) {
        fetch('http://127.0.0.1:3000/members/get/9819187')
        .then(data => data.json())
        .then(mbrs => initPage(mbrs.data));
    } else {
        initPage(standardizeNames(whoWhatWhere.members));
    }
}

function initPage(data) {
    let defaults = {city: '', address1: '', address2: '', zip: '', 
    age: '', gender: '', baptized: '', callings: '', birthday: '', phone: '', email: '', 
    institute: '', convert: '', endowed: '', RM: '', sealed: '', movedIn: '', priesthood: '', 
    recExpire: '', recStatus: '', recType: '', minBros: '', minSiss: '', notes: 'Active' };

    theWard = data
    theWard.unshift( { ...{id: 3, first: '3', last: 'Institute',    name: "3 Institute",    lat: 32.61441, long: -97.16883, }, ...defaults } );
    theWard.unshift( { ...{id: 2, first: '2', last: 'Forest Hill',  name: "2 Forest Hill",  lat: 32.66660, long: -97.26414, }, ...defaults } );
    theWard.unshift( { ...{id: 1, first: '1', last: 'Stake Center', name: "1 Stake Center", lat: 32.68776, long: -97.16802, }, ...defaults } );
    theWard.unshift( { ...{id: 0, first: '0', last: 'California',   name: "0 California",   lat: 32.69905, long: -97.13096, }, ...defaults } );

    savedGPS = JSON.parse(localStorage.getItem('gps'));

    if (savedGPS === null)      savedGPS = fallback;

    setGPSandNotes(theWard, savedGPS, notes);
    document.getElementById("count").innerText = `${theWard.length} Members`;
}

let cbEQ        = document.querySelector("#EQ");
let cbRS        = document.querySelector("#RS");
let cbActive    = document.querySelector("#Active");
let cbNotActive = document.querySelector("#NotActive");
let cbConvert   = document.querySelector("#Convert");
let cbEndowed   = document.querySelector("#Endowed");
let cbNotEndowed= document.querySelector("#NotEndowed");
let cbRM        = document.querySelector("#RM");
let cbInstitute = document.querySelector("#Institute");
let cbSealed    = document.querySelector("#Sealed");
let cbBro       = document.querySelector("#Bro");
let cbSis       = document.querySelector("#Sis");
let cbNotBro    = document.querySelector("#NotBro");
let cbNotSis    = document.querySelector("#NotSis");

let txtName     = document.querySelector("#Name");
let txtAddress1 = document.querySelector("#Address1");
let txtZip      = document.querySelector("#Zip");
let txtCity     = document.querySelector("#City");
let txtAge      = document.querySelector("#Age");
let txtBDay     = document.querySelector("#BDay");
let txtPrsthd   = document.querySelector("#Priesthood");
let txtNotes    = document.querySelector("#Notes");
let txtCallings = document.querySelector("#Callings");
let txtRec      = document.querySelector("#Recommend");
let txtRecType  = document.querySelector("#RecType");
let txtRecExpire= document.querySelector("#RecExpire");
let txtMovedIn  = document.querySelector("#MovedIn");
let txtBaptized = document.querySelector("#Baptized");

let popSpeak    = document.querySelector("#popSpeak");
let popAddress  = document.querySelector("#popAddress");
let popStats    = document.querySelector("#popStats");
let popContact  = document.querySelector("#popContact");
let popMbrInfo  = document.querySelector("#popMbrInfo");
let popTemple   = document.querySelector("#popTemple");
let popMinistering = document.querySelector("#popMinistering");
let popLatLong  = document.querySelector("#popLatLong");
let updates     = document.querySelector("#updates");

document.querySelector('#plot'       ).addEventListener('click', plotMembers);
document.querySelector('#remove'     ).addEventListener('click', removeAllPoints);
document.querySelector('#include'    ).addEventListener('click', includeAll);
document.querySelector("#distList"   ).addEventListener('click', newDistances);
document.querySelector("#newAddress" ).addEventListener('click', newAddress);

let noGPS       = document.querySelector('#getZeroGPS'  );
let getLatLong  = document.querySelector('#getLatLong'  );

noGPS.addEventListener     ('click', getZeroGPS);
getLatLong.addEventListener('click', getGPS);

updates.addEventListener('click', popupName);

let cblist = document.querySelector("#list");
let cbTags = document.querySelector("#nameTags");

var broIcon     = L.icon({ iconUrl: 'images/bro.png', iconSize: [15, 10] });
var sisIcon     = L.icon({ iconUrl: 'images/sis.png', iconSize: [10, 15] });
var chapelIcon  = L.icon({ iconUrl: 'images/chapel.png', iconSize: [25, 25] });
var noIcon      = L.icon({ iconUrl: 'images/bro.png', iconSize: [1, 1] });

window.navigator.geolocation.getCurrentPosition(setLocation);

//  put the map behind the updates list
document.getElementById("map").style.zIndex = "10";

function setLocation(loc) {
    map = L.map('map').setView([loc.coords.latitude, loc.coords.longitude], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    wardMap.center = { longitude: loc.coords.longitude, latitude: loc.coords.latitude };
    let b = map.getBounds();
    wardMap.extent = {
        minLng: b._northEast.lng, minLat: b._northEast.lat,
        maxLng: b._southWest.lng, maxLat: b._southWest.lat
    };

    clickMarker = L.marker([loc.coords.latitude, loc.coords.longitude]).addTo(map);
    var myIcon = L.icon({
        iconUrl: './images/chapel.png',
        iconSize: [25, 25],
        iconAnchor: [22, 24],
        shadowSize: [25, 25],
        shadowAnchor: [22, 24]
    });

    L.marker([32.66660, -97.26414], { icon: myIcon }).bindPopup('Forest Hill<br>2nd and 6th wards').addTo(map);     //  2nd and 6th wards
    L.marker([32.68776, -97.16802], { icon: myIcon }).bindPopup('Stake Center<br>3rd, 5th and Mansfield 3rd wards').addTo(map);     //  stake center
    L.marker([32.61441, -97.16883], { icon: myIcon }).bindPopup('Institiute').addTo(map);     //  Institute

    myIcon = L.icon({
        iconUrl: './images/chapel.png',
        iconSize: [25, 25],
        iconAnchor: [22, 24],
        shadowSize: [25, 25],
        shadowAnchor: [22, 24]
    });
    L.marker([32.69905, -97.13096], { icon: myIcon }).bindPopup('California<br>1st, Spanish, YSA wards').addTo(map);     //  YSA

    map.on('click', onMapClick);
}

// var LeafIcon = L.Icon.extend({
//     options: {
//         shadowUrl: 'images/dot-shadow.png',
//         iconSize:     [38, 95],
//         shadowSize:   [50, 64],
//         iconAnchor:   [22, 94],
//         shadowAnchor: [4, 62],
//         popupAnchor:  [-3, -76]
//     }
// });

// var greenIcon = new LeafIcon({iconUrl: 'images/dot-green.png'}),
//     redIcon = new LeafIcon({iconUrl: 'images/dot-red.png'}),
//     orangeIcon = new LeafIcon({iconUrl: 'images/dot-orange.png'});

function onMapClick(e) 
{
    wardMap.selectedPoint = { longitude: e.latlng.lng, latitude: e.latlng.lat };
    if (clickMarker) clickMarker.remove();
    clickMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    popup
        .setLatLng(e.latlng)
        .setContent(e.latlng.toString())
        .openOn(map)
}

function popupName(e) {
    let name = e.target.innerText.substring(5);
    if (popSpeak.checked)       talkToMe(name);
    let id = e.target.getAttribute('id');
    let mbr = theWard.filter(m => m.id == id);
    if (mbr.length == 0)    return;
    mbr = mbr[0];
    L.popup()
        .setLatLng([mbr.lat, mbr.long])
        .setContent(`${name}<p>${mbr.phone}`).addTo(map);
}

//  plot Addresses
//      identify members of interest and plot their location
function plotMembers(event) {
    event.preventDefault();
    let results = [];

    results = theWard;
    if (cbEQ.checked)           results = results.filter(r =>  r.gender === 'M');
    if (cbRS.checked)           results = results.filter(r =>  r.gender === 'F');
    if (cbActive.checked)       results = results.filter(r =>  r.notes  === 'Active');
    if (cbNotActive.checked)    results = results.filter(r =>  r.notes  !== 'Active');
    if (cbEndowed.checked)      results = results.filter(r =>  r.endowed);
    if (cbNotEndowed.checked)   results = results.filter(r => !r.endowed);
    if (cbConvert.checked)      results = results.filter(r =>  r.convert);
    if (cbRM.checked)           results = results.filter(r =>  r.RM);
    if (cbInstitute.checked)    results = results.filter(r =>  r.institute);
    if (cbSealed.checked)       results = results.filter(r =>  r.sealed);
    if (cbBro.checked)          results = results.filter(r =>  r.hasMinBros);
    if (cbSis.checked)          results = results.filter(r =>  r.hasMinSiss);
    if (cbNotBro.checked)       results = results.filter(r => !r.hasMinBros);
    if (cbNotSis.checked)       results = results.filter(r => !r.hasMinSiss);

    if (txtName.value.length        > 0) results = results.filter(r =>  matches(r.name,      txtName));
    if (txtAddress1.value.length    > 0) results = results.filter(r =>  matches(r.address1,  txtAddress1));
    if (txtCity.value.length        > 0) results = results.filter(r =>  matches(r.city,      txtCity));
    if (txtZip.value.length         > 0) results = results.filter(r =>  r.zip.indexOf(txtZip.value) >= 0);

    if (txtPrsthd.value.length      > 0) results = results.filter(r =>  matches(r.priesthood,txtPrsthd));
    if (txtNotes.value.length       > 0) results = results.filter(r =>  matches(r.notes,     txtNotes));
    if (txtCallings.value.length    > 0) results = results.filter(r =>  matches(r.callings,  txtCallings));
    if (txtBDay.value.length        > 0) results = results.filter(r =>  matches(r.birthday,  txtBDay));
    if (txtRec.value.length         > 0) results = results.filter(r =>  matches(r.recStatus, txtRec));
    if (txtRecType.value.length     > 0) results = results.filter(r =>  matches(r.recType,   txtRecType));
    if (txtRecExpire.value.length   > 0) results = results.filter(r => new Date(r.recExpire) < calcDate( 1 * txtRecExpire.value));
    if (txtMovedIn.value.length     > 0) results = results.filter(r => new Date(r.movedIn)   > calcDate(-1 * txtMovedIn.value));
    if (txtBaptized.value.length    > 0) results = results.filter(r => new Date(r.baptized)  > calcDate(-1 * txtBaptized.value));

    if (txtAge.value.length > 0) {
        let age = txtAge.value;
        let number = +age.substring(age.search(/\d/));
        let operator = age.substring(0, age.search(/\d/));
        switch (operator) {
            case "<":   results = results.filter(r => +r.age < number); break;
            case "<=":  results = results.filter(r => +r.age <= number); break;
            case "":             //  just the number was entered
            case "=":
            case "==":  results = results.filter(r => +r.age == number); break;
            case ">=":  results = results.filter(r => +r.age >= number); break;
            case ">":   results = results.filter(r => +r.age > number); break;
        }
    }
    clearUpdate();
    document.getElementById("count").innerText = `${results.length} Found`;
    results.forEach(e => plotAddress(e))
}

function matches(mbr, input) {
    return mbr.toLowerCase().indexOf(input.value.toLowerCase()) >= 0;
}

function calcDate(input) {
    let untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + (input|0));
    return untilDate;
}

function removeAllPoints() {
    clearUpdate();
    wardMembers.forEach(e => e.remove())
    popups.forEach(p => p.popup.remove());
    markers.forEach(m => m.marker.remove());
    wardMembers = [];
    popups = [];
    markers = [];
}

function includeAll() {
    popAddress.checked      = ! popAddress.checked;
    popStats.checked        = ! popStats.checked
    popContact.checked      = ! popContact.checked
    popMbrInfo.checked      = ! popMbrInfo.checked
    popTemple.checked       = ! popTemple.checked
    popMinistering.checked  = ! popMinistering.checked
    popLatLong.checked      = ! popLatLong.checked
}

//  displayUpdate
//      nice utility method to show message to user
function displayUpdate(text, who) { 
    updates.innerHTML += `<li class="query" id=${who.id}>
       <button id="showDistance" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal" type="button" onclick=getDistances(${who.id}) >Dist</button>
    ${text}</li>`; 
}

function clearUpdate() { 
    updates.innerHTML = ""; 
    document.getElementById('collapse').classList.remove('show');
    document.getElementById('shrink').classList.add('collapsed');
    document.getElementById("count").innerText = '0 found';
}

function plotAddress(who) {
    if (cblist.checked) displayUpdate(`${who.first} ${who.last}`, who);

    let marker = L.marker([who.lat, who.long], { icon: who.gender == 'M' ? broIcon : who.gender == 'F' ? sisIcon : noIcon }).addTo(map);
    wardMembers.push(marker);
    marker.on('click', e => {
        // console.log(e.target._popup._content);
        // marker.openpopup(e.latlng);
    });

    marker.bindPopup(`${createPopup(who)}`);
    markers.push({name:`${who.first} ${who.last}`, marker: marker});

    if (cbTags.checked) {
        var namePopup = L.popup()
            .setLatLng([who.lat, who.long])
            .setContent(`${who.first} ${who.last}<p>${who.phone}`).addTo(map);
        popups.push({name:`${who.first} ${who.last}`, popup: namePopup});
    }
}

function createPopup(who) {
    const space = '<br>&nbsp;&nbsp;&nbsp;&nbsp;';
    let msg = `${who.first} ${who.last}<hr><p>`;
    if (popAddress.checked)     msg += `Address:${space}${who.address1} ${who.address2??""}, ${who.city}<p>`;
    if (popStats.checked)       msg += `Stats:${space}Age: ${who.age}, ${who.gender}${space}B-Day: ${who.birthday}<p>`;
    if (popContact.checked)     msg += `Conact:${space}eMail: ${who.email}${space}Phn: ${who.phone}${space}Notes: ${who.notes}<p>`;
    if (popMbrInfo.checked)     msg += `Mbr Info:${space}Callings: ${who.callings}${space}Bap: ${who.baptized} Convert: ${who.convert}${space}Mission: ${who.RM}${space}Sealed: ${who.sealed} Prsthd: ${who.priesthood.length==0?"---":who.priesthood}${space}Moved In: ${who.movedIn} Institute: ${who.institute}<p>`;
    if (popTemple.checked)      msg += `Temple:${space}Endowed: ${who.endowed} Rec Exp: ${who.recExpire}${space}Type: ${who.recType}${space}Status: ${who.recStatus}<p>`;
    if (popMinistering.checked) msg += `Ministering:${space}Bro: ${who.minBros}${space}Sis: ${who.minSiss}<p>`;
    if (popLatLong.checked)     msg += `Lat: ${who.lat.toFixed(3)} Long: ${who.long.toFixed(3)}<p>`;
    
    return msg;
}

function talkToMe(text) {
    let speech = new SpeechSynthesisUtterance();
    speech.lang = "en-US";
    speech.text = text;
    speech.volume = speech.rate = speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

//  getGPS
//      Loop through member addresses and convert to GPS coords
function getGPS(event) {
    event.preventDefault();

    getLatLong.classList.remove('btn-danger');
    getLatLong.classList.add('btn-primary');

    if (localStorage.getItem('gps') === null) {
        if (savedGPS.length > 0) {
            console.table(savedGPS);
            let resp = confirm(`Address List has ${savedGPS.length} members`);
            if (!resp)  return;
            localStorage.setItem('gps', JSON.stringify(savedGPS));
            setGPSandNotes(theWard, savedGPS, null);
        } else {
            theWard.forEach(e => getLongLatFromAdrs(e.name, e.address1 + ', ' + e.city + ', TX', addAllToWard))
        }
    } else {
        savedGPS = JSON.parse(localStorage.getItem('gps'));
        setGPSandNotes(theWard, savedGPS, null);
    }
}

function addAllToWard(adrs, name, gps) {
    console.log(`${adrs} ${gps.results[0].geometry.location.lat} ${gps.results[0].geometry.location.lng}`);
    savedGPS.push({name: name, adrs: adrs, 
                lat:  gps.results[0].geometry.location.lat,
                long: gps.results[0].geometry.location.lng});
    L.marker([gps.results[0].geometry.location.lng, gps.results[0].geometry.location.lng]).addTo(map);
}

function dummy(address, name, gps) {
    console.log(gps);
    let names = theWard.filter(g => g.name === name)
    if (names.length > 0) {
        names[0].address1 = address;
        names[0].lat  = gps.results[0].geometry.location.lat;
        names[0].long = gps.results[0].geometry.location.lng;

        savedGPS.push({name: names[0].name, address1: names[0].address1, 
            lat:  gps.results[0].geometry.location.lat,
            long: gps.results[0].geometry.location.lng});
    }
}

function newAddress() {
    let names = document.getElementsByTagName("input")
    let data = Array.from(names).reduce((newPerson, n) => { 
        console.log(`${n.getAttribute('name')}: '${n.value}'`);
        if (n.getAttribute('name') === null || n.value === 0) 
            newPerson += ``;
        else 
            newPerson += `, "${n.getAttribute('name')}": "${n.value}"`; 
        return newPerson
        }, '' );
    data = `{ "id": ${(new Date()).getMilliseconds()}, ` + data.substring(2) + " }";
    data = JSON.parse(data);
    let newGuy =  { ...data, ...{gender: '', baptized: '', callings: ''} }
    newGuy.name += " first last";
    newGuy.first = newGuy.name.split(' ')[0];
    newGuy.last  = newGuy.name.split(' ')[1];
    newGuy.name  = newGuy.last + ", " + newGuy.first
    theWard.push( newGuy );
    getLongLatFromAdrs(newGuy.name, newGuy.address1 + ", " +  newGuy.city, dummy);
}

async function getLongLatFromAdrs(name, address, addToWard) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAlw9hD3LG4VD9ebrp4uYMPD67KE4DsA3o`;
    const response = await fetch(url);
    const gps = await response.json();
    getLatLong.innerText = `${name} GPS found`;
    addToWard(address, name, gps);
}

function getZeroGPS() {
    noGPS.classList.remove('btn-danger');
    noGPS.classList.add('btn-primary');

    let empty = theWard.filter(e => e.lat == 0 || e.long == 0);
    noGPS.innerText = `${empty.length} w/o GPS `;
    if (empty.length === 0) return;
    empty.forEach(e => {
        displayUpdate(`${e.name} ${e.lat} ${e.long}`, e)
        getLongLatFromAdrs(e.name, e.address1 + ', ' + e.city + ', TX', addOneToWard);
    });
}

function addOneToWard(adrs, name, gps) {
    console.log(`${adrs} ${gps.results[0].geometry.location.lat} ${gps.results[0].geometry.location.lng}`);
    let names = savedGPS.filter(g => g.name === name)
    if (names.length > 0) {
        names[0].address1 = adrs;
        names[0].lat  = gps.results[0].geometry.location.lat;
        names[0].long = gps.results[0].geometry.location.lng;
    } else {
        savedGPS.push({name: name, address1: adrs, 
            lat:  gps.results[0].geometry.location.lat,
            long: gps.results[0].geometry.location.lng});
    }
    localStorage.setItem('gps', JSON.stringify(savedGPS));
    L.marker([gps.results[0].geometry.location.lng, gps.results[0].geometry.location.lng]).addTo(map);
    setGPSandNotes(theWard, savedGPS, null);
}

function newDistances(e) {
    getDistances(e.target.parentElement.id);
}
function getDistances(id) {
    let distModal = document.querySelector("#distList");
    let distTitle = document.querySelector("#modalTitle");
    
    let m1 = theWard.filter(m => m.id == id)[0];
    
    distTitle.innerText = `Distance from ${m1.first} ${m1.last}`;
    var latlng1 = L.latLng(m1.lat, m1.long);
    distModal.innerHTML = "";
    let style = ["warning","info"];
    let row = 0;
    let active = theWard.filter(a => a.notes === 'Active');
    let dist;
    let totalDist = 0;

    for (let m2 of active) {
        row++;
        dist = (latlng1.distanceTo(L.latLng(m2.lat, m2.long))/1609).toFixed(1);
        distModal.innerHTML += `<tr id=${m2.id}><td>${m2.first}</td><td>${m2.last}</td><td>${dist}</td></tr>`;
        totalDist += +dist;
    }       //   class=table-${style[row%2]}
    document.querySelector("#totalDist").innerText = `Average Distance: ${(totalDist/active.length).toFixed(2)}`;
}

//STATIC VERSION OF THE DASHBOARD. NO HTTP REQUESTS TO THE SERVER

//GLOBAL CONSTANTS AND VARIABLES
//Fetch Data
const today = new Date();
const dateOfEnd = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const url1 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/CORSgetCSV/?url=https://opendata.ecdc.europa.eu/covid19/nationalcasedeath_eueea_daily_ei/csv/data.csv";
const url3 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/covid19/jhcsse?dataset=cases";
const url4 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/covid19/jhcsse?dataset=deaths";
const url5 = "https://krusty.westeurope.cloudapp.azure.com/api/v2/FRcovidIndicators/";
const url6 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/alerts";
let responseData1 = [];
let responseData3 = [];
let responseData4 = [];
let responseEnhancedData = [];
let responseAlerts;
let modalGraphsData;
let modalGraphsColor;
let listOfCountries;
let chart1;
let chart2;
let chart3;
let display;
let sparkChart1;
let sparkChart2;
let sparkChart3;
let sparkChart4;
let modalChart1;
let modalChart2;
let modalChart3;
let modalChart4;

//DOM
//themes
const onlineTheme = "-dark";
const offlineTheme = "-primary";
//list of countries
const countryList = document.getElementById("countryList");
//dataset buttons
const dataset1 = document.getElementById('dataset1');
const dataset2 = document.getElementById('dataset2');
let choiceDataset = dataset1.id;
//refresh button
const refreshButton = document.getElementById('refresh');
//Default country
let selectedCountry = "France";
document.getElementById("displayCountry").innerText = selectedCountry;
//search form
const searchForm = document.getElementById("searchCountry");
//Dropdown menu selector with keyboard
let selector = null;
//graphs
const reportGraph = document.getElementById('report');
const cumulativeGraph = document.getElementById('cumulative');
//Modal
var enhancedModal = new bootstrap.Modal(document.getElementById('enhancedModal'));
//progress bar datasets loading
const progress = document.getElementById('progressBar');
//statsBar
const statsBarCases = document.getElementById('statsBarCases');
const statsBarRecovered = document.getElementById('statsBarRecovered');
const statsBarDeaths = document.getElementById('statsBarDeaths');
//Regular Expressions
const score = /\/+/g;
const regexDate = /(\d{1,2}\/\d{1,2}\/\d{1,2})+/g;
const regexProvinceState = new RegExp("_(?=[A-Za-z])");
//Graph 1 Settings
const graph1Log = document.getElementById("graph1Log");
const graph1Cases = document.getElementById("graph1Settings1");
const graph1Deaths = document.getElementById("graph1Settings2");
const graph1Raw = document.getElementById("graph1Settings3");
const graph1Filter1 = document.getElementById("graph1Settings4");
const graph1Filter2 = document.getElementById("graph1Settings5");
//Graph 2 Settings
const graph2Log = document.getElementById("graph2Log");
const graph2Cases = document.getElementById("graph2Settings1");
const graph2Deaths = document.getElementById("graph2Settings2");

//HTTP REQUESTS, FUNCTION CALLING AND EVENTS
//Enhanced Data Request data.gouv.fr
d3.csv(url5, function(d){
    responseEnhancedData.push(d);
}).then(() => {
    if (document.getElementById("requestAlert" + "Enhanced Data from data.gouv.fr".replace(/\s+/g, ''))) {
        document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Enhanced Data from data.gouv.fr".replace(/\s+/g, '')));
    }
    modalGraphsData = enhancedDataExtractor();
    modalGraphsColor = enhancedData(modalGraphsData);
    progressBar();
}).catch((err) => {
    alertRequestFail("Enhanced Data from data.gouv.fr");
    console.log(err);
})

//Johns Hopkins University Centre for Science and System Engineering
d3.csv(url3, function(d){
    responseData3.push(d);
}).then(() => {
    d3.csv(url4, function(d){
        responseData4.push(d);
    }).then(() => {
        if (document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, '')));
        }
        removeLoadingFromButton("buttonDataset1", 1, "Johns Hopkins University CSSE", true);
        progressBar();
        listOfCountries = getCountries();
        displayAlert(responseAlerts);
        display = displayCountryData();
    }, () => {
        if (document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, '')));
        }
        removeLoadingFromButton("buttonDataset1", 1, "Johns Hopkins University CSSE", false, true);
        removeLoadingFromGraph(reportGraph);
        progressBar();
        alertRequestFail("Johns Hopkins University CSSE");
    })
}).catch((err) => {console.log(err)})

//European Centre for Disease Prevention and Control
d3.csv(url1, function(d){
    responseData1.push(d);
}).then(() => {
    if (document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, ''))) {
        document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, '')));
    }
    removeLoadingFromButton("buttonDataset2", 2, "European Centre for Disease Prevention and Control", true);
    progressBar();
}, () => {
    if (document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, ''))) {
        document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, '')));
    }
    removeLoadingFromButton("buttonDataset2", 2, "European Centre for Disease Prevention and Control", false, true);
    removeLoadingFromGraph(reportGraph);
    progressBar();
    alertRequestFail("European Centre for Disease Prevention and Control");
}).catch(err => console.log(err))

//Check for alerts to be displayed
fetch(url6)
.then(data => {return data.json()})
.then(res => {responseAlerts = res})
.catch(err => {console.log('Unable to fetch alerts', err)})

//Events
function ready(callbackFunction){
    if(document.readyState != 'loading')
      callbackFunction(event)
    else
      document.addEventListener("DOMContentLoaded", callbackFunction)
}
ready(event => {
    progressBar();
})
  

dataset1.addEventListener('click', function(){
    choiceDataset = dataset1.id;
    listOfCountries = getCountries();
    if (listOfCountries.some(country => (country == selectedCountry))){
        displayAlert(responseAlerts);
        display = displayCountryData();
    } else {
        selectedCountry = "France"
        document.getElementById("displayCountry").innerText = selectedCountry;
        displayAlert(responseAlerts);
        display = displayCountryData();
    }
    document.getElementById("graph1SettingsGroup").setAttribute("class", "col-auto align-self-center");
    graph1Cases.checked = true;
    graph1Log.checked = false;
    graph2Cases.checked = true;
    graph2Log.checked = false;
    graph1Raw.checked = true;
    document.getElementById("graph1Header").innerText = "Daily Cases";
    document.getElementById("graph2Header").innerText = "Cumulative Cases";
});

dataset2.addEventListener('click', function(){
    choiceDataset = dataset2.id;
    listOfCountries = getCountries();
    if (listOfCountries.some(country => (country == selectedCountry))){
        displayAlert(responseAlerts);
        display = displayCountryData();
    } else {
        selectedCountry = "France"
        document.getElementById("displayCountry").innerText = selectedCountry;
        displayAlert(responseAlerts);
        display = displayCountryData();
    }
    document.getElementById("graph1SettingsGroup").setAttribute("class", "col-auto align-self-center d-none");
    graph1Cases.checked = true;
    graph1Log.checked = false;
    graph2Cases.checked = true;
    graph2Log.checked = false;
    graph1Raw.checked = true;
    document.getElementById("graph1Header").innerText = "Daily Cases";
    document.getElementById("graph2Header").innerText = "Cumulative Cases";
});

document.querySelector("#settings .dropdown").addEventListener('hidden.bs.dropdown', function(){
        searchForm.value = "";
        updateCountryList(listOfCountries);
        selector = null;
})

document.querySelector("#settings .dropdown").addEventListener('shown.bs.dropdown', function(){
    searchForm.focus();
})

refreshButton.addEventListener('click', function(){
    document.location.reload(false);
})

graph1Log.addEventListener('click', function(){
    if (graph1Cases.checked == true){

    } else if (graph1Deaths == true){
 
    }
})

graph1Cases.addEventListener('click', function(){
    switch (choiceDataset){
        case 'dataset1':
            chart1.destroy();
            chart1 = plotTimeseriesYGraph("graph1", display.xdata, display.cases_raw, true, display.cases_mvavg);
            graph1Raw.checked = true;
        break;
        case 'dataset2':
            chart1.destroy();
            chart1 = plotTimeseriesYGraph("graph1", display.xdata.slice(-display.xdata.length+1), display.cases_raw, false);
        break;
    }
    document.getElementById("graph1Header").innerText = "Daily Cases";
})

graph1Deaths.addEventListener('click', function(){
    switch (choiceDataset){
        case 'dataset1':
            chart1.destroy();
            chart1 = plotTimeseriesYGraph("graph1", display.xdata, display.deaths_raw, true, display.deaths_mvavg);
            graph1Raw.checked = true;
        break;
        case 'dataset2':
            chart1.destroy();
            chart1 = plotTimeseriesYGraph("graph1", display.xdata.slice(-display.xdata.length+1), display.deaths_raw, false);
        break;
    }
    document.getElementById("graph1Header").innerText = "Daily Deaths";
})

graph1Raw.addEventListener('click', function(){
    if (choiceDataset == 'dataset1'){
        if (graph1Cases.checked == true){
            chart1.load(Object.assign(display.cases_mvavg, {unload: ["cases_filter1", "cases_filter2"]}))
        } else if (graph1Deaths.checked == true) {
            chart1.load(Object.assign(display.deaths_mvavg, {unload: ["deaths_filter1", "deaths_filter2"]}))
        }
    }
})

graph1Filter1.addEventListener('click', function(){
    if (choiceDataset == 'dataset1'){
        if (graph1Cases.checked == true){
            chart1.load(Object.assign(display.cases_filter1, {unload: ["cases_mvavg", "cases_filter2"]}))
        } else if (graph1Deaths.checked == true) {
            chart1.load(Object.assign(display.deaths_filter1, {unload: ["deaths_mvavg", "deaths_filter2"]}))
        }    
    }
})

graph1Filter2.addEventListener('click', function(){
    if (choiceDataset == 'dataset1'){
        if (graph1Cases.checked == true){
            chart1.load(Object.assign(display.cases_filter2, {unload: ["cases_filter1", "cases_mvavg"]}))
        } else if (graph1Deaths.checked == true) {
            chart1.load(Object.assign(display.deaths_filter2, {unload: ["deaths_filter1", "deaths_mvavg"]}))
        }
    }
})

graph2Log.addEventListener('click', function(){
    if (graph2Cases.checked == true){
 
    } else if (graph2Deaths.checked == true){
 
    }
})

graph2Cases.addEventListener('click', function(){
    chart2.destroy();
    chart2 = plotTimeseriesYGraph("graph2", display.xdata, display.cases_cum_raw, false);
    document.getElementById("graph2Header").innerText = "Cumulative Cases";
})

graph2Deaths.addEventListener('click', function(){
    chart2.destroy();
    chart2 = plotTimeseriesYGraph("graph2", display.xdata, display.deaths_cum_raw, false);
    document.getElementById("graph2Header").innerText = "Cumulative Deaths";
})


window.addEventListener('offline', function(){
    offlineMode();
});

window.addEventListener('online', function(){
    onlineMode();
});

searchForm.addEventListener('input', function(){
    if (searchForm.value.length > 0){
        while (document.querySelector("#countryList li")){
            countryList.removeChild(document.querySelector("#countryList li"));
        };
        listOfCountries.forEach(function(currentValue){
            if (currentValue.replace("_", "").toLowerCase().startsWith(searchForm.value.toLowerCase())){
                let newElt1 = document.createElement('li');
                let newElt2 = document.createElement('a');
                newElt2.setAttribute("href", "#");
                newElt2.setAttribute("name", currentValue.replace("_", ""))
                if (regexProvinceState.test(currentValue)){
                    if (currentValue == selectedCountry){
                        newElt2.setAttribute("class", "dropdown-item active fst-italic fw-light");
                    }
                    else {
                        newElt2.setAttribute("class", "dropdown-item fst-italic fw-light");
                    }
                } else {
                    if (currentValue == selectedCountry){
                        newElt2.setAttribute("class", "dropdown-item active");
                    }
                    else {
                        newElt2.setAttribute("class", "dropdown-item");
                    }
                }
                if (currentValue == "France" || currentValue == "FRA"){
                    newElt2.innerHTML = currentValue + " &#x26A1";
                } else {
                    newElt2.innerHTML = currentValue.replace("_", "");
                }
                countryList.appendChild(newElt1);
                newElt1.appendChild(newElt2);
                newElt1.addEventListener('click', function(){
                    selectedCountry = newElt2.getAttribute("name");
                    document.getElementById("displayCountry").innerText = selectedCountry;
                    enhancedData(modalGraphsData);
                    displayAlert(responseAlerts);
                    display = displayCountryData();
                    searchForm.value = '';
                    graph1Cases.checked = true;
                    graph1Raw.checked = true;
                    graph2Cases.checked = true;
                    
                })
            }
        })
        if (!document.querySelector("#countryList li")){
            let newElt1 = document.createElement('li');
            let newElt2 = document.createElement('a');
            newElt2.setAttribute("href", "#");
            newElt2.setAttribute("class", "dropdown-item disabled");
            newElt2.setAttribute("aria-disabled", "true");
            newElt2.innerText = "No result";
            countryList.appendChild(newElt1);
            newElt1.appendChild(newElt2);
        }
    } else {
        updateCountryList(listOfCountries);
    }
});

searchForm.addEventListener('keyup', function(event){
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    let firstOnList = document.querySelector("#countryList li > a");
    if (event.code == 'ArrowDown' && document.activeElement == searchForm){
        firstOnList.focus();
    }
})

window.addEventListener('resize', function(){
    let width = window.innerWidth;
    if (width >= 1200 && width < 1400){
        chart1.resize({width: 500});
        chart2.resize({width: 500});
        //chart3.resize({width: 500});
    } else if (width >= 1400){
        chart1.resize();
        chart2.resize();
        //chart3.resize();
    } else {
        chart1.resize();
        chart2.resize();
        //chart3.resize();
    }
});

document.getElementById('incidenceRateCard').addEventListener('click', function(){
    document.getElementById("enhancedLabel").innerText = "Incidence Rate";
    document.getElementById("enhancedDescription").innerText = "Number of positive tests for 100,000 habitants in one week. Calculation: (100000*number of positive tests)/population. Indicates the level of epidemiological activity.";
    document.getElementById("enhancedNumber").innerText = document.getElementById("incidenceRate").innerText;
    document.getElementById("enhancedLevel").innerText = document.getElementById("incidenceRateLevel").innerText;
    document.getElementById("enhancedLevel").setAttribute("class", document.getElementById("incidenceRateLevel").getAttribute("class"));
    setTimeout(function(){modalChart1 = plotModalGraph(modalGraphsData[0].date, modalGraphsData[0].data, modalGraphsColor[0], "Incidence")}, 200);
    enhancedModal.toggle();
})

document.getElementById('R0Card').addEventListener('click', function(){
    document.getElementById("enhancedLabel").innerText = "R0";
    document.getElementById("enhancedDescription").innerText = "Reproduction factor. Number of persons contaminated by one patient.";
    document.getElementById("enhancedNumber").innerText = document.getElementById("R0").innerText;
    document.getElementById("enhancedLevel").innerText = document.getElementById("R0Level").innerText;
    document.getElementById("enhancedLevel").setAttribute("class", document.getElementById("R0Level").getAttribute("class"));
    setTimeout(function(){modalChart1 = plotModalGraph(modalGraphsData[1].date, modalGraphsData[1].data, modalGraphsColor[1], "R0")}, 200);
    enhancedModal.toggle();
})

document.getElementById('ruOccupationRateCard').addEventListener('click', function(){
    document.getElementById("enhancedLabel").innerText = "Resuscitation Units Occupation Rate";
    document.getElementById("enhancedDescription").innerText = "Number of resuscitation beds occupied by COVID patients on the initial total number of resuscitation beds available.";
    document.getElementById("enhancedNumber").innerText = document.getElementById("ruOccupationRate").innerText;
    document.getElementById("enhancedLevel").innerText = document.getElementById("ruOccupationRateLevel").innerText;
    document.getElementById("enhancedLevel").setAttribute("class", document.getElementById("ruOccupationRateLevel").getAttribute("class"));
    setTimeout(function(){modalChart1 = plotModalGraph(modalGraphsData[2].date, modalGraphsData[2].data, modalGraphsColor[2], "RU Occupation")}, 200);
    enhancedModal.toggle();
})

document.getElementById('positivityRateCard').addEventListener('click', function(){
    document.getElementById("enhancedLabel").innerText = "Tests Positivity Rate";
    document.getElementById("enhancedDescription").innerText = "Pourcentage of positive tests in one week. Calculation: (100*number of positive tests)/number of conducted tests.";
    document.getElementById("enhancedNumber").innerText = document.getElementById("positivityRate").innerText;
    document.getElementById("enhancedLevel").innerText = document.getElementById("positivityRateLevel").innerText;
    document.getElementById("enhancedLevel").setAttribute("class", document.getElementById("positivityRateLevel").getAttribute("class"));
    setTimeout(function(){modalChart1 = plotModalGraph(modalGraphsData[3].date, modalGraphsData[3].data, modalGraphsColor[3], "Positivity Rate")}, 200);
    enhancedModal.toggle();
})

document.getElementById("enhancedModal").addEventListener('shown.bs.modal', function(){
    if (modalChart1){
        modalChart1.resize()
    }
    if (modalChart2){
        modalChart2.resize()
    }
    if (modalChart3){
        modalChart3.resize()
    }
    if (modalChart4){
        modalChart4.resize()
    }
})

document.getElementById("enhancedModal").addEventListener('hidden.bs.modal', function(){
    if (modalChart1){
        modalChart1 = modalChart1.destroy()
    }
    if (modalChart2){
        modalChart2 = modalChart2.destroy()
    }
    if (modalChart3){
        modalChart3 = modalChart3.destroy()
    }
    if (modalChart4){
        modalChart4 = modalChart4.destroy()
    }
})

//FUNCTIONS DEFINITIONS

function getCountries(){
    let countries = [];
    var distinctCountries;
    switch (choiceDataset){
        case 'dataset2':
            for (let i in responseData1){
                countries.push(responseData1[i]["countriesAndTerritories"].replaceAll('_', ' '));
            };
            distinctCountries = [...new Set(countries)];
            updateCountryList(distinctCountries);
            return distinctCountries
        case 'dataset1':
            for (let i in responseData3){
                if (responseData3[i]["Province/State"]){
                    countries.push("_" + responseData3[i]["Province/State"]);
                } else {
                    countries.push(responseData3[i]["Country/Region"]);
                }
            }
            distinctCountries = [...new Set(countries)];
            updateCountryList(distinctCountries);
            return distinctCountries
        default:
            alert("Sorry, an unexpected error occured. Select a dataset.")
            console.log("Default in getCoutries activated");
        break;           
    };
};

function updateCountryList(distinctCountries){
    while (document.querySelector("#countryList li")){
        countryList.removeChild(document.querySelector("#countryList li"));
    };
    for (let i in distinctCountries){
        let newElt1 = document.createElement('li');
        let newElt2 = document.createElement('a');
        newElt2.setAttribute("href", "#");
        newElt2.setAttribute("name", distinctCountries[i].replace("_", ""))
        if (regexProvinceState.test(distinctCountries[i])){
            if (distinctCountries[i] == "_" + selectedCountry){
                newElt2.setAttribute("class", "dropdown-item active fst-italic fw-light");
            }
            else {
                newElt2.setAttribute("class", "dropdown-item fst-italic fw-light dropdown-section");
            }
        } else {
            if (distinctCountries[i] == selectedCountry){
                newElt2.setAttribute("class", "dropdown-item active");
            }
            else {
                newElt2.setAttribute("class", "dropdown-item");
                if (i > 0 && regexProvinceState.test(distinctCountries[i-1])){
                    newElt2.setAttribute("class", newElt2.getAttribute("class") + " dropdown-section");
                }
            }
        }
        if (distinctCountries[i] == "France" || distinctCountries[i] == "FRA"){
            newElt2.innerHTML = distinctCountries[i] + " &#x26A1";
        } else {
            newElt2.innerHTML = distinctCountries[i].replace("_", "");
        }
        countryList.appendChild(newElt1);
        newElt1.appendChild(newElt2);
        newElt1.addEventListener('click', function(){
            selectedCountry = newElt2.getAttribute("name");
            document.getElementById("displayCountry").innerText = selectedCountry;
            enhancedData(modalGraphsData);
            displayAlert(responseAlerts);
            display = displayCountryData();
            searchForm.value = '';
            graph1Cases.checked = true;
            graph1Raw.checked = true;
            graph2Cases.checked = true;
            
        })
    };
};

function displayAlert(alertObject){

    for(let i in alertObject){
        let messageHTML = alertObject[i].message;
        messageHTML = messageHTML.replaceAll("Warning!", "<b>Warning!</b>");
        messageHTML = messageHTML.replaceAll("Note:", "<b>Note:</b>");
        let countryNames = alertObject[i].country;
        let datasets = alertObject[i].dataset;
        let selectedCountryAlert = selectedCountry + "Alert";

        if (Array.isArray(countryNames)){
            countryNames.forEach(function(country){
            element = countryNames.shift();
            countryNames.push(element.trim());
            });
        } else {
            countryNames = [countryNames.trim()];
        }
        
        if (Array.isArray(datasets)){
            datasets.forEach(function(dataset){
            element = countryNames.shift();
            datasets.push(element.trim());
            });
        } else {
            datasets = [datasets.trim()];
        }
        
        if (countryNames.some(name => (name == selectedCountry))){

            if (document.getElementById(selectedCountryAlert) == null){

                let alert = document.createElement("div")
                document.getElementById('settings').appendChild(alert)
                alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
                alert.setAttribute("role", "alert");
                alert.setAttribute("data-dismiss", "alert");
                alert.setAttribute("id", selectedCountryAlert)
                alert.innerHTML = messageHTML + "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
                new bootstrap.Alert(document.getElementById(selectedCountryAlert))
            }
            
        } else {

            if (document.getElementById(selectedCountryAlert)) {
                document.getElementById('settings').removeChild(document.getElementById(selectedCountryAlert));
            }

            if (datasets.some(dataset => (dataset == choiceDataset) || (dataset == "All"))){

                if (document.getElementById("datasetAlert") == null){

                    let alert = document.createElement("div")
                    document.getElementById('settings').appendChild(alert)
                    alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
                    alert.setAttribute("role", "alert");
                    alert.setAttribute("data-dismiss", "alert");
                    alert.setAttribute("id", "datasetAlert")
                    alert.innerHTML = messageHTML + "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
                    new bootstrap.Alert(document.getElementById(selectedCountryAlert))
                }

            } else if (document.getElementById("datasetAlert")){
                document.getElementById('settings').removeChild(document.getElementById("datasetAlert"));
            }
        }
    }
};

function alertCountry(countryNames, messageHTML){
    if (countryNames.some(name => name == selectedCountry)){
        let alert = document.createElement("div")
        document.getElementById('settings').appendChild(alert)
        alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
        alert.setAttribute("role", "alert");
        alert.setAttribute("data-dismiss", "alert");
        alert.setAttribute("id", "countryAlert")
        alert.innerHTML = messageHTML + "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
        new bootstrap.Alert(document.getElementById(countryAlert))
    } else if (document.getElementById("countryAlert")) {
        document.getElementById('settings').removeChild(document.getElementById("countryAlert"));
    }
}

function alertDataset(dataset, messageHTML){
    if (dataset == choiceDataset && document.getElementById("datasetAlert") == null){
        let alert = document.createElement("div")
        document.getElementById('settings').appendChild(alert)
        alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
        alert.setAttribute("role", "alert");
        alert.setAttribute("data-dismiss", "alert");
        alert.setAttribute("id", "datasetAlert")
        alert.innerHTML = messageHTML + "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
        new bootstrap.Alert(document.getElementById(datasetAlert))
    } 
}

function alertRequestFail(datasetName){
    let alert = document.createElement("div");
    document.getElementById('settings').appendChild(alert);
    alert.setAttribute("class", "alert alert-danger alert-dismissible fade show mt-2");
    alert.setAttribute("role", "alert");
    alert.setAttribute("data-dismiss", "alert");
    alert.setAttribute("id", "requestAlert" + datasetName.replace(/\s+/g, ''))
    alert.innerHTML = "<strong>Error: </strong> The " + datasetName + " dataset can't be loaded. Are you connected to the internet ?<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
    new bootstrap.Alert(document.getElementById("requestAlert" + datasetName.replace(/\s+/g, '')))
}

function offlineMode(){
    document.getElementById("navbar").classList.replace("bg" + onlineTheme, "bg" + offlineTheme);
    document.getElementById("mode").innerHTML = "<strong>offline mode</strong>";
    document.getElementById("refresh").setAttribute("disabled", "");
}

function onlineMode(){
    document.getElementById("navbar").classList.replace("bg" + offlineTheme, "bg" + onlineTheme);
    document.getElementById("mode").innerHTML = "";
    document.getElementById("refresh").removeAttribute("disabled");
}

function updateGraphSize(){
    if (window.innerHeight < window.innerWidth){
        reportGraph.setAttribute("style", "width: auto; height: 85vh;");
        cumulativeGraph.setAttribute("style", "width: auto; height: 85vh;");
        modalGraph1.setAttribute("style", "width: auto; height: 70vh;");
        modalGraph2.setAttribute("style", "width: auto; height: 70vh;");
        modalGraph3.setAttribute("style", "width: auto; height: 70vh;");
        modalGraph4.setAttribute("style", "width: auto; height: 70vh;");
    } else {
        reportGraph.setAttribute("style", "width: auto; height: 70vh;");
        cumulativeGraph.setAttribute("style", "width: auto; height: 40vh;"); 
        modalGraph1.setAttribute("style", "width: auto; height: 50vh;");
        modalGraph2.setAttribute("style", "width: auto; height: 50vh;");
        modalGraph3.setAttribute("style", "width: auto; height: 50vh;");
        modalGraph4.setAttribute("style", "width: auto; height: 50vh;");
    }
}

function removeLoadingFromButton(labelID, datasetNumber, text, enable, error){
    if (enable == true){
        if (datasetNumber == 1){
            dataset1.removeAttribute("disabled");
        }
        if (datasetNumber == 2){
            dataset2.removeAttribute("disabled");
        }
    }
    if (error){
        document.getElementById(labelID).innerHTML = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-exclamation-triangle-fill' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 5zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z'/></svg> " + text;
    } else {
        document.getElementById(labelID).removeChild(document.querySelector("#" + labelID + " > span.spinner-border"));
        if (datasetNumber == 1){
            document.querySelector("#" + labelID + " > span").innerHTML= "&#x1f30d " + text;
        }
        else if (datasetNumber == 2){
            document.querySelector("#" + labelID + " > span").innerHTML = "&#x1f1ea&#x1f1fa " + text;
        }
    }
}

function removeLoadingFromGraph(parentElement){
    reportGraph.removeChild(document.querySelector("#" + reportGraph.getAttribute("id") + "> .d-flex"));
}

function progressBar(){
    let value = progress.getAttribute('style').match(/\d+/g);
    if (value <= 75){
        let newValue = parseInt(value) + 25;
        progress.setAttribute("style", "width: " + newValue.toString() + "%");
        progress.setAttribute("aria-valuenow", newValue.toString());
    }
    if (progress.getAttribute('aria-valuenow') == 100){
        document.getElementsByClassName('sticky-top')[0].removeChild(document.querySelector('.sticky-top > .progress'));
    }
}

function updateNumbers(mydata){
    let end = mydata[0].length - 1;
    let dateNumbers = mydata[0][end];
    let cases = mydata[1][end];
    let cumCases = mydata[5][end];
    let deaths = mydata[3][end];
    let cumDeaths = mydata[6][end];
    let tendencyCases;
    let tendencyDeaths;
    let threshold;
    if (choiceDataset == dataset1.id){
        if (~isNaN(mydata[8][end])){
            let i = 1;
            while (isNaN(tendencyCases) || typeof tendencyCases === 'undefined'){
                tendencyCases = ((mydata[8][end] - mydata[8][end - i]) / mydata[8][end - i]) * 100;
                if (i < 5) {
                    i = i + 1;
                } else {
                    break;
                }          
            }
        } else {
            let i = 1;
            while (isNaN(tendencyCases) || typeof tendencyCases === 'undefined'){
                tendencyCases = ((mydata[8][end - i] - mydata[8][end - i - 1]) / mydata[8][end - i - 1]) * 100;
                if (i < 5) {
                    i = i + 1;
                } else {
                    break;
                }  
            }
        }
        if (~isNaN(mydata[10][end])){
            let i = 1;
            while (isNaN(tendencyDeaths) || typeof tendencyDeaths === 'undefined'){
                tendencyDeaths = ((mydata[10][end] - mydata[10][end - i]) / mydata[10][end - i]) * 100;
                if (i < 5) {
                    i = i + 1;
                } else {
                    break;
                }  
            }
        } else {
            while (isNaN(tendencyDeaths) || typeof tendencyDeaths === 'undefined'){
                tendencyDeaths = ((mydata[10][end - i] - mydata[10][end - i - 1]) / mydata[10][end - i - 1]) * 100;
                if (i < 5) {
                    i = i + 1;
                } else {
                    break;
                }  
            }
        }
        threshold = 1;
    } else if (choiceDataset == dataset2.id){
        tendencyCases = ((mydata[1][end] - mydata[1][end - 1]) / mydata[1][end - 1]) * 100;
        tendencyDeaths = ((mydata[3][end] - mydata[3][end - 1]) / mydata[3][end - 1]) * 100;
        threshold = 1;
    }
    
    document.getElementById('date1').innerText = 'Last reported on ' + dateNumbers.toString() + " (YYYY-MM-DD)";

    let arrowCases;
    if (tendencyCases > threshold){
        arrowCases = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-up-right' fill='#E63757' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M6.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5H7a.5.5 0 0 1-.5-.5z'/><path fill-rule='evenodd' d='M12.354 3.646a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z'/></svg>";
    } else if (tendencyCases < -threshold){
        arrowCases = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-down-right' fill='#00D97E' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M12 7.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H7a.5.5 0 0 1 0-1h4.5V8a.5.5 0 0 1 .5-.5z'/><path fill-rule='evenodd' d='M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z'/></svg>";
    } else {
        arrowCases = "<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' fill='#F6bb43' class='bi bi-arrow-right' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z'/></svg>";
    }
    let arrowDeaths;
    if (tendencyDeaths > threshold){
        arrowDeaths = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-up-right' fill='#E63757' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M6.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5H7a.5.5 0 0 1-.5-.5z'/><path fill-rule='evenodd' d='M12.354 3.646a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z'/></svg>";
    } else if (tendencyDeaths < -threshold){
        arrowDeaths = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-down-right' fill='#00D97E' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M12 7.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H7a.5.5 0 0 1 0-1h4.5V8a.5.5 0 0 1 .5-.5z'/><path fill-rule='evenodd' d='M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z'/></svg>";
    } else {
        arrowDeaths = "<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' fill='#F6bb43' class='bi bi-arrow-right' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z'/></svg>";
    }
    
        document.getElementById("nbDailyCases").innerHTML = Number(cases.toString()).toLocaleString('en-UK');
        document.getElementById('nbDailyCasesArrow').innerHTML = arrowCases;
        document.getElementById("nbCumCases").innerHTML = Number(cumCases.toString()).toLocaleString('en-UK');
        if (choiceDataset == dataset1.id){
            document.getElementById('nbDailyCasesHeader').innerText = "Daily Cases";
        } else if (choiceDataset == dataset2.id){
            document.getElementById('nbDailyCasesHeader').innerText = "Daily Cases";
        }
        document.getElementById('nbCumCasesHeader').innerText = "Cumulative Cases";
    
    
        document.getElementById("nbDailyDeaths").innerHTML = Number(deaths.toString()).toLocaleString('en-UK');
        document.getElementById("nbDailyDeathsArrow").innerHTML = arrowDeaths;
        document.getElementById("nbCumDeaths").innerHTML = Number(cumDeaths.toString()).toLocaleString('en-UK');
        if (choiceDataset == dataset1.id){
            document.getElementById('nbDailyDeathsHeader').innerText = "Daily Deaths";
        } else if (choiceDataset == dataset2.id){
            document.getElementById('nbDailyDeathsHeader').innerText = "Daily Deaths";
        }
        document.getElementById('nbCumDeathsHeader').innerText = "Cumulative Deaths";
}

function enhancedDataExtractor(){
    let incidenceRate = {date:[], data:[]};
    let R0 = {date:[], data:[]};
    let ruOccupationRate = {date:[], data:[]};
    let positivityRate = {date:[], data:[]};

    for (let i in responseEnhancedData){
        if (responseEnhancedData[i].tx_incid != "NA"){
            incidenceRate.date.push(responseEnhancedData[i].extract_date);
            incidenceRate.data.push(parseFloat(responseEnhancedData[i].tx_incid).toFixed(1));
        }
        if (responseEnhancedData[i].R != "NA"){
            R0.date.push(responseEnhancedData[i].extract_date);
            R0.data.push(parseFloat(responseEnhancedData[i].R));
        }
        if (responseEnhancedData[i].taux_occupation_sae != "NA"){
            ruOccupationRate.date.push(responseEnhancedData[i].extract_date);
            ruOccupationRate.data.push(parseFloat(responseEnhancedData[i].taux_occupation_sae).toFixed(1));
        }
        if (responseEnhancedData[i].tx_pos != "NA"){
            positivityRate.date.push(responseEnhancedData[i].extract_date);
            positivityRate.data.push(parseFloat(responseEnhancedData[i].tx_pos).toFixed(2));
        }
    }
    
    return [incidenceRate, R0, ruOccupationRate, positivityRate];
}

function enhancedData(eData){
    let incidenceRate = eData[0];
    let R0 = eData[1];
    let ruOccupationRate = eData[2];
    let positivityRate = eData[3];
    let modalGraph1Color;
    let modalGraph2Color;
    let modalGraph3Color;
    let modalGraph4Color;
    if (selectedCountry == "France" || selectedCountry == "FRA"){
        document.getElementById('enhancedData').setAttribute("class", "");
        //data
        document.getElementById("incidenceRate").innerText = incidenceRate.data[incidenceRate.data.length - 1];
        document.getElementById("date3").innerText = "Last reported on " + incidenceRate.date[incidenceRate.date.length - 1];
        document.getElementById("R0").innerText = R0.data[R0.data.length - 1];
        document.getElementById("date4").innerText = "Last reported on " + R0.date[R0.date.length - 1];
        document.getElementById("ruOccupationRate").innerText = ruOccupationRate.data[ruOccupationRate.data.length - 1] + " %";
        document.getElementById("date5").innerText = "Last reported on " + ruOccupationRate.date[ruOccupationRate.date.length - 1];
        document.getElementById("positivityRate").innerText = positivityRate.data[positivityRate.data.length - 1] + " %";
        document.getElementById("date6").innerText = "Last reported on " + positivityRate.date[positivityRate.date.length - 1];
        //card colors
        if (incidenceRate.data[incidenceRate.data.length - 1] >= 50){
            document.getElementById("incidenceRateLevel").innerText = "Alarming";
            document.getElementById("incidenceRateLevel").setAttribute("class", "text-danger fw-bold user-select-none");
            sparkChart1 = plotSparkGraph("incidenceRateSparkGraph", incidenceRate.date, incidenceRate.data, "#E63757");
            modalGraph1Color = "#E63757";
        } else if (incidenceRate.data[incidenceRate.data.length - 1] >=10){
            document.getElementById("incidenceRateLevel").innerText = "Worrying";
            document.getElementById("incidenceRateLevel").setAttribute("class", "text-warning fw-bold user-select-none");
            sparkChart1 = plotSparkGraph("incidenceRateSparkGraph", incidenceRate.date, incidenceRate.data, "#F6bb43");
            modalGraph1Color = "#F6bb43";
        } else if (incidenceRate.data[incidenceRate.data.length - 1] < 10){
            document.getElementById("incidenceRateLevel").innerText = "Sustainable";
            document.getElementById("incidenceRateLevel").setAttribute("class", "text-success fw-bold user-select-none");
            sparkChart1 = plotSparkGraph("incidenceRateSparkGraph", incidenceRate.date, incidenceRate.data, "#00D97E");
            modalGraph1Color = "#00D97E";
        }
        if (R0.data[R0.data.length - 1] >= 1.5){
            document.getElementById("R0Level").innerText = "Alarming";
            document.getElementById("R0Level").setAttribute("class", "text-danger fw-bold user-select-none");
            sparkChart2 = plotSparkGraph("R0SparkGraph", R0.date, R0.data, "#E63757");
            modalGraph2Color = "#E63757";
        } else if (R0.data[R0.data.length - 1] >= 1.0){
            document.getElementById("R0Level").innerText = "Worrying";
            document.getElementById("R0Level").setAttribute("class", "text-warning fw-bold user-select-none");
            sparkChart2 = plotSparkGraph("R0SparkGraph", R0.date, R0.data, "#F6bb43");
            modalGraph2Color = "#F6bb43";
        } else if (R0.data[R0.data.length - 1] < 1.0){
            document.getElementById("R0Level").innerText = "Sustainable";
            document.getElementById("R0Level").setAttribute("class", "text-success fw-bold user-select-none");
            sparkChart2 = plotSparkGraph("R0SparkGraph", R0.date, R0.data, "#00D97E");
            modalGraph2Color = "#00D97E";
        }
        if (ruOccupationRate.data[ruOccupationRate.data.length - 1] >= 60){
            document.getElementById("ruOccupationRateLevel").innerText = "Alarming";
            document.getElementById("ruOccupationRateLevel").setAttribute("class", "text-danger fw-bold user-select-none");
            sparkChart3 = plotSparkGraph("ruOccupationRateSparkGraph", ruOccupationRate.date, ruOccupationRate.data, "#E63757");
            modalGraph3Color = "#E63757";
        } else if (ruOccupationRate.data[ruOccupationRate.data.length - 1] >= 40){
            document.getElementById("ruOccupationRateLevel").innerText = "Worrying";
            document.getElementById("ruOccupationRateLevel").setAttribute("class", "text-warning fw-bold user-select-none");
            sparkChart3 = plotSparkGraph("ruOccupationRateSparkGraph", ruOccupationRate.date, ruOccupationRate.data, "#F6bb43");
            modalGraph3Color = "#F6bb43";
        } else if (ruOccupationRate.data[ruOccupationRate.data.length - 1] < 40){
            document.getElementById("ruOccupationRateLevel").innerText = "Sustainable";
            document.getElementById("ruOccupationRateLevel").setAttribute("class", "text-success fw-bold user-select-none");
            sparkChart3 = plotSparkGraph("ruOccupationRateSparkGraph", ruOccupationRate.date, ruOccupationRate.data, "#00D97E");
            modalGraph3Color = "#00D97E";
        }
        if (positivityRate.data[positivityRate.data.length - 1] >= 10){
            document.getElementById("positivityRateLevel").innerText = "Alarming";
            document.getElementById("positivityRateLevel").setAttribute("class", "text-danger fw-bold user-select-none");
            sparkChart4 = plotSparkGraph("positivityRateSparkGraph", positivityRate.date, positivityRate.data, "#E63757");
            modalGraph4Color = "#E63757";
        } else if (positivityRate.data[positivityRate.data.length - 1] >= 5){
            document.getElementById("positivityRateLevel").innerText = "Worrying";
            document.getElementById("positivityRateLevel").setAttribute("class", "text-warning fw-bold user-select-none");
            sparkChart4 = plotSparkGraph("positivityRateSparkGraph", positivityRate.date, positivityRate.data, "#F6bb43");
            modalGraph4Color = "#F6bb43";
        } else if (positivityRate.data[positivityRate.data.length - 1] < 5){
            document.getElementById("positivityRateLevel").innerText = "Sustainable";
            document.getElementById("positivityRateLevel").setAttribute("class", "text-success fw-bold user-select-none");
            sparkChart4 = plotSparkGraph("positivityRateSparkGraph", positivityRate.date, positivityRate.data, "#00D97E");
            modalGraph4Color = "#00D97E";
        }
        return [modalGraph1Color, modalGraph2Color, modalGraph3Color, modalGraph4Color]
    } else {
        document.getElementById('enhancedData').setAttribute("class", "d-none");
    }
}

function plotModalGraph(xdata, ydata, color, name){
    var myChart = bb.generate({
        data: {
            x: "x",
            columns: [
                ["x"].concat(xdata),
                ["modal"].concat(ydata)
            ],
            type: 'area',
            colors: {modal: color},
            names: {modal: name}
        },
        axis: {
            x: {
                type: "timeseries",
                tick: {
                    format: "%Y-%m-%d"
                },
                show: false
            },
            y: {
                show: false
            }
        },
        legend: {
            show: false
        },
        padding: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        point: {
            show: false
        },
        transition: {
            duration: 0
        },
        bindto: "#enhancedGraph"
    });
    return myChart
}

function statsBar(mydata){
    let end = mydata[0].length - 1;
    let cumCases = mydata[5];
    let cumDeaths = mydata[6][mydata[6].length - 1];
    let casesOn7days;
    if (choiceDataset == dataset1.id){
        casesOn7days = cumCases[cumCases.length -1] - cumCases[cumCases.length - 8];
    } else if (choiceDataset == dataset2.id){
        casesOn7days = mydata[1][end];
    }
    let pourcentageDeaths = Math.round(cumDeaths*100/cumCases[cumCases.length-1]);
    let pourcentageCasesOn7days = Math.round(casesOn7days*100/cumCases[cumCases.length-1]);
    let pourcentageRecovered = 100 - pourcentageCasesOn7days - pourcentageDeaths;
    statsBarCases.setAttribute("style", "width: " + pourcentageCasesOn7days.toString() + "%");
    statsBarCases.setAttribute("aria-valuenow", pourcentageCasesOn7days.toString());
    statsBarRecovered.setAttribute("style", "width: " + pourcentageRecovered.toString() + "%");
    statsBarRecovered.setAttribute("aria-valuenow", pourcentageRecovered.toString());
    statsBarDeaths.setAttribute("style", "width: " + pourcentageDeaths.toString() + "%");
    statsBarDeaths.setAttribute("aria-valuenow", pourcentageDeaths.toString());
}

function extractCountryData(){
    let covidData;
    switch (choiceDataset){
        case 'dataset2':
            covidData = [];
            for (let i in responseData1){
                if (responseData1[i]["countriesAndTerritories"] == selectedCountry.replaceAll(' ', '_')){
                    covidData.push(responseData1[i]);
                };
            };
        break;
        case 'dataset1':
            covidData = [[], []];
            for (let i in responseData3){
                if (responseData3[i]["Province/State"]){
                    if (responseData3[i]["Province/State"] == selectedCountry){
                        covidData[0].push(responseData3[i]); 
                        covidData[1].push(responseData4[i]);
                    }
                } else if (responseData3[i]["Country/Region"] == selectedCountry){
                    covidData[0].push(responseData3[i]);
                    covidData[1].push(responseData4[i]);
                }
            }
        break;
        default:
            alert("Sorry, an unexpected error occured.");
        break;
    };
    return covidData;
};

function prepareData(data){
    let x = [];
    let yCases = [];
    let yCasesCSAPS = [];
    let yCasesSuperSmoother = [];
    let yCasesAvrg = [];
    let yCasesCumulative = [];
    let yDeaths = [];
    let yDeathsCSAPS = [];
    let yDeathsSuperSmoother = [];
    let yDeathsAvrg = [];
    let yDeathsCumulative = [];

    switch (choiceDataset) {
        case 'dataset2':
            for (let i in data) {
                x.push(data[i]["dateRep"]);
                x[i] = x[i].replace(score, "-");
                let hash = x[i].split(/-/g);
                x[i] = hash[2] + "-" + hash[1] + "-" + hash[0];
                yCases.push(data[i]["cases"]);
                yDeaths.push(data[i]["deaths"]);    
            };

            x = x.reverse();

            yCases = yCases.reverse();
            yDeaths = yDeaths.reverse();
        
            var i = 0;
            yCases.slice().forEach((c) => {
                yCasesCumulative.push(i + parseInt(c));
                i += parseInt(c);
            });
        
            i = 0;
            yDeaths.slice().forEach((d) => {
                yDeathsCumulative.push(i + parseInt(d));
                i += parseInt(d);
            });
            
        return [x, yCases, yCasesAvrg, yDeaths, yDeathsAvrg, yCasesCumulative, yDeathsCumulative];
        
        case 'dataset1':
            for (let i in data[0]) {
                x.push(data[0][i]["date"]);
                yCasesCumulative.push(data[0][i]["cumulative"]);
                yCases.push(data[0][i]["daily"]);
                if (Math.round(parseFloat(data[0][i]["daily_CSAPS"])) >= 0 || isNaN(parseFloat(data[0][i]["daily_CSAPS"]))){
                    yCasesCSAPS.push(Math.round(parseFloat(data[0][i]["daily_CSAPS"])));
                } else {
                    yCasesCSAPS.push(Number(0));
                }
                if (Math.round(parseFloat(data[0][i]["daily_SuperSmoother"])) >= 0 || isNaN(parseFloat(data[0][i]["daily_SuperSmoother"]))){
                    yCasesSuperSmoother.push(Math.round(parseFloat(data[0][i]["daily_SuperSmoother"])));
                } else {
                    yCasesSuperSmoother.push(Number(0));
                }
                yDeathsCumulative.push(data[1][i]["cumulative"]);
                yDeaths.push(data[1][i]["daily"]);
                if (Math.round(parseFloat(data[1][i]["daily_CSAPS"])) >= 0 || isNaN(parseFloat(data[1][i]["daily_CSAPS"]))){
                    yDeathsCSAPS.push(Math.round(parseFloat(data[1][i]["daily_CSAPS"])));
                } else {
                    yDeathsCSAPS.push(Number(0));
                }
                if (Math.round(parseFloat(data[1][i]["daily_SuperSmoother"])) >= 0 || isNaN(parseFloat(data[1][i]["daily_SuperSmoother"]))){
                    yDeathsSuperSmoother.push(Math.round(parseFloat(data[1][i]["daily_SuperSmoother"])));
                } else {
                    yDeathsSuperSmoother.push(Number(0))
                }
            }
            for (let i in yCases) {
                if (i > 6){
                    yDeathsAvrg.push(computeAverage(yDeaths, i, 7));
                } else {
                    yDeathsAvrg.push(NaN);
                }
                if (i > 6){
                    yCasesAvrg.push(computeAverage(yCases, i, 7));
                } else {
                    yCasesAvrg.push(NaN);
                }
            }

        return [x, yCases, yCasesAvrg, yDeaths, yDeathsAvrg, yCasesCumulative, yDeathsCumulative, yCasesCSAPS, yCasesSuperSmoother, yDeathsCSAPS, yDeathsSuperSmoother];
        default:
            alert("Sorry, an unexpected error occured.");
        return null
    }
};


function computeAverage(x, index, range) {
x = x.map(str => Number(str));
return Math.round(x.slice(parseInt(index) - range + 1, parseInt(index) + 1).reduce((acc, val) => acc + val) / range)
}

function accumulate(a, b) {
    return a.reduce((acc, val) => acc + val) + b
}

function computeDerivative(x, index, type) {
        return x[parseInt(index)] - x[parseInt(index)-1]
}

function plotSparkGraph(chartID, xdata, ydata, color){
    var myChart = bb.generate({
        data: {
            x: "x",
            columns: [
                ["x"].concat(xdata),
                ["spark"].concat(ydata)
            ],
            type: 'area',
            colors: {spark: color}
        },
        axis: {
            x: {
                type: "timeseries",
                tick: {
                    format: "%Y-%m-%d"
                },
                show: false
            },
            y: {
                show: false
            }
        },
        legend: {
            show: false
        },
        tooltip: {
            show: false
        },
        padding: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        interaction: {
            enabled: false
        },
        transition: {
            duration: 0
        },
        point: {
            show: false
        },
        bindto: "#" + chartID
    });
    return myChart
}

function plotTimeseriesYGraph(chartID, xdata, dataObject1, legendShow, dataObject2){
    var myChart;
    if (dataObject2){
        myChart = bb.generate({
            data: {
                x: "x",
                columns: [
                ["x"].concat(xdata),
                dataObject1.columns[0],
                dataObject2.columns[0],
                ],
                types: Object.assign(dataObject1.types, dataObject2.types),
                colors: Object.assign(dataObject1.colors, dataObject2.colors),
                names: Object.assign(dataObject1.names, dataObject2.names),
                order: "asc"
            },
            axis: {
                x: {
                    type: "timeseries",
                    tick: {
                        culling: {max: 5},
                        format: "%Y-%m-%d"
                    },
                    show: false
                },
                y: {
                    show: false
                }
            },
            legend: {
                position: 'inset',
                show: legendShow
            },
            transition: {
                duration: 0
            },
            line: {
                point: false,
                classes: [
                    "line-thicker"
                ]
            },
            tooltip: {
                grouped: true
            },
            bindto: "#" + chartID
        });
    } else {
        myChart = bb.generate({
            data: {
                x: "x",
                columns: [
                ["x"].concat(xdata),
                dataObject1.columns[0],
                ],
                types: dataObject1.types,
                colors: dataObject1.colors,
                names: dataObject1.names,
            },
            axis: {
                x: {
                    type: "timeseries",
                    tick: {
                        culling: {max: 5},
                        format: "%Y-%m-%d"
                    },
                    show: false
                },
                y: {
                    show: false
                }
            },
            legend: {
                position: 'inset',
                show: legendShow
            },
            transition: {
                duration: 0
            },
            line: {
                point: false,
                classes: [
                    "line-thicker"
                ]
            },
            tooltip: {
                grouped: true
            },
            bindto: "#" + chartID
        });
    }

    return myChart
}

function displayCountryData(){
    let displayObject;
    let covidData = extractCountryData();
    let mydata = prepareData(covidData);
    updateNumbers(mydata);
    statsBar(mydata);

    switch(choiceDataset){
        case 'dataset1':
            document.getElementById("graph1Header").innerText = "Daily Cases";
            displayObject = {
                xdata: mydata[0],
                cases_raw: {
                    columns: [
                    ["cases_raw"].concat(mydata[1]),
                    ],
                    types: {cases_raw: 'bar'},
                    names: {cases_raw: "Raw data"},
                    colors: {cases_raw: "#205499"},
                },
                cases_mvavg: {
                    columns: [
                    ["cases_mvavg"].concat(mydata[2]),
                    ],
                    types: {cases_mvavg: 'line'},
                    names: {cases_mvavg: "7 days moving average"},
                    colors: {cases_mvavg: "#39afd1"},
                },
                cases_cum_raw: {
                    columns: [
                    ["cases_cum_raw"].concat(mydata[5]),
                    ],
                    types: {cases_cum_raw: 'area'},
                    names: {cases_cum_raw: "Raw data"},
                    colors: {cases_cum_raw: "#39afd1"},
                },
                cases_filter1: {
                    columns: [
                    ["cases_filter1"].concat(mydata[7]),
                    ],
                    types: {cases_filter1: 'line'},
                    names: {cases_filter1: "Cubic smoothing splines"},
                    colors: {cases_filter1: "#39afd1"},
                },
                cases_filter2: {
                    columns: [
                    ["cases_filter2"].concat(mydata[8]),
                    ],
                    types: {cases_filter2: 'line'},
                    names: {cases_filter2: "Super Smoother"},
                    colors: {cases_filter2: "#39afd1"},
                },
                deaths_raw: {
                    columns: [
                    ["deaths_raw"].concat(mydata[3]),
                    ],
                    types: {deaths_raw: 'bar'},
                    names: {deaths_raw: "Raw data"},
                    colors: {deaths_raw: "#205499"},
                },
                deaths_mvavg: {
                    columns: [
                    ["deaths_mvavg"].concat(mydata[4]),
                    ],
                    types: {deaths_mvavg: 'line'},
                    names: {deaths_mvavg: "7 days moving average"},
                    colors: {deaths_mvavg: "#6e84a3"},
                },
                deaths_filter1: {
                    columns: [
                    ["deaths_filter1"].concat(mydata[9]),
                    ],
                    types: {deaths_filter1: 'line'},
                    names: {deaths_filter1: "Cubic smoothing splines"},
                    colors: {deaths_filter1: "#6e84a3"},
                },
                deaths_filter2: {
                    columns: [
                    ["deaths_filter2"].concat(mydata[10]),
                    ],
                    types: {deaths_filter2: 'line'},
                    names: {deaths_filter2: "Super Smoother"},
                    colors: {deaths_filter2: "#6e84a3"},
                },
                deaths_cum_raw: {
                    columns: [
                    ["deaths_cum_raw"].concat(mydata[6]),
                    ],
                    types: {deaths_cum_raw: 'area'},
                    names: {deaths_cum_raw: "Raw data"},
                    colors: {deaths_cum_raw: "#6e84a3"},
                },
            }

            chart1 = plotTimeseriesYGraph("graph1", mydata[0],displayObject.cases_raw, true, displayObject.cases_mvavg);
            chart2 = plotTimeseriesYGraph("graph2", mydata[0], displayObject.cases_cum_raw, false);

            return displayObject

        case 'dataset2':
            document.getElementById("graph1Header").innerText = "Daily Cases";

            displayObject = {
                xdata: mydata[0],
                cases_raw: {
                    columns: [
                    ["cases_raw"].concat(mydata[1].slice(-mydata[1].length+1)),
                    ],
                    types: {cases_raw: 'bar'},
                    names: {cases_raw: "Raw data"},
                    colors: {cases_raw: "#39afd1"},
                },
                cases_cum_raw: {
                    columns: [
                    ["cases_cum_raw"].concat(mydata[5]),
                    ],
                    types: {cases_cum_raw: 'area'},
                    names: {cases_cum_raw: "Raw data"},
                    colors: {cases_cum_raw: "#39afd1"},
                },
                deaths_raw: {
                    columns: [
                    ["deaths_raw"].concat(mydata[3].slice(-mydata[3].length+1)),
                    ],
                    types: {deaths_raw: 'bar'},
                    names: {deaths_raw: "Raw data"},
                    colors: {deaths_raw: "#6e84a3"},
                },
                deaths_cum_raw: {
                    columns: [
                    ["deaths_cum_raw"].concat(mydata[6]),
                    ],
                    types: {deaths_cum_raw: 'area'},
                    names: {deaths_cum_raw: "7 days moving average"},
                    colors: {deaths_cum_raw: "#6e84a3"},
                },
            }

            chart1 = plotTimeseriesYGraph("graph1", mydata[0].slice(-mydata[0].length+1), displayObject.cases_raw, false);
            chart2 = plotTimeseriesYGraph("graph2", mydata[0].slice(-mydata[0].length+1), displayObject.cases_cum_raw, false);

            return displayObject
    }
};


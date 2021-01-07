//STATIC VERSION OF THE DASHBOARD. NO HTTP REQUESTS TO THE SERVER

//GLOBAL CONSTANTS AND VARIABLES
//Fetch Data
const today = new Date();
const dateOfEnd = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const url1 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/CORSgetCSV/?url=https://opendata.ecdc.europa.eu/covid19/casedistribution/csv";
const url2 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/CORSgetJSON/?url=https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/2020-01-02/";
const url3 = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const url4 = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
const url5 = "https://krusty.westeurope.cloudapp.azure.com/api/v2/FRcovidIndicators/";
const url6 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/alerts";
let responseData1;
let responseData2;
let responseData3;
let responseData4;
let responseEnhancedData;
let responseEnhancedData2;
let responseAlerts;
let modalGraphsData;
let modalGraphsColor;

//DOM
//themes
const onlineTheme = "-dark";
const offlineTheme = "-primary";
//graph colors
const primarycolor = "#ffc107";
const secondarycolor = "#343a40";
const thirdcolor = "#dc3545";
const fourthcolor = "#28a745";
//list of countries
const elt = document.getElementById("countryList");
//dataset buttons
const dataset1 = $('#dataset1');
const dataset2 = $('#dataset2');
let choiceDataset = dataset1.attr('id');
//cases/deaths buttons
const casesButton = $('#cases-button');
const deathsButton = $('#deaths-button');
let choiceButton = casesButton.attr('id');
//refresh button
const refreshButton = $('#refresh');
//value in the list of countries
const country = document.getElementById('country');
let selectedCountry = country.value;
//graphs
const reportGraph = document.getElementById('report');
const cumulativeGraph = document.getElementById('cumulative');
//default input in list of countries
const autoInput = new InputEvent('input');
//progress bar datasets loading
const progress = document.getElementById('progressBar');
//key numbers
const nbDaily = document.getElementById('nbDaily');
const nbCum = document.getElementById('nbCum');
//statsBar
const statsBarCases = document.getElementById('statsBarCases');
const statsBarRecovered = document.getElementById('statsBarRecovered');
const statsBarDeaths = document.getElementById('statsBarDeaths');
//Modal Graphs
const modalGraph1 = document.getElementById("incidenceRateGraph");
const modalGraph2 = document.getElementById("R0Graph");
const modalGraph3 = document.getElementById("ruOccupationRateGraph");
const modalGraph4 = document.getElementById("positivityRateGraph");
//Regular Expressions
const score = /\/+/g;
const regexDate = /(\d{1,2}\/\d{1,2}\/\d{1,2})+/g;

//HTTP REQUESTS, FUNCTION CALLING AND EVENTS
//Enhanced Data Request data.gouv.fr
Plotly.d3.csv(url5, function(error, data){
    responseEnhancedData2 = data;
    if (document.getElementById("requestAlert" + "Enhanced Data from data.gouv.fr".replace(/\s+/g, ''))) {
        document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Enhanced Data from data.gouv.fr".replace(/\s+/g, '')));
    }
    if (error) {
        alertRequestFail("Enhanced Data from data.gouv.fr");
        progressBar();
    }
    else {
        responseEnhancedData2 = data;
        modalGraphsData = enhancedDataExtractor();
        modalGraphsColor = enhancedData(modalGraphsData);
        progressBar();
    }
});
//Johns Hopkins University Centre for Science and System Engineering
Plotly.d3.csv(url3, function(data){ 
    responseData3 = data;
    Plotly.d3.csv(url4, function(error, data){
        if (document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, '')));
        }
        if (error) {
            removeLoadingFromButton("dataset1", "Johns Hopkins University CSSE", false, true);
            removeLoadingFromGraph(reportGraph);
            progressBar();
            alertRequestFail("Johns Hopkins University CSSE");
        }
        else {
            responseData4 = data;
            removeLoadingFromButton("dataset1", "Johns Hopkins University CSSE", true);
            progressBar();
            getCountries();
            plotGraph();
        }
    });
});
//European Centre for Disease Prevention and Control
Plotly.d3.csv(url1, function(error, data){
    if (document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, ''))) {
        document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, '')));
    }
    if (error){
        removeLoadingFromButton("dataset2", "European Centre for Disease Prevention and Control", false, true);
        removeLoadingFromGraph(reportGraph);
        progressBar();
        alertRequestFail("European Centre for Disease Prevention and Control");
    } 
    else {
        responseData1 = data;
        removeLoadingFromButton("dataset2", "European Centre for Disease Prevention and Control", true);
        progressBar();
    }
});
//Check for alerts to be displayed
$.ajax({
    async: true,
    url: url6,
    dataType: "json",
    success: function(result){
        responseAlerts = result;
    }
}).fail(function(){
    console.log('Unable to fetch alerts')
});
//Events
$(document).ready(function(){
    progressBar();
});

country.addEventListener('input', function(){
    selectedCountry = country.value;
    modalGraphsColor = enhancedData(modalGraphsData);
    displayAlert(responseAlerts);
    plotGraph();
});

dataset1.on('click', function(){
    choiceDataset = dataset1.attr('id');
    if (document.getElementById('France').getAttribute("value") != "France"){
        document.getElementById('France').setAttribute("value", "France");
        document.getElementById('France').innerHTML = "France &#x26A1";
    }
    getCountries();
    country.dispatchEvent(autoInput);
});

dataset2.on('click', function(){
    choiceDataset = dataset2.attr('id');
    if (document.getElementById('France').getAttribute("value") != "France"){
        document.getElementById('France').setAttribute("value", "France");
        document.getElementById('France').innerHTML = "France &#x26A1";
    }
    getCountries();
    country.dispatchEvent(autoInput);
});

casesButton.on('click', function(){
    choiceButton = casesButton.attr('id');
    plotGraph();
});

deathsButton.on('click', function(){
    choiceButton = deathsButton.attr('id');
    plotGraph();
});

refreshButton.on('click', function(){
    document.location.reload(false);
    console.log("refresh");
});

window.addEventListener('offline', function(){
    offlineMode();
});

window.addEventListener('online', function(){
    onlineMode();
});

$(report).on("plotly_autosize", function(){
    updateGraphSize();
});

$('#incidenceRateModal').on('shown.bs.modal', function (e) {
    modalGraphsPlot(modalGraphsData, modalGraphsColor, 1);    
});

$('#R0Modal').on('shown.bs.modal', function (e) {
    modalGraphsPlot(modalGraphsData, modalGraphsColor, 2);    
});

$('#ruOccupationRateModal').on('shown.bs.modal', function (e) {
    modalGraphsPlot(modalGraphsData, modalGraphsColor, 3);    
});

$('#positivityRateModal').on('shown.bs.modal', function (e) {
    modalGraphsPlot(modalGraphsData, modalGraphsColor, 4);    
});
//window.onorientationchange = updateGraphSize();

//FUNCTIONS DEFINITIONS

function getCountries(){
    let countries = [];
    var distinctCountries;
    switch (choiceDataset){
        case 'dataset2':
            for (let i in responseData1){
                countries.push(responseData1[i]["countriesAndTerritories"]);
            };
            distinctCountries = [...new Set(countries)];
            updateCountryList(distinctCountries);
        break;
        case 'dataset1':
            for (let i in responseData3){
                if (responseData3[i]["Province/State"]){
                    countries.push(responseData3[i]["Province/State"]);
                } else {
                    countries.push(responseData3[i]["Country/Region"]);
                }
            }
            updateCountryList(countries);
        break;
        default:
            alert("Sorry, an unexpected error occured. Select a dataset.")
            console.log("Default in getCoutries activated");
        break;           
    };
    
};

function updateCountryList(distinctCountries){
    while (document.querySelector("#countryList option")){
        elt.removeChild(document.querySelector("#countryList option"));
    };
    for (let i in distinctCountries){
        let newElt = document.createElement('option');
        newElt.setAttribute("value", distinctCountries[i]);
        if (distinctCountries[i] == "France" || distinctCountries[i] == "FRA"){
            newElt.innerHTML = distinctCountries[i] + " &#x26A1";
        } else {
            newElt.innerHTML = distinctCountries[i];
        }
        elt.appendChild(newElt);
    };
};

function displayAlert(alertObject){
    console.log("display alert activated");
    for(let i in alertObject){
        let messageHTML = alertObject[i].message;
        let countryNames = alertObject[i].country;
        let datasets = alertObject[i].dataset;

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
        
        if ((countryNames.some(name => (name == selectedCountry) || (name == "All"))) && (datasets.some(dataset => (dataset == choiceDataset) || (dataset == "All")) && document.getElementById("datasetAlert") == null)){
            let alert = document.createElement("div")
            document.getElementById('settings').appendChild(alert)
            alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
            alert.setAttribute("role", "alert");
            alert.setAttribute("data-dismiss", "alert");
            alert.setAttribute("id", "countryAlert")
            alert.innerHTML = messageHTML + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
            $('.alert').alert();
        } else if (document.getElementById("countryAlert")) {
            document.getElementById('settings').removeChild(document.getElementById("countryAlert"));

            if (datasets.some(dataset => (dataset == choiceDataset) || (dataset == "All")) && document.getElementById("datasetAlert") == null){
                let alert = document.createElement("div")
                document.getElementById('settings').appendChild(alert)
                alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
                alert.setAttribute("role", "alert");
                alert.setAttribute("data-dismiss", "alert");
                alert.setAttribute("id", "datasetAlert")
                alert.innerHTML = messageHTML + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
                $('.alert').alert();
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
        alert.innerHTML = messageHTML + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
        $('.alert').alert();
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
        alert.innerHTML = messageHTML + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
        $('.alert').alert();
    } 
}

function alertRequestFail(datasetName){
    let alert = document.createElement("div");
    document.getElementById('settings').appendChild(alert);
    alert.setAttribute("class", "alert alert-danger alert-dismissible fade show mt-2");
    alert.setAttribute("role", "alert");
    alert.setAttribute("data-dismiss", "alert");
    alert.setAttribute("id", "requestAlert" + datasetName.replace(/\s+/g, ''))
    alert.innerHTML = "<strong>Error: </strong> The " + datasetName + " dataset can't be loaded. Are you connected to the internet ? <small><i>Click to close error</i></small> <button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
    $('.alert').alert();
}

function offlineMode(){
    document.getElementById("navbar").classList.replace("bg" + onlineTheme, "bg" + offlineTheme);
    document.getElementById("mode").innerHTML = "<strong>offline mode</strong>";
    let darkButtons = document.getElementsByClassName("btn" + onlineTheme);
    replaceAll(darkButtons, "btn" + onlineTheme, "btn" + offlineTheme);
    document.getElementById("refresh").setAttribute("disabled", "");
}

function onlineMode(){
    document.getElementById("navbar").classList.replace("bg" + offlineTheme, "bg" + onlineTheme);
    document.getElementById("mode").innerHTML = "";
    let darkButtons = document.getElementsByClassName("btn" + offlineTheme);
    replaceAll(darkButtons, "btn" + offlineTheme, "btn" + onlineTheme);
    document.getElementById("refresh").removeAttribute("disabled");
}

function replaceAll(HTMLCollection, oldClass, newClass){
    while (HTMLCollection.length > 0){
        HTMLCollection[0].classList.replace(oldClass, newClass);
    }
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

function removeLoadingFromButton(parentID, text, enable, error){
    let newElt = document.createElement('input');
    if (enable == true){
        document.getElementById(parentID).removeAttribute("disabled");
    }
    if (error){
        document.getElementById(parentID).innerHTML = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-exclamation-triangle-fill' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 5zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z'/></svg> " + text;
    } else {
        document.getElementById(parentID).textContent = text;
    }
    newElt.setAttribute("type", "radio");
    newElt.setAttribute("name", "datasets");
    if (parentID == "dataset1"){
        newElt.setAttribute("checked", "");
    }
    document.getElementById(parentID).appendChild(newElt);
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
    if (choiceDataset == dataset1.attr('id')){
        tendencyCases = mydata[2][end] - mydata[2][end - 1];
        tendencyDeaths = mydata[4][end] - mydata[4][end - 1];
        threshold = 1;
    } else if (choiceDataset == dataset2.attr('id')){
        tendencyCases = mydata[1][end] - mydata[1][end - 1];
        tendencyDeaths = mydata[3][end] - mydata[3][end - 1];
        threshold = 200;
    }
    
    document.getElementById('date1').innerText = 'Last reported on ' + dateNumbers.toString() + " (YYYY-MM-DD)";
    document.getElementById('date2').innerText = 'Last reported on ' + dateNumbers.toString() + " (YYYY-MM-DD)";
    let arrowCases;
    if (tendencyCases > threshold){
        arrowCases = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-up-right' fill='red' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M6.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5H7a.5.5 0 0 1-.5-.5z'/><path fill-rule='evenodd' d='M12.354 3.646a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z'/></svg>";
    } else if (tendencyCases < -threshold){
        arrowCases = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-down-right' fill='green' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M12 7.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H7a.5.5 0 0 1 0-1h4.5V8a.5.5 0 0 1 .5-.5z'/><path fill-rule='evenodd' d='M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z'/></svg>";
    } else {
        arrowCases = "";
    }
    let arrowDeaths;
    if (tendencyDeaths > threshold){
        arrowDeaths = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-up-right' fill='red' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M6.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5H7a.5.5 0 0 1-.5-.5z'/><path fill-rule='evenodd' d='M12.354 3.646a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z'/></svg>";
    } else if (tendencyDeaths < -threshold){
        arrowDeaths = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-down-right' fill='green' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M12 7.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H7a.5.5 0 0 1 0-1h4.5V8a.5.5 0 0 1 .5-.5z'/><path fill-rule='evenodd' d='M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z'/></svg>";
    } else {
        arrowDeaths = "";
    }
    if (choiceButton == casesButton.attr('id')){
        nbDaily.innerHTML = Number(cases.toString()).toLocaleString('en-UK') + " " + arrowCases;
        nbCum.innerHTML = Number(cumCases.toString()).toLocaleString('en-UK');
        if (choiceDataset == dataset1.attr('id')){
            document.getElementById('nbDailyHeader').innerText = "Daily New Cases";
        } else if (choiceDataset == dataset2.attr('id')){
            document.getElementById('nbDailyHeader').innerText = "Weekly New Cases";
        }
        document.getElementById('nbCumHeader').innerText = "Cumulative Number of Cases";
    }
    if (choiceButton == deathsButton.attr('id')){
        nbDaily.innerHTML = Number(deaths.toString()).toLocaleString('en-UK') + " " + arrowDeaths;
        nbCum.innerHTML = Number(cumDeaths.toString()).toLocaleString('en-UK');
        if (choiceDataset == dataset1.attr('id')){
            document.getElementById('nbDailyHeader').innerText = "Daily New Deaths";
        } else if (choiceDataset == dataset2.attr('id')){
            document.getElementById('nbDailyHeader').innerText = "Weekly New Deaths";
        }
        document.getElementById('nbCumHeader').innerText = "Cumulative Number of Deaths";
    }
}

function enhancedDataExtractor(){
    let incidenceRate = {date:[], data:[]};
    let R0 = {date:[], data:[]};
    let ruOccupationRate = {date:[], data:[]};
    let positivityRate = {date:[], data:[]};

    for (let i in responseEnhancedData2){
        if (responseEnhancedData2[i].tx_incid != "NA"){
            incidenceRate.date.push(responseEnhancedData2[i].extract_date);
            incidenceRate.data.push(responseEnhancedData2[i].tx_incid);
        }
        if (responseEnhancedData2[i].R != "NA"){
            R0.date.push(responseEnhancedData2[i].extract_date);
            R0.data.push(responseEnhancedData2[i].R);
        }
        if (responseEnhancedData2[i].taux_occupation_sae != "NA"){
            ruOccupationRate.date.push(responseEnhancedData2[i].extract_date);
            ruOccupationRate.data.push(responseEnhancedData2[i].taux_occupation_sae);
        }
        if (responseEnhancedData2[i].tx_pos != "NA"){
            positivityRate.date.push(responseEnhancedData2[i].extract_date);
            positivityRate.data.push(responseEnhancedData2[i].tx_pos);
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
        document.getElementById('enhancedData').setAttribute("class", "card border-dark text-center");
        //data
        document.getElementById("incidenceRate").innerText = incidenceRate.data[incidenceRate.data.length - 1].slice(0,5);
        document.getElementById("date3").innerText = "Last reported on " + incidenceRate.date[incidenceRate.date.length - 1];
        document.getElementById("R0").innerText = R0.data[R0.data.length - 1];
        document.getElementById("date4").innerText = "Last reported on " + R0.date[R0.date.length - 1];
        document.getElementById("ruOccupationRate").innerText = ruOccupationRate.data[ruOccupationRate.data.length - 1].slice(0,4) + " %";
        document.getElementById("date5").innerText = "Last reported on " + ruOccupationRate.date[ruOccupationRate.date.length - 1];
        document.getElementById("positivityRate").innerText = positivityRate.data[positivityRate.data.length - 1].slice(0,4) + " %";
        document.getElementById("date6").innerText = "Last reported on " + positivityRate.date[positivityRate.date.length - 1];
        //card colors
        if (incidenceRate.data[incidenceRate.data.length - 1].slice(0,4) >= 50){
            document.getElementById("incidenceRateCard").setAttribute("class", "card text-white bg-danger border-0 mb-3 text-center card-enhanced");
            modalGraph1Color = thirdcolor;
        } else if (incidenceRate.data[incidenceRate.data.length - 1].slice(0,4) >=10){
            document.getElementById("incidenceRateCard").setAttribute("class", "card text-white bg-warning border-0 mb-3 text-center card-enhanced");
            modalGraph1Color = primarycolor;
        } else if (incidenceRate.data[incidenceRate.data.length - 1].slice(0,4) < 10){
            document.getElementById("incidenceRateCard").setAttribute("class", "card text-white bg-success border-0 mb-3 text-center card-enhanced");
            modalGraph1Color = fourthcolor;
        }
        if (R0.data[R0.data.length - 1] >= 1.5){
            document.getElementById("R0Card").setAttribute("class", "card text-white bg-danger border-0 mb-3 text-center card-enhanced");
            modalGraph2Color = thirdcolor;
        } else if (R0.data[R0.data.length - 1] >= 1.0){
            document.getElementById("R0Card").setAttribute("class", "card text-white bg-warning border-0 mb-3 text-center card-enhanced");
            modalGraph2Color = primarycolor;
        } else if (R0.data[R0.data.length - 1] < 1.0){
            document.getElementById("R0Card").setAttribute("class", "card text-white bg-success border-0 mb-3 text-center card-enhanced");
            modalGraph2Color = fourthcolor;
        }
        if (ruOccupationRate.data[ruOccupationRate.data.length - 1].slice(0,4) >= 60){
            document.getElementById("ruOccupationRateCard").setAttribute("class", "card text-white bg-danger border-0 mb-3 text-center card-enhanced");
            modalGraph3Color = thirdcolor;
        } else if (ruOccupationRate.data[ruOccupationRate.data.length - 1].slice(0,4) >= 40){
            document.getElementById("ruOccupationRateCard").setAttribute("class", "card text-white bg-warning border-0 mb-3 text-center card-enhanced");
            modalGraph3Color = primarycolor;
        } else if (ruOccupationRate.data[ruOccupationRate.data.length - 1].slice(0,4) < 40){
            document.getElementById("ruOccupationRateCard").setAttribute("class", "card text-white bg-success border-0 mb-3 text-center card-enhanced");
            modalGraph3Color = fourthcolor;
        }
        if (positivityRate.data[positivityRate.data.length - 1].slice(0,4) >= 10){
            document.getElementById("positivityRateCard").setAttribute("class", "card text-white bg-danger border-0 mb-3 text-center card-enhanced");
            modalGraph4Color = thirdcolor;
        } else if (positivityRate.data[positivityRate.data.length - 1].slice(0,4) >= 5){
            document.getElementById("positivityRateCard").setAttribute("class", "card text-white bg-warning border-0 mb-3 text-center card-enhanced");
            modalGraph4Color = primarycolor;
        } else if (positivityRate.data[positivityRate.data.length - 1].slice(0,4) < 5){
            document.getElementById("positivityRateCard").setAttribute("class", "card text-white bg-success border-0 mb-3 text-center card-enhanced");
            modalGraph4Color = fourthcolor;
        }
    } else {
        document.getElementById('enhancedData').setAttribute("class", "card border-dark text-center d-none");
    }
    return [modalGraph1Color, modalGraph2Color, modalGraph3Color, modalGraph4Color]
}

function modalGraphsPlot(graphData, graphColors, modalChoice){
    let incidenceRate = graphData[0];
    let R0 = graphData[1];
    let ruOccupationRate = graphData[2];
    let positivityRate = graphData[3];
    let modalGraph1Color = graphColors[0];
    let modalGraph2Color = graphColors[1];
    let modalGraph3Color = graphColors[2];
    let modalGraph4Color = graphColors[3];
    //Modal Graphs
    switch(modalChoice){
        case 1:
            Plotly.newPlot( modalGraph1, [{
                type: "bar",
                x: incidenceRate.date,
                y: incidenceRate.data,
                marker: {color: modalGraph1Color} }], {
                title: "Incidence Rate",
                showlegend: false,
                yaxis: {fixedrange: true},
                xaxis : {fixedrange: true} }, {
                responsive: true,
                modeBarButtonsToRemove: ['zoom2d'],
                displayModeBar: false} );
        break;
        case 2:
            Plotly.newPlot( modalGraph2, [{
                type: "bar",
                x: R0.date,
                y: R0.data,
                marker: {color: modalGraph2Color} }], {
                title: "R0",
                showlegend: false,
                yaxis: {fixedrange: true},
                xaxis : {fixedrange: true} }, {
                responsive: true,
                modeBarButtonsToRemove: ['zoom2d'],
                displayModeBar: false} );
        break;
        case 3:
            Plotly.newPlot( modalGraph3, [{
                type: "bar",
                x: ruOccupationRate.date,
                y: ruOccupationRate.data,
                marker: {color: modalGraph3Color} }], {
                title: "Resuscitation units occupation rate",
                showlegend: false,
                yaxis: {fixedrange: true},
                xaxis : {fixedrange: true} }, {
                responsive: true,
                modeBarButtonsToRemove: ['zoom2d'],
                displayModeBar: false} );
        break;
        case 4:
            Plotly.newPlot( modalGraph4, [{
                type: "bar",
                x: positivityRate.date,
                y: positivityRate.data,
                marker: {color: modalGraph4Color} }], {
                title: "Tests Positivity Rate",
                showlegend: false,
                yaxis: {fixedrange: true},
                xaxis : {fixedrange: true} }, {
                responsive: true,
                modeBarButtonsToRemove: ['zoom2d'],
                displayModeBar: false} );
        break;
        default:
            console.log("Wrong modal choice");
        break;
    }
}

function statsBar(mydata){
    let end = mydata[0].length - 1;
    let cumCases = mydata[5];
    let cumDeaths = mydata[6][mydata[6].length - 1];
    let casesOn7days;
    if (choiceDataset == dataset1.attr('id')){
        casesOn7days = cumCases[cumCases.length -1] - cumCases[cumCases.length - 8];
    } else if (choiceDataset == dataset2.attr('id')){
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
    let covidData = [];
    switch (choiceDataset){
        case 'dataset2':
            for (let i in responseData1){
                if (responseData1[i]["countriesAndTerritories"] == selectedCountry){
                    covidData.push(responseData1[i]);
                };
            };
        break;
        case 'dataset1':
            for (let i in responseData3){
                if (responseData3[i]["Province/State"]){
                    if (responseData3[i]["Province/State"] == selectedCountry){
                        covidData.push(responseData3[i]); 
                        covidData.push(responseData4[i]);
                    }
                } else if (responseData3[i]["Country/Region"] == selectedCountry){
                    covidData.push(responseData3[i]);
                    covidData.push(responseData4[i]);
                }
            }
        break;
        default:
            alert("Sorry, an unexpected error occured.");
        break;
    };

    return covidData;
};

function dataToArray(data){
    let x = [];
    let yCases = [];
    let yCasesAvrg = [];
    let yCasesCumulative = [];
    let yDeaths = [];
    let yDeathsAvrg = [];
    let yDeathsCumulative = [];

    switch (choiceDataset) {
        case 'dataset2':
            for (let i in data) {
                x.push(data[i]["dateRep"]);
                x[i] = x[i].replace(score, "-");
                let hash = x[i].split(/-/g);
                x[i] = hash[2] + "-" + hash[1] + "-" + hash[0];
                yCases.push(data[i]["cases_weekly"]);
                yCasesAvrg.push(NaN);
                yDeaths.push(data[i]["deaths_weekly"]);    
                yDeathsAvrg.push(NaN);
            };

            x = x.reverse();

            yCases = yCases.reverse();
            yCasesAvrg = yCasesAvrg.reverse();
            yDeaths = yDeaths.reverse();
            yDeathsAvrg = yDeathsAvrg.reverse();
        
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

        break;
        case 'dataset1':
            keys = Object.keys(data[0]);
            x = keys.filter(key => key.match(regexDate));
            x.forEach(key => yCasesCumulative.push(data[0][key]));
            x.forEach(key => yDeathsCumulative.push(data[1][key]));
            for (let i in x){
                x[i] = x[i].replace(score, "-");
                let hash = x[i].split(/-/g);
                x[i] = hash[2] + "-" + hash[0] + "-" + hash[1];
            };

            for (let i in keys) {
                
                if (i > 0){
                    yCases.push(computeDerivative(yCasesCumulative, i, "confirmed"));
                } else {
                    yCases.push(yCasesCumulative[i]);
                }

                if (i > 0){
                    yDeaths.push(computeDerivative(yDeathsCumulative, i, "deaths"));
                } else {
                    yDeaths.push(yDeathsCumulative[i]);
                }

            }
            for (let i in yCases) {
                if (i > 6){
                    yDeathsAvrg.push(computeAverage(yDeaths, i, 7, "deaths"));
                } else {
                    yDeathsAvrg.push(NaN);
                }
                if (i > 6){
                    yCasesAvrg.push(computeAverage(yCases, i, 7, "confirmed"));
                } else {
                    yCasesAvrg.push(NaN);
                }
            }

        break;
        default:
            alert("Sorry, an unexpected error occured.");
    }

    return [x, yCases, yCasesAvrg, yDeaths, yDeathsAvrg, yCasesCumulative, yDeathsCumulative];
};


function computeAverage(x, index, range, type) {
    switch (choiceDataset){
        case 'dataset2':
            return x.slice(
                parseInt(index), parseInt(index) + range
            )
            .map(x => x[type])
            .reduce((acc, val) => parseInt(acc) + parseInt(val))
            / range
        case 'dataset1':
            return x.slice(
                parseInt(index) - range + 1, parseInt(index) + 1
            )
            .reduce((acc, val) => acc + val)
            / range
        default:
            console.log("Default in computeAverage activated")
    }
}

function accumulate(a, b) {
    return a.reduce((acc, val) => acc + val) + b
}

function computeDerivative(x, index, type) {
        return x[parseInt(index)] - x[parseInt(index)-1]
}

function plotGraph(){
    console.log("plot graph activated");
    let covidData = extractCountryData();
    let mydata = dataToArray(covidData);
    updateNumbers(mydata);
    statsBar(mydata);
    
    if (choiceButton == casesButton.attr('id')) {
        var trace1 = {
            type: "bar",
            name: "raw data",
            x: mydata[0],
            y: mydata[1],
            marker: {color: primarycolor}
        };

        var trace2 = {
            type: 'scatter',
            mode: 'lines',
            name: "7 days moving average",
            x: mydata[0],
            y: mydata[2],
            line: {color: secondarycolor}
        };

        var trace3 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative',
            x: mydata[0],
            y: mydata[5],
            line: {color: primarycolor}
        }

        /*
        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[2].map(x => Math.log(x)),
            line: {color: secondarycolor}
        }

        yaxis2: {
                title: 'Number of cases (log scale)',
                overlaying: 'y',
                side: 'right',
                fixedrange: true
            },

        */

        var layout1 = {
            title: 'Daily New Cases',
            xaxis : {fixedrange: true},
            yaxis: {
                title: 'Number of cases',
                fixedrange: true
            },
            legend: {
                "orientation": "h",
                x: 0.5,
                xanchor: "center",
                y: 1.05,
                yanchor: "middle"
            }
        };

        var layout2 = {
            title: 'Cumulative Cases',
            xaxis : {fixedrange: true},
            yaxis: {
                title: 'Number of cases',
                fixedrange: true
            },
            legend: {
                "orientation": "h",
                x: 0.5,
                xanchor: "center",
                y: 1.05,
                yanchor: "middle"
            }
        };

    } else if (choiceButton == deathsButton.attr('id')) {
        var trace1 = {
            type: "bar",
            name: "raw data",
            x: mydata[0],
            y: mydata[3],
            marker: {color: thirdcolor}
        };

        var trace2 = {
            type: 'scatter',
            mode: 'lines',
            name: "7 days moving average",
            x: mydata[0],
            y: mydata[4],
            line: {color: secondarycolor}
        };

        var trace3 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative',
            x: mydata[0],
            y: mydata[6],
            line: {color: thirdcolor}
        }
        /*
        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[4].map(x => Math.log(x)),
            line: {color: secondarycolor}
        }

        yaxis2: {
                title: 'Number of deaths (log scale)',
                overlaying: 'y',
                side: 'right',
                fixedrange: true
            },
        */

        var layout1 = {
            title: 'Daily New Deaths',
            xaxis : {fixedrange: true},
            yaxis: {
                title: 'Number of deaths',
                fixedrange: true
            },
            legend: {
                "orientation": "h",
                x: 0.5,
                xanchor: "center",
                y: 1.05,
                yanchor: "middle"
            }
        };

        var layout2 = {
            title: 'Cumulative Deaths',
            xaxis : {fixedrange: true},
            yaxis: {
                title: 'Number of deaths',
                fixedrange: true
            },
            legend: {
                "orientation": "h",
                x: 0.5,
                xanchor: "center",
                y: 1.05,
                yanchor: "middle"
            }
        };

    } else {
        alert("Sorry, we are not able to plot any graph.");
    }

    var reportData = [trace1, trace2];
    var cumulativeData = [trace3];
    var config = { 
        responsive: true,
        displayModeBar: false 
    };

    if (document.querySelector("#report > .d-flex"))
    {
        let elt = document.querySelector("#report > .d-flex");
        document.getElementById('report').removeChild(elt);
    }

    //console.log(reportData, cumulativeData);
    Plotly.newPlot(reportGraph, reportData, layout1, config);
    Plotly.newPlot(cumulativeGraph, cumulativeData, layout2, config);
};

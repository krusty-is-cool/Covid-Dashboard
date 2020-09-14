//STATIC VERSION OF THE DASHBOARD. NO HTTP REQUESTS TO THE SERVER

//GLOBAL CONSTANTS AND VARIABLES
//Fetch Data
const today = new Date();
const dateOfEnd = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const url1 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/CORSgetCSV/?url=https://opendata.ecdc.europa.eu/covid19/casedistribution/csv";
const url2 = "https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/2020-01-02/";
const url3 = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const url4 = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
const url5 = "https://krusty.westeurope.cloudapp.azure.com/api/v1/FRcovidIndicators/";
let responseData1;
let responseData2;
let responseData3;
let responseData4;
let responseEnhancedData;

//DOM
//themes
const onlineTheme = "-dark";
const offlineTheme = "-primary";
//graph colors
const primarycolor = "#ffc107";
const secondarycolor = "#343a40";
const thirdcolor = "#dc3545";
//list of countries
const elt = document.getElementById("countryList");
//dataset buttons
const dataset1 = $('#dataset1');
const dataset2 = $('#dataset2');
const dataset3 = $('#dataset3');
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

//HTTP REQUESTS, FUNCTION CALLING AND EVENTS
//European Centre for Disease Prevention and Control
Plotly.d3.csv(url1, function(error, data){
    if (document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, ''))) {
        document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "European Centre for Disease Prevention and Control".replace(/\s+/g, '')));
    }
    if (error){
        removeLoadingFromButton("dataset1", "European Centre for Disease Prevention and Control", false, true);
        removeLoadingFromGraph(reportGraph);
        progressBar();
        alertRequestFail("European Centre for Disease Prevention and Control");
    } 
    else {
        responseData1 = data;
        removeLoadingFromButton("dataset1", "European Centre for Disease Prevention and Control", true);
        progressBar();
        getCountries();
        plotGraph();
    }
});
//Oxford University Blavatnik School of Government
$.ajax({
    async: true,
    url: url2 + dateOfEnd,
    dataType: "json",
    success: function(result){
        if (document.getElementById("requestAlert" + "Oxford University BSG".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Oxford University BSG".replace(/\s+/g, '')));
        }
        responseData2 = result;
        removeLoadingFromButton("dataset2", "Oxford University BSG", true);
        progressBar();
    }
}).fail(function(){
    removeLoadingFromButton("dataset2", "Oxford University BSG", false, true);
    removeLoadingFromGraph(reportGraph);
    progressBar();
    alertRequestFail("Oxford University BSG");
});
//Johns Hopkins University Centre for Science and System Engineering
Plotly.d3.csv(url3, function(data){ 
    responseData3 = data;
    Plotly.d3.csv(url4, function(error, data){
        if (document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, '')));
        }
        if (error) {
            removeLoadingFromButton("dataset3", "Johns Hopkins University CSSE", false, true);
            removeLoadingFromGraph(reportGraph);
            progressBar();
            alertRequestFail("Johns Hopkins University CSSE");
        }
        else {
            responseData4 = data;
            removeLoadingFromButton("dataset3", "Johns Hopkins University CSSE", true);
            progressBar();
        }
    });
} );
//Enhanced Data Request data.gouv.fr
$.ajax({
    async: true,
    url: url5,
    dataType: "json",
    success: function(result){
        responseEnhancedData = result;
        if (document.getElementById("requestAlert" + "Enhanced Data from data.gouv.fr".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Enhanced Data from data.gouv.fr".replace(/\s+/g, '')));
        }
        enhancedData();
    }
}).fail(function(){
    alertRequestFail("Enhanced Data from data.gouv.fr");
});
//Events
$(document).ready(function(){
    progressBar();
});

country.addEventListener('input', function(){
    selectedCountry = country.value;
    enhancedData();
    //country warnings
    //alertCountry(["United_Kingdom", "GBR"], "<strong>Note: </strong> On 3 July the UK announced an ongoing revision of historical data that lead to a negative number of new cases and an overall decrease in cases for the UK. <small><i>Click to close warning</i></small>");
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
    document.getElementById('France').setAttribute("value", "FRA");
    document.getElementById('France').innerHTML = "FRA &#x26A1";
    alertDataset("dataset2", "<strong>From August, 6 to August, 19 2020</strong> Oxford University BSG has not sent any relevant data. This can result in catch-up effects with surprising high numbers of cases/deaths in one day. Similar events could recur periodically. <small><i>Click to close warning</i></small>");
    getCountries();
    country.dispatchEvent(autoInput);
});

dataset3.on('click', function(){
    choiceDataset = dataset3.attr('id');
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

//window.onorientationchange = updateGraphSize();

//FUNCTIONS DEFINITIONS

function getCountries(){
    let countries = [];
    var distinctCountries;
    switch (choiceDataset){
        case 'dataset1':
            for (let i in responseData1){
                countries.push(responseData1[i]["countriesAndTerritories"]);
            };
            distinctCountries = [...new Set(countries)];
            updateCountryList(distinctCountries);
        break;
        case 'dataset2':
            for (let i in responseData2["countries"]){
                countries.push(responseData2["countries"][i]);
            };
            distinctCountries = [...new Set(countries)];
            updateCountryList(distinctCountries);
        break;
        case 'dataset3':
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
    } else {
        reportGraph.setAttribute("style", "width: auto; height: 70vh;");
        cumulativeGraph.setAttribute("style", "width: auto; height: 70vh;"); 
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
    let tendencyCases = mydata[2][end] - mydata[2][end - 1];
    let tendencyDeaths = mydata[4][end] - mydata[4][end - 1];
    document.getElementById('date1').innerText = 'lastly reported on ' + dateNumbers.toString() + " (YYYY-MM-DD)";
    document.getElementById('date2').innerText = 'lastly reported on ' + dateNumbers.toString() + " (YYYY-MM-DD)";
    let arrowCases;
    if (tendencyCases > 0.1){
        arrowCases = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-up-right' fill='red' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M6.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5H7a.5.5 0 0 1-.5-.5z'/><path fill-rule='evenodd' d='M12.354 3.646a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z'/></svg>";
    } else if (tendencyCases < -0.1){
        arrowCases = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-down-right' fill='green' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M12 7.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H7a.5.5 0 0 1 0-1h4.5V8a.5.5 0 0 1 .5-.5z'/><path fill-rule='evenodd' d='M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z'/></svg>";
    } else if (tendencyCases == 0){
        arrowCases = "";
    }
    let arrowDeaths;
    if (tendencyDeaths > 0.1){
        arrowDeaths = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-up-right' fill='red' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M6.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5H7a.5.5 0 0 1-.5-.5z'/><path fill-rule='evenodd' d='M12.354 3.646a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z'/></svg>";
    } else if (tendencyDeaths < -0.1){
        arrowDeaths = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-arrow-down-right' fill='green' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M12 7.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H7a.5.5 0 0 1 0-1h4.5V8a.5.5 0 0 1 .5-.5z'/><path fill-rule='evenodd' d='M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z'/></svg>";
    } else if (tendencyDeaths ==  0){
        arrowDeaths = "";
    }
    if (choiceButton == casesButton.attr('id')){
        nbDaily.innerHTML = cases.toString() + " " + arrowCases;
        nbCum.innerHTML = cumCases.toString();
        document.getElementById('nbDailyHeader').innerText = "Daily New Cases";
        document.getElementById('nbCumHeader').innerText = "Cumulative Number of Cases";
    }
    if (choiceButton == deathsButton.attr('id')){
        nbDaily.innerHTML = deaths.toString() + " " + arrowDeaths;
        nbCum.innerHTML = cumDeaths.toString();
        document.getElementById('nbDailyHeader').innerText = "Daily New Deaths";
        document.getElementById('nbCumHeader').innerText = "Cumulative Number of Deaths";
    }
}

function enhancedData(){
    if (selectedCountry == "France" || selectedCountry == "FRA"){
        document.getElementById('enhancedData').setAttribute("class", "card border-dark text-center");
        document.getElementById("incidenceRate").innerText = responseEnhancedData["tx_incid"].slice(0,4);
        document.getElementById("R0").innerText = responseEnhancedData["R"];
        document.getElementById("ruOccupationRate").innerText = responseEnhancedData["taux_occupation_sae"].slice(0,3) + " %";
        document.getElementById("positivityRate").innerText = responseEnhancedData["tx_pos"].slice(0,3) + " %";
        document.getElementById("date3").innerText = "lastly reported on " + responseEnhancedData["extract_date"] + " (YYYY-MM-DD)";
    } else {
        document.getElementById('enhancedData').setAttribute("class", "card border-dark text-center d-none");
    }
}

function statsBar(mydata){
    let cumCases = mydata[5];
    let cumDeaths = mydata[6][mydata[6].length - 1];
    let casesOn7days = cumCases[cumCases.length -1] - cumCases[cumCases.length - 8];
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
        case 'dataset1':
            for (let i in responseData1){
                if (responseData1[i]["countriesAndTerritories"] == selectedCountry){
                    covidData.push(responseData1[i]);
                };
            };
        break;
        case 'dataset2':
            var i = 0;
            for (let date in responseData2["data"]){
                if (responseData2["data"][date][selectedCountry] == undefined) {
                    responseData2["data"][date][selectedCountry] = {
                        confirmed: covidData[i-1]["confirmed"],
                        country_code: selectedCountry,
                        date_value: date,
                        deaths: covidData[i-1]["deaths"]
                    };
                }
                covidData.push(responseData2["data"][date][selectedCountry]);
                i = i+1;
            };
        break;
        case 'dataset3':
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
        case 'dataset1':
            for (let i in data) {
                x.push(String(data[i]["year"])+"-"+String(data[i]["month"])+"-"+String(data[i]["day"]));
        
                yCases.push(data[i]["cases"]);
        
                if (i < data.length - 6){
                    yCasesAvrg.push(computeAverage(data, i, 7, 'cases'))
                } else {
                    yCasesAvrg.push(NaN);
                }
        
                yDeaths.push(data[i]["deaths"]);
        
                if (i < data.length - 6){
                    yDeathsAvrg.push(computeAverage(data, i, 7, 'deaths'));
                } else {
                    yDeathsAvrg.push(NaN);
                }   
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
        case 'dataset2':
            for (let i in data) {
                x.push(data[i]["date_value"]);
                
                if (i > 0){
                    yCases.push(computeDerivative(data, i, "confirmed"));
                } else {
                    yCases.push(data[i]["confirmed"]);
                }

                if (i > 0){
                    yDeaths.push(computeDerivative(data, i, "deaths"));
                } else {
                    yDeaths.push(data[i]["deaths"]);
                }

                yCasesCumulative.push(data[i]["confirmed"]);
                
                yDeathsCumulative.push(data[i]["deaths"]);

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
        case 'dataset3':
            const regex = /(\d{1,2}\/\d{1,2}\/\d{1,2})+/g;
            keys = Object.keys(data[0]);
            x = keys.filter(key => key.match(regex));
            x.forEach(key => yCasesCumulative.push(data[0][key]));
            x.forEach(key => yDeathsCumulative.push(data[1][key]));
            const score = /\/+/g;
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
        case 'dataset1':
            return x.slice(
                parseInt(index), parseInt(index) + range
            )
            .map(x => x[type])
            .reduce((acc, val) => parseInt(acc) + parseInt(val))
            / range
        case 'dataset2':
            return x.slice(
                parseInt(index) - range + 1, parseInt(index) + 1
            )
            .reduce((acc, val) => acc + val)
            / range
        case 'dataset3':
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
    switch (choiceDataset){
        case 'dataset2':
            return x[parseInt(index)][type] - x[parseInt(index)-1][type]
        case 'dataset3':
            return x[parseInt(index)] - x[parseInt(index)-1]
        default:
            console.log("Default in computeDerivative activated")
    }
    
}

function plotGraph(){
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

        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[5].map(x => Math.log(x)),
            line: {color: secondarycolor}
        }

        var layout1 = {
            title: 'Daily New Cases',
            yaxis: {title: 'Number of cases'},
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
            yaxis: {title: 'Number of cases'},
            yaxis2: {
                title: 'Number of cases (log scale)',
                overlaying: 'y',
                side: 'right'
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

        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[6].map(x => Math.log(x)),
            line: {color: secondarycolor}
        }

        var layout1 = {
            title: 'Daily New Deaths',
            yaxis: {title: 'Number of deaths'},
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
            yaxis: {title: 'Number of deaths'},
            yaxis2: {
                title: 'Number of deaths (log scale)',
                overlaying: 'y',
                side: 'right'
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
    var cumulativeData = [trace3, trace4];
    var config = { responsive: true }

    if (document.querySelector("#report > .d-flex"))
    {
        let elt = document.querySelector("#report > .d-flex");
        document.getElementById('report').removeChild(elt);
    }

    //console.log(reportData, cumulativeData);
    Plotly.newPlot(reportGraph, reportData, layout1, config);
    Plotly.newPlot(cumulativeGraph, cumulativeData, layout2, config);
};


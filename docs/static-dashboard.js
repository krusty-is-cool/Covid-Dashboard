//STATIC VERSION OF THE DASHBOARD. NO HTTP REQUESTS TO THE SERVER

//GLOBAL CONSTANTS AND VARIABLES
//Fetch Data
const proxyurl = "https://krustyproxy.azurewebsites.net/";
const today = new Date();
const dateOfEnd = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const url1 = "opendata.ecdc.europa.eu/covid19/casedistribution/json"; // site that doesn’t send Access-Control-*
const url2 = "https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/2020-01-02/";
const url3 = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const url4 = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
let responseData1;
let responseData2;
let responseData3;
let responseData4;

//DOM
const elt = document.getElementById("countryList");

const dataset1 = $('#dataset1');
const dataset2 = $('#dataset2');
const dataset3 = $('#dataset3');
let choiceDataset = dataset1.attr('id');

const casesButton = $('#cases-button');
const deathsButton = $('#deaths-button');
let choiceButton = casesButton.attr('id');

const country = document.getElementById('country');
let selectedCountry = country.value;

const reportGraph = document.getElementById('report');
const cumulativegraph = document.getElementById('cumulative');

const autoInput = new InputEvent('input');

//HTTP REQUESTS, FUNCTION CALLING AND EVENTS

$.ajax({
    async: true,
    url: proxyurl + url1,
    dataType: "json",
    success: function(result){
        responseData1 = result;
        getCountries();
        plotGraph();
    }
});

$.ajax({
    async: true,
    url: url2 + dateOfEnd,
    dataType: "json",
    success: function(result){
        responseData2 = result;
        removeLoading("dataset2", "Oxford University BSG");
    }
});

Plotly.d3.csv(url3, function(data){ 
    responseData3 = data;
    Plotly.d3.csv(url4, function(data){
        if (document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, ''))) {
            document.getElementById('settings').removeChild(document.getElementById("requestAlert" + "Johns Hopkins University CSSE".replace(/\s+/g, '')));
        }
        if (error) {
            alertRequestFail("Johns Hopkins University CSSE");
        }
        responseData4 = data;
        removeLoading("dataset3", "Johns Hopkins University CSSE")
    });
} );

//Events
country.addEventListener('input', function(){
    selectedCountry = country.value;
    if ((selectedCountry == "United_Kingdom") || (selectedCountry == "GBR")){
        let alert = document.createElement("div")
        document.getElementById('settings').appendChild(alert)
        alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
        alert.setAttribute("role", "alert");
        alert.setAttribute("data-dismiss", "alert");
        alert.setAttribute("id", "alertUK")
        alert.innerHTML = "<strong>Note: </strong> On 3 July the UK announced an ongoing revision of historical data that lead to a negative number of new cases and an overall decrease in cases for the UK. <small><i>Click to close warning</i></small>"
        $('.alert').alert();
    } else if (document.getElementById("alertUK")) {
        document.getElementById('settings').removeChild(document.getElementById("alertUK"))
    }
    plotGraph();
});

dataset1.on('click', function(){
    choiceDataset = dataset1.attr('id');
    if (document.getElementById('France').getAttribute("value") != "France"){
        document.getElementById('France').setAttribute("value", "France");
        document.getElementById('France').innerHTML = "France";
    }
    getCountries();
    country.dispatchEvent(autoInput);
});

dataset2.on('click', function(){
    choiceDataset = dataset2.attr('id');
    document.getElementById('France').setAttribute("value", "FRA");
    document.getElementById('France').innerHTML = "FRA";
    getCountries();
    country.dispatchEvent(autoInput);
});

dataset3.on('click', function(){
    choiceDataset = dataset3.attr('id');
    if (document.getElementById('France').getAttribute("value") != "France"){
        document.getElementById('France').setAttribute("value", "France");
        document.getElementById('France').innerHTML = "France";
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

//FUNCTIONS DEFINITIONS

function getCountries(){
    let countries = [];
    var distinctCountries;
    switch (choiceDataset){
        case 'dataset1':
            for (let i in responseData1["records"]){
                countries.push(responseData1["records"][i]["countriesAndTerritories"]);
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
        newElt.innerHTML = distinctCountries[i];
        elt.appendChild(newElt);
    };
};

function removeLoading(parentID, text){
    let newElt = document.createElement('input');
    document.getElementById(parentID).removeAttribute("disabled");
    document.getElementById(parentID).textContent = text;
    newElt.setAttribute("type", "radio");
    newElt.setAttribute("name", "datasets");
    document.getElementById(parentID).appendChild(newElt);
}

function extractCountryData(){
    let covidData = [];
    switch (choiceDataset){
        case 'dataset1':
            for (let i in responseData1["records"]){
                if (responseData1["records"][i]["countriesAndTerritories"] == selectedCountry){
                    covidData.push(responseData1["records"][i]);
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
        
            var i = 0;
            yCases.slice().reverse().forEach((c) => {
                yCasesCumulative.push(i + c);
                i += c;
            });

            yCasesCumulative = yCasesCumulative.reverse();
        
            i = 0;
            yDeaths.slice().reverse().forEach((d) => {
                yDeathsCumulative.push(i + d);
                i += d
            });

            yDeathsCumulative = yDeathsCumulative.reverse();

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
            .reduce((acc, val) => acc + val)
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
    
    if (choiceButton == casesButton.attr('id')) {
        var trace1 = {
            type: "bar",
            name: "raw data",
            x: mydata[0],
            y: mydata[1]
        };

        var trace2 = {
            type: 'scatter',
            mode: 'lines',
            name: "7 days moving average",
            x: mydata[0],
            y: mydata[2]
        };

        var trace3 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative',
            x: mydata[0],
            y: mydata[5]
        }

        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[5].map(x => Math.log(x))
        }

        var layout1 = {
            title: 'Daily New Cases',
            yaxis: {title: 'Number of cases'},
            legend: {
                "orientation": "h",
                x: 0.5,
                xanchor: "center"
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
                xanchor: "center"
            }
        };

    } else if (choiceButton == deathsButton.attr('id')) {
        var trace1 = {
            type: "bar",
            name: "raw data",
            x: mydata[0],
            y: mydata[3]
        };

        var trace2 = {
            type: 'scatter',
            mode: 'lines',
            name: "7 days moving average",
            x: mydata[0],
            y: mydata[4]
        };

        var trace3 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative',
            x: mydata[0],
            y: mydata[6]
        }

        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[6].map(x => Math.log(x))
        }

        var layout1 = {
            title: 'Daily New Deaths',
            yaxis: {title: 'Number of deaths'},
            legend: {
                "orientation": "h",
                x: 0.5,
                xanchor: "center"
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
                xanchor: "center"
            }
        };

    } else {
        alert("Sorry, we are not able to plot any graph.");
    }

    var reportData = [trace1, trace2];
    var cumulativeData = [trace3, trace4];
    var config = { responsive: true }

    console.log(reportData, cumulativeData);
    Plotly.newPlot(reportGraph, reportData, layout1, config);
    Plotly.newPlot(cumulativegraph, cumulativeData, layout2, config);
};


//STATIC VERSION OF THE DASHBOARD. NO HTTP REQUESTS TO THE SERVER

//FORM AND TEXT
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const url = "https://opendata.ecdc.europa.eu/covid19/casedistribution/json"; // site that doesn’t send Access-Control-*
let responseData;

$.ajax({
    async: false,
    url: proxyurl + url,
    dataType: "json",
    success: getCountries
});

function getCountries(result){
    responseData = result;
    let countries = [];
    for (let i in responseData["records"]){
        countries.push(responseData["records"][i]["countriesAndTerritories"]);
    };
    const distinctCountries = [...new Set(countries)];

    let elt = document.getElementById("countryList");
    for (let i in distinctCountries){
        let newElt = document.createElement('option');
        newElt.setAttribute("value", distinctCountries[i]);
        newElt.innerHTML = distinctCountries[i];
        elt.appendChild(newElt);
    };
};

//GRAPHS

const casesButton = $('#cases-button');
const deathsButton = $('#deaths-button');
let choiceButton = casesButton.attr('id');

const country = document.getElementById('country');
let selectedCountry = country.value;

const graph = document.getElementById('graph');

plotGraph();

country.addEventListener('input', function(){
    selectedCountry = country.value;
    plotGraph();
});

casesButton.on('click', function(){
    choiceButton = casesButton.attr('id');
    plotGraph();

});

deathsButton.on('click', function(){
    choiceButton = deathsButton.attr('id');
    plotGraph();
});

function extractCoutryData(){
    let covidData = [];
    for (let i in responseData["records"]){
        if (responseData["records"][i]["countriesAndTerritories"] == selectedCountry){
            covidData.push(responseData["records"][i]);
        };
    };
    return covidData;
};

function dataToArray(data){
    let x = [];
    let yCases = [];
    let yCasesAvrg = [];
    let yDeaths = [];
    let yDeathsAvrg = [];

    for(let i in data){
        x.push(String(data[i]["year"])+"-"+String(data[i]["month"])+"-"+String(data[i]["day"]));

        yCases.push(data[i]["cases"]);

        if (i < data.length - 6){
            yCasesAvrg.push((data[parseInt(i)+6]["cases"]+data[parseInt(i)+5]["cases"]+data[parseInt(i)+4]["cases"]+data[parseInt(i)+3]["cases"]+data[parseInt(i)+2]["cases"]+data[parseInt(i)+1]["cases"]+data[i]["cases"])/7);
        } else {
            yCasesAvrg.push(NaN);
        }     
        yDeaths.push(data[i]["deaths"]);

        if (i < data.length - 6){
            yDeathsAvrg.push((data[parseInt(i)+6]["deaths"]+data[parseInt(i)+5]["deaths"]+data[parseInt(i)+4]["deaths"]+data[parseInt(i)+3]["deaths"]+data[parseInt(i)+2]["deaths"]+data[parseInt(i)+1]["deaths"]+data[i]["deaths"])/7);
        } else {
            yDeathsAvrg.push(NaN);
        }   
    };
    return [x, yCases, yCasesAvrg, yDeaths, yDeathsAvrg];
};

function plotGraph(){
    let covidData = extractCoutryData();
    let mydata = dataToArray(covidData);
    console.log(mydata);
    
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

        var layout = {
            title: 'Daily New Cases'
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

        var layout = {
            title: 'Daily New Deaths'
        };

    } else {
        alert("Sorry, we are not able to plot any graph.");
    }

    var data = [trace1, trace2];
    var config = { responsive: true }

    console.log(data);
    Plotly.newPlot(graph, data, layout, config);
};


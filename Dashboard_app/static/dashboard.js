//FORM AND TEXT
$.ajax({
    url: "api/countries",
    success: getCountries
});

function getCountries(result){
    countries = result;
    let elt = document.getElementById("countryList");
    for (let i in countries){
        let newElt = document.createElement('option');
        newElt.setAttribute("value", countries[i]);
        newElt.innerHTML = countries[i];
        elt.appendChild(newElt);
    };
};

//GRAPHS
let covidData;

const casesButton = $('#cases-button');
const deathsButton = $('#deaths-button');
let choiceButton = casesButton.attr('id');

const country = document.getElementById('country');
let selectedCountry = country.value;

$.ajax({
    url: "api/covid",
    dataType: "json",
    data: { country: selectedCountry },
    success: plotGraph
});

country.addEventListener('input', function(){
    selectedCountry = country.value;
    $.ajax({
        url: "api/covid",
        dataType: "json",
        data: { country: selectedCountry },
        success: plotGraph
        });
});

casesButton.on('click', function(){
    choiceButton = casesButton.attr('id');
    plotGraph(covidData);

});

deathsButton.on('click', function(){
    choiceButton = deathsButton.attr('id');
    plotGraph(covidData);
})

function jsonDataToArray(covidData){
    let x = [];
    let yCases = [];
    let yCasesAvrg = [];
    let yDeaths = [];
    let yDeathsAvrg = [];
    for(let i in covidData["data"]){
        x.push(String(covidData["data"][i][3])+"-"+String(covidData["data"][i][2])+"-"+String(covidData["data"][i][1]));
        yCases.push(covidData["data"][i][4]);
        yCasesAvrg.push(covidData["data"][i][11]);
        yDeaths.push(covidData["data"][i][5]);
        yDeathsAvrg.push(covidData["data"][i][12]);
    };
    return [x, yCases, yCasesAvrg, yDeaths, yDeathsAvrg];
};

function plotGraph(result){
    covidData = result;
    const graph = document.getElementById('graph');
    let mydata = jsonDataToArray(covidData);
    
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

    console.log(data);
    Plotly.newPlot(graph, data, layout);
};


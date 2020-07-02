/*
Requête api/countries pour obtenir la liste des pays disponibles
modification du champ select id #countryList

puis, requête api/covid avec le pays en paramètre
afficher le graphique plotly
*/

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

$('h1').on('mouseover', function(){
    let $this = $(this);
    $this.css('color', 'pink');
});

$('h1').on('mouseleave', function(){
    let $this = $(this);
    $this.css('color', 'black');
});


$('select#country').on('click', 'option', function(){
    let $this = $(this);
    let selectedCountry = $this.attr('value');

    $.ajax({
    url: "api/covid",
    dataType: "json",
    data: { country: selectedCountry },
    success: plotGraph
    });

});

function jsonDataToArray(covidData){
    let x = [];
    let y = [];
    let y2 = [];
    for(let i in covidData["data"]){
        x.push(String(covidData["data"][i][3])+"-"+String(covidData["data"][i][2])+"-"+String(covidData["data"][i][1]));
        y.push(covidData["data"][i][4]);
        y2.push(covidData["data"][i][11])
    };
    console.log([x,y,y2]);
    return [x,y,y2];
};

function plotGraph(result){
    let covidData = result;
    const graph = document.getElementById('graph');
    let mydata = jsonDataToArray(covidData);
    
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

    var data = [trace1, trace2];

    var layout = {
        title: 'Daily New Cases'
    };
    console.log(data);
    Plotly.newPlot(graph, data, layout);
};


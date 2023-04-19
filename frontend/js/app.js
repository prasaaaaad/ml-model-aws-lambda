// Endpoint URL for Named Entity Recognition
const nerEndpoint = 'https://jpqe5un613.execute-api.us-west-1.amazonaws.com/dev/ner';

// Endpoint URL for PoS tagging and dependency parsing
const parseEndpoint = ''; 


const displacyEnt = new displaCyENT('', {
    container: '#displacy-ent',
    defaultText: '',
    defaultEnts: ['person', 'org', 'date', 'gpe', 'loc']
});

const displacy = new displaCy(parseEndpoint, {
    container: '#displacy-parse',
    format: 'spacy',
    distance: 200,
    offsetX: 100,
    wordSpacing: 25,
    collapsePunct: false,
    collapsePhrase: false,
    bg: '#e8f4fc',
    onStart: function () {
        $('#parse-container').hide();
        $('#displacyParseLoader').show();
    },
    onSuccess: function () {
        $('#displacyParseLoader').hide();
        $('#parse-container').show();
    },
    onError: function (error) {
        console.log('Error:', error);
        $('#displacyParseLoader').hide();
        $('#parse-container').show();
        alert('Error while getting POS and parse tree. Please try again later.');
    }
});

$('#displacyEntLoader').hide();
$('#displacyParseLoader').hide();
$('#housingLoader').hide();
$('#chartLoader').hide();
$(document).foundation();

const allEntities = ['person', 'org', 'gpe', 'norp', 'fac', 'loc', 'product',
    'event', 'work_of_art', 'law', 'language', 'date', 'time',
    'percent', 'money', 'quantity', 'ordinal', 'cardinal'
];

var lastAnalyzedText = "";
var lastNERSpans = [];
var ents = [];

function getNamedEntities() {
    $('#displacyEntLoader').show();
    $('#displacy-ent').hide();

    ents = [];
    $.each(allEntities, function (index, value) {
        var id = '#' + value;
        if ($(id).is(':checked')) {
            ents.push(value);
        }
    });

    var inputText = $('#inputText').val();

    $.ajax({
        type: "POST",
        url: nerEndpoint,
        data: inputText,
        contentType: "text/plain",
        dataType: "json",

        success: function (data, textStatus, jqXHR) {
            var text = inputText;
            var spans = data.spans;
            displacyEnt.render(text, spans, ents);
            lastAnalyzedText = text;
            lastNERSpans = spans;
            lastEnts = ents;
        },
        error: function () {
            $('#displacyEntLoader').hide();
            alert('Error while getting NER tags. Please try again.');
        },
        complete: function () {
            $('#displacyEntLoader').hide();
            $('#displacy-ent').show();
        }
    });
    return false;
};

function getPOSAndParse() {
    var inputText = $('#inputText').val();
    displacy.parse(inputText);
};

function visualizeNLPModelOutputs() {
    getNamedEntities();
    getPOSAndParse();
};

function findIndex(array, element) {
    for (let i=0; i<array.length; i++) {
        if (array[i] == element) {
            return i;
        }
    }
    return -1;
}

$('#btnAnalyzeText').click(visualizeNLPModelOutputs);

$.each(allEntities, function (index, value) {
    var id = '#' + value;
    $(id).click(function () {
        ents = [];
        $.each(allEntities, function (index2, value2) {
            //console.log(index, '#'+value);
            var id2 = '#' + value2;
            if ($(id2).is(':checked')) {
                ents.push(value2);
            }
        });
        displacyEnt.render(lastAnalyzedText, lastNERSpans, ents);
    });
});

$('#select-all').click(function () {
    if ($(this).is(':checked')) {
        $.each(allEntities, function (index, value) {
            var id = '#' + value;
            $(id).prop('checked', true);
        });
        ents = allEntities;
        displacyEnt.render(lastAnalyzedText, lastNERSpans, ents);
    }
    else {
        $.each(allEntities, function (index, value) {
            var id = '#' + value;
            $(id).prop('checked', false);
        });
        ents = [];
        displacyEnt.render(lastAnalyzedText, lastNERSpans, ents);
    }
});

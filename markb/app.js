
/*
 * Models
 */

function Subjects(apiKey) {
    baseUrl = 'http://api.dp.la/v2/items?fields=sourceResource.subject'
    this.apiKey = apiKey;
    this.url = baseUrl + '&api_key=' + apiKey;
}

Subjects.prototype.get = function(opts) {
    successCb = (opts['successCb'] || function() {});
    failCb = (opts['failCb'] || null)
    $.ajax({
        'url': this.url,
        'dataType': 'jsonp'
    }).done(
        function(data) {
            successCb(data);
        }
    ).fail(
        function(xhr, textStatus, errorThrown) {
            alert(errorThrown)
        }
    );
};


/*
 * Views
 */

function SubjectListView(apiKey) {
    this.subjects = new Subjects(apiKey);
}

SubjectListView.prototype.load = function() {
    this.subjects.get({'successCb': this.drawList});
};

SubjectListView.prototype.drawList = function(data) {
    if (data['docs'].length) {
        $list = $('<ul>');
        _.each(data['docs'], function(doc) {
            _.each(doc['sourceResource.subject'], function(subj) {
                $li = $('<li>');
                $li.text(subj['name']);
                $list.append($li);
            });
        });
        $('#main').append($list);
    } else {
        this.noData();
    }
};

SubjectListView.prototype.noData =  function() {
    $p = $('<p>');
    $p.innerHTML = 'No data';
    $('#main').prepend($p);
};

SubjectListView.prototype.drawPreformatted = function(data) {
    $('#main').html('<pre>' + JSON.stringify(data) + '</pre>');
};


/* Pulled from JavaScript: The Definitive Guide */
function getArgs() {
    var args = {};
    var query = location.search.substring(1);
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('=');
        if (pos == -1) continue;
        var argname = pairs[i].substring(0, pos);
        var value = pairs[i].substring(pos + 1);
        value = decodeURIComponent(value);
        args[argname] = value;
    }
    return args;
}


function main() {
    apiKey = (getArgs()['api_key'] || null);
    if (apiKey) {
        slView = new SubjectListView(apiKey)
        slView.load();
    } else {
        alert('Please fill in your API key with the query parameter api_key.');
    }
}

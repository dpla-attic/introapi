
/*
 * Models
 */

function Subjects(apiKey) {
    // We're cheating and selecting subjects where subject matches "cat" in
    // order to avoid records with empty subjects.
    baseUrl = 'http://api.dp.la/v2/items?fields=sourceResource.subject' +
              '&sourceResource.subject=cat'
    this.apiKey = apiKey;
    this.url = baseUrl + '&api_key=' + apiKey;
}

Subjects.prototype.get = function(opts) {
    successCb = (opts['successCb'] || function() {});
    failCb = (opts['failCb'] || null);
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

function SubjectListView($parent, apiKey) {
    _.bindAll(this, 'load', 'drawList', 'noData', 'drawPreformatted');
    this.$parent = $parent;
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
        this.$parent.append($list);
    } else {
        this.noData();
    }
};

SubjectListView.prototype.noData =  function() {
    $p = $('<p>');
    $p.text('No data');
    this.$parent.prepend($p);
};

SubjectListView.prototype.drawPreformatted = function(data) {
    this.$parent.html('<pre>' + JSON.stringify(data) + '</pre>');
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
        slView = new SubjectListView($('#main'), apiKey)
        slView.load();
    } else {
        alert('Please fill in your API key with the query parameter api_key.');
    }
}

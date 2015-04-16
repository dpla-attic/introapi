
/********
 * Models
 ********/


/******************************************
 * Subjects -- a collection of subject data
 */
function Subjects(apiKey) {
    baseUrl = 'http://api.dp.la/v2/items?callback=?'
    this.apiKey = apiKey;
    this.url = baseUrl + '&api_key=' + apiKey;
}

/* get
 * ---
 * Given a callback, execute it by passing an Array of subject strings
 */
Subjects.prototype.get = function(opts) {

    var successCb = (opts['successCb'] || function() {});
    var failCb = (opts['failCb'] || null);
    var that = this;

    $.jsonp({
        'url': this.url,
        'data': {
            'fields': 'sourceResource.subject',
            // We're cheating and selecting subjects where subject matches "cat"
            // in order to avoid records with empty subjects.
            'sourceResource.subject': 'cat'
        },
        'cache': true,
        'success': function(data) {
            docs = (data.docs || []);  // probably assigned, but be paranoid
            successCb(that.subjectsFromDocs(docs));
        },
        'error': function() {
            // If we could avoid using JSONP, and use $.ajax() instead, we would
            // have available much more information in the error response for
            // providing better feedback and diagnostics.  We have to use JSONP,
            // however, for a browser-based application that uses the DPLA API
            // but is not served from the api.dp.la domain.
            alert('Failed to retrieve subjects.');
        }
    });
};

/*
 * subjectsFromDocs
 * ----------------
 * Given a DPLA API 'docs' object, return an array of all of the subject strings
 */
Subjects.prototype.subjectsFromDocs = function(docs) {
    subjects = [];
    _.each(docs, function(doc) {
        _.each(doc['sourceResource.subject'], function(s) {
            subjects.push(s.name);
        });
    });
    return subjects;
};


/*******
 * Views
 *******/


/***************************************
 * SubjectListView -- a list of subjects
 *
 * params:
 * - $parent:  DOM element
 * - apiKey:   API key string
 */
function SubjectListView($parent, apiKey) {
    _.bindAll(this, 'render', 'drawList', 'noData', 'drawPreformatted');
    this.$parent = $parent;
    this.subjects = new Subjects(apiKey);
}

/* render
 * ------
 * Render the view
 */
SubjectListView.prototype.render = function() {
    this.subjects.get({'successCb': this.drawList});
};

/* drawList
 * --------
 * Draw an unordered list of subject strings
 */
SubjectListView.prototype.drawList = function(subjectNames) {
    if (subjectNames.length) {
        $list = $('<ul>');
        _.each(subjectNames, function(name) {
            $li = $('<li>');
            $li.text(name);
            $list.append($li);
        });
        this.$parent.append($list);
    } else {
        this.noData();
    }
};

/* noData
 * ------
 * Draw a response for no data
 */
SubjectListView.prototype.noData =  function() {
    $p = $('<p>');
    $p.text('No data');
    this.$parent.prepend($p);
};

/* drawPreformatted
 * ----------------
 * For debugging:  draw a JSON string for the given data
 */
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
        slView.render();
    } else {
        alert('Please fill in your API key with the query parameter api_key.');
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//The Gallery code enables easier call outs to alteryx directly from configured JS in the extension
Gallery = function(apiLocation, apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiLocation = apiLocation;

    this.getSubscriptionWorkflows = function (success, error){
        var type = "GET",
            url = this.apiLocation + "/workflows/subscription/",
            params = buildOauthParams(this.apiKey),
        	//add any user parameters before generating the signature
            signature = generateSignature(type, url, params, this.apiSecret);
        $.extend(params, {oauth_signature: signature});
        $.ajax({
            type: type,
            url: url,
            data: params,
            success: success,
            error: error
        });
    };

    this.getAppQuestions = function (id, success, error){
        var type = "GET",
            url = this.apiLocation + "/workflows/" + id + "/questions/",
            params = buildOauthParams(this.apiKey),
            signature = generateSignature(type, url, params, this.apiSecret);
        $.extend(params, {oauth_signature: signature});
        $.ajax({
            type: type,
            url: url,
            data: params,
            success: success,
            error: error
        });
    };

    this.executeWorkflow = function(id, questions, success, error){
        var type = "POST",
            url = this.apiLocation + "/workflows/" + id + "/jobs/",
            params = buildOauthParams(this.apiKey);
        var signature = generateSignature(type, url, params, this.apiSecret);
        $.extend(params, {oauth_signature: signature});
        $.ajax({
            type: type,
            url: url + "?" + $.param(params),
            data: JSON.stringify({questions: questions}),
            success: success,
            error: error,
            contentType: "application/json"
        });
    };

    this.getJobsByWorkflow = function(id, success, error){
        var type = "GET",
            url = this.apiLocation + "/workflows/" + id + "/jobs/",
            params = buildOauthParams(this.apiKey),
            signature = generateSignature(type, url, params, this.apiSecret);
        $.extend(params, {oauth_signature: signature});
        $.ajax({
            type: type,
            url: url,
            data: params,
            success: success,
            error: error
        });
    };

    this.getJob = function(id, success, error) {
        var type = "GET",
            url = this.apiLocation + "/jobs/" + id + "/",
            params = buildOauthParams(this.apiKey),
            signature = generateSignature(type, url, params, this.apiSecret);
        $.extend(params, {oauth_signature: signature});
        $.ajax({
            type: type,
            url: url,
            data: params,
            success: success,
            error: error,
			async: false  //explicitly wait
        });
    };

    this.getOutputFileURL = function(jobId, outputId, format) {
        var type = "GET",
            url = this.apiLocation + "/jobs/" + jobId + "/output/" + outputId + "/",
            params = buildOauthParams(this.apiKey);
        $.extend(params, {format: format || "Raw"});
        var signature = generateSignature(type, url, params, this.apiSecret);
        $.extend(params, {oauth_signature: signature});
        return url + "?" + $.param(params);
    };

    var buildOauthParams = function(apiKey){
        return {
            oauth_consumer_key: apiKey,
            oauth_signature_method: "HMAC-SHA1",
            oauth_nonce: Math.floor(Math.random() * 1e9).toString(),
            oauth_timestamp: Math.floor(new Date().getTime()/1000).toString(),
            oauth_version: "1.0"
        };
    };

    var generateSignature = function(httpMethod, url, parameters, secret) {
        return oauthSignature.generate(httpMethod, url, parameters, secret, null, { encodeSignature: false});
    };
};

function toCsvValue(theValue, sDelimiter) {
	var t = typeof (theValue), output;
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}

	if (t === "undefined" || t === null) {
		output = "";
	} else if (t === "string") {
		output = sDelimiter + theValue + sDelimiter;
	} else {
		output = String(theValue);
	}
	return output;
}
function toCsv(objArray, sDelimiter, cDelimiter) {
	var i, l, names = [], name, value, obj, row, output = "", n, nl;
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
	if (typeof (cDelimiter) === "undefined" || cDelimiter === null) {
		cDelimiter = ",";
	}

	for (i = 0, l = objArray.length; i < l; i += 1) {
		// Get the names of the properties.
		obj = objArray[i];
		row = "";
		if (i === 0) {
			// Loop through the names
			for (name in obj) {
				if (obj.hasOwnProperty(name)) {
					names.push(name);
					row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
				}
			}
			row = row.substring(0, row.length - 1);
			output += row;
		}
		output += "\n";
		row = "";
		for (n = 0, nl = names.length; n < nl; n += 1) {
			name = names[n];
			value = obj[name];
			if (n > 0) {
				row += ","
			}
			row += toCsvValue(value, '"');
		}
		output += row;
	}
	return output;
}
gallery = Gallery;

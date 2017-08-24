define([
  "qlik",
  "jquery",
  "./properties",
  "util",
  "qvangular",
  "core.utils/deferred",
  "client.utils/state",
  "client.models/rpc-session",
  "./scripts",
  "./oauth",
  "css!./style.css"
],
    function(qlik, $, properties, util, qvangular, Deferred, State, RPCSession) {
        'use strict';
        return {
            definition: properties,
            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInterColumnSortOrder : [],
                    qInitialDataFetch: [{
                        qWidth: 2,
                        qHeight: 100
                    }]
                }
            },
            snapshot: {
                canTakeSnapshot: true
            },
            paint: function($element, layout) {
                var showModal = function(modalTitle, message) {
                    var dialog = qvangular.getService("$delayedModal"),
                        modalOptions = util.extend(!0, {}, {}, {
                            title: modalTitle,
                            html: message
                        });
                    dialog.open(modalOptions);
                };
                console.log(layout);
                //add your rendering code here
                $element.empty();
                var pre = '';
                var post = '';
                if (typeof layout.preHtml !== "undefined") {
                    pre = '<div>' + layout.preHtml + '</div>';
                }
                if (typeof layout.postHtml !== "undefined") {
                    post = '<div style="clear: both;">' + layout.postHtml + '</div>';
                }
                var html = "";

                var hc = layout.qHyperCube;
                console.log(hc);
                var numRows = hc.qDataPages[0].qMatrix.length;
                var numDimensions = hc.qDimensionInfo.length;
                if (!isNaN(parseFloat(layout.maxNumber)) && isFinite(layout.maxNumber)) {
                    var sendNumber = layout.maxNumber;
                } else {
                    var sendNumber = 1; //set to 1, if there is no property
                };

                console.log("Number of rows: " + numRows);
                console.log("Number of Dimensions: " + numDimensions, hc.qDimensionInfo);
                console.log("Send Number: " + sendNumber);
                console.log("Layout: ", layout);
                console.log("HC: ", hc);

                var appIDStr = "__";
                var repl = {};
                var generateApp = function() {
                    //post request with the selected data
                    //console.log( 'Data in hyper cube: ', passArray );
                    var copyURI = '/qrs/app/' + layout.sourceAppId + '/copy?name=' + encodeURIComponent(layout.destinationAppName + appIDStr) + '';
                    console.log("Generated copyURI: " + copyURI);
                    qlik.callRepository(copyURI, 'POST').success(function(reply) {
                        console.log("Got reply from copy app:", reply);
                        var newAppId = reply.id;
                        //var newApp = qlik.openApp(newAppId);
                        var reloadURI = '/qrs/app/' + newAppId + '/reload';
                        var newAppSession = RPCSession.get(newAppId, {
                            host: window.location.host,
                            isSecure: window.location.protocol == "https:"
                        });
                        var newAppHandle;
                        var continueMonitoring = true;

                        var showCompleteModal = function() {
                            console.log('Closing out new session.');
                            newAppSession.close();
                            var newAnalysisURI = '/sense/app/' + newAppId + '/sheet/' + layout.destinationAppSheet;
                            if (layout.jumpToNew) {
                                window.location.href = newAnalysisURI;
                            } else {
                                showModal("Application Published", '<p class="dm-p">' + layout.destinationAppName + appIDStr + ' was published.<br /><a href="' + newAnalysisURI + '">Go to your analysis</a></p>');
                            }
                            $("#analyze_button").removeClass('analyze_processing');
                        };

                        var publish = function(callback) {
                            var publishURI = '/qrs/app/' + newAppId + '/publish?stream=' + layout.destinationStreamId + '&name=' + encodeURIComponent(layout.destinationAppName + appIDStr);
                            qlik.callRepository(publishURI, 'PUT').success(function(reply) {
                                console.log("Executed publish and got respose:", reply);
                                setTimeout(function() {
                                    /*
                                    console.log("Qlik: ",qlik);
                                    var nApp = qlik.openApp(newAppId);
                                    nApp.doReload( 0, false, false ).then( function () {
                                    	nApp.doSave();
                                    	console.log("Calling callback");
                                    	callback;
                                    } );
                                    */
                                    newAppSession.rpc({
                                        "handle": newAppHandle,
                                        "method": "DoReloadEx",
                                        "params": {},
                                        "id": 2,
                                        "jsonrpc": "2.0"
                                    }).then(function(result) {
                                        console.log("Executed reload via RPC, got result: ", result);
                                        if (true) {
                                            monitorProgress(true);
                                        }
                                        callback;
                                    });
                                }, layout.reloadDelay);
                            });
                        };

                        var monitorProgress = function(doTransient) {
                            newAppSession.rpc({
                                handle: -1,
                                method: "GetProgress",
                                params: [0]
                            }).then(function(reloadProgress) {
                                if (reloadProgress.result.qProgressData.qPersistentProgressMessages) {
                                    for (var i = 0; i < reloadProgress.result.qProgressData.qPersistentProgressMessages.length; i++) {
                                        switch (reloadProgress.result.qProgressData.qPersistentProgressMessages[i].qMessageCode) {
                                            case 10:
                                            case 7:
                                                console.log("error");
                                                console.log("Reload - " + reloadProgress.result.qProgressData.qPersistentProgressMessages[i].qMessageParameters[0]);
                                                continueMonitoring = false;
                                                return;
                                                break;
                                            default:
                                                if (reloadProgress.result.qProgressData.qPersistentProgressMessages[i].qMessageParameters.length > 0) {
                                                    console.log(reloadProgress.result.qProgressData.qPersistentProgressMessages[i].qMessageParameters[0]);
                                                }
                                                break;
                                        }
                                    }
                                }
                                if (doTransient) {
                                    if (reloadProgress.result.qProgressData.qTransientProgressMessage &&
                                        reloadProgress.result.qProgressData.qTransientProgressMessage.qMessageParameters) {
                                        for (var i = 0; i < reloadProgress.result.qProgressData.qTransientProgressMessage.qMessageParameters.length; i++) {
                                            console.log(reloadProgress);
                                        }
                                    }
                                    if (continueMonitoring) {
                                        setTimeout(function() {
                                            monitorProgress(true);
                                        }, 100);
                                    }
                                } else if (reloadProgress.result.qProgressData.qFinished == true) {
                                    continueMonitoring = false;
                                    //save app
                                    newAppSession.rpc({
                                        handle: newAppHandle,
                                        method: "DoSave",
                                        params: []
                                    }).then(function(response) {
                                        console.log('Saved app again.')
                                    });
                                }
                            });
                        };

                        newAppSession.open();
                        newAppSession.rpc({
                            handle: -1,
                            method: "OpenDoc",
                            params: [newAppId]
                        }).then(function(response) {
                            newAppHandle = response.result.qReturn.qHandle;
                            newAppSession.rpc({
                                handle: newAppHandle,
                                method: "GetScript",
                                params: []
                            }).then(function(scriptData) {
                                console.log("ScriptData: ", scriptData);
                                var script = scriptData.result.qScript;
                                for (var key in repl) {
                                    console.log('Replacing: ', key, repl[key]);
                                    if (repl[key].length > 1) {
                                        script = script.replaceAll(key, toCsv(repl[key], "'", ","));
                                    } else {
                                        script = script.replaceAll(key, repl[key]);
                                    }
                                }
                                newAppSession.rpc({
                                        handle: newAppHandle,
                                        method: "SetScript",
                                        params: [script]
                                    })
                                    .then(function(response) {
                                        monitorProgress(true);
                                        console.log("Evaluating Custome JS prior to reload..."); //+ layout.customJsPre
                                        if (typeof layout.customJsPre !== "undefined") {
                                            //console.log("Evaluating JS: " + layout.customJsPre);
                                            eval(layout.customJsPre);
                                        }
                                        newAppSession.rpc({
                                            handle: newAppHandle,
                                            method: "DoSave",
                                            params: []
                                        }).then(function(response) {
                                            monitorProgress(true);
                                            console.log("Set script, now reloading and publishing....");
                                            //reload & publish

                                            var delay = parseInt(layout.reloadDelay);
                                            console.log("Executing reload delay: " + delay);

                                            setTimeout(function() {
                                                newAppSession.rpc({
                                                    "handle": newAppHandle,
                                                    "method": "DoReloadEx",
                                                    "params": {},
                                                    "id": 2,
                                                    "jsonrpc": "2.0"
                                                }).then(function(result) {
                                                    console.log("Executed reload(1) via RPC, got result: ", result);
                                                    if (true) {
                                                        //if (layout.waitForReload) {
                                                        monitorProgress(true);
                                                    }
                                                    newAppSession.rpc({
                                                        handle: newAppHandle,
                                                        method: "DoSave",
                                                        params: []
                                                    }).then(function(response) {
                                                        monitorProgress(true);
                                                        publish(showCompleteModal());
                                                    });
                                                });
                                                /*
                                                        qlik.callRepository(reloadURI, 'POST').success(function (reply) {
                                                            console.log("Executed reload and got response:", reply);
                                                            //TODO: replace if exists
                                                            if (true) {
                                                                //if (layout.waitForReload) {
																monitorProgress(true);
                                                            }
                                                            newAppSession.rpc({
                                                                handle: newAppHandle,
                                                                method: "DoSave",
                                                                params: []
                                                            }).then(function (response) {
                                                                monitorProgress(true);
                                                                publish(showCompleteModal());
                                                            });
                                                        });
														*/
                                            }, delay);
                                        });
                                    }, function(error) {
                                        console.log(error);
                                        $("#analyze_button").removeClass('analyze_processing');
                                    });
                            });
                        });
                    });
                };

                if (numRows <= sendNumber) {
                    console.log("Building replacements...");
                    for (var i = 0; i < numDimensions; i++) {
                        for (var k = 0; k < numRows; k++) {
                            var value = 'N/A';
                            try {
                                if (hc.qDataPages[0].qMatrix[k][i].qText) {
                                    value = hc.qDataPages[0].qMatrix[k][i].qText;
                                }
                            } catch (ex) {} //ignore
                            if (repl[hc.qDimensionInfo[i].qFallbackTitle]) {
                                repl[hc.qDimensionInfo[i].qFallbackTitle].push(value);
                            } else {
                                repl[hc.qDimensionInfo[i].qFallbackTitle] = [value];
                            }
                            if (i == 0 && k == 0) {
                                window.hcFirstValue = value;
                                //appIDStr = " - " + hc.qDimensionInfo[0].qGroupFieldDefs[0] + ": " + value;
                                appIDStr = "__" + hc.qDimensionInfo[0].qGroupFieldDefs[0] + "-" + value;
                            }
                        }
                    }

                    console.log("Replacements: ", repl);
                    console.log("appIDStr: " + appIDStr);
                    console.log("Constructing button...");

                    html = pre + "<div><button width='auto' id='analyze_button' class='main_button' style='float: right;'>" + layout.buttonLabel + "</button></div>" + post;
                    $element.html(html);


                    if (!State.isInEditMode()) {
                        //Button function - add an onclick to target modal class
                        $element.find("#analyze_button").on("qv-activate", function() {
                            if ($("#analyze_button").hasClass('analyze_processing')) {
                                return;
                            }
                            $("#analyze_button").addClass('analyze_processing');
                            generateApp();
                        }); //end find button element
                    }
                } else {
                    html = pre + "<div class='analyze_warning_message'>" + layout.noDataLabel + "</div>" + post;
                    $element.html(html);
                }
            }
        };
    }
);

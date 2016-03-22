define(["qlik"], function(qlik) {
    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: {
                uses: "dimensions",
                translation: "Replacements",
				min : 1
            },
            visual: {
                label: "Visual Settings",
                uses: "settings",
                type: "items",
                items: {
                    buttonLabel: {
                        ref: "buttonLabel",
                        label: "Label for Button",
                        type: "string"
                    },
                    noData: {
                        ref: "noDataLabel",
                        label: "No Data Label",
                        type: "string"
                    }
                }
            },
            onDemand: {
                label: "OnDemand Settings",
                type: "items",
                items: {
                    maxNumber: {
                        ref: "maxNumber",
                        label: "Max number of items to send",
                        type: "number"
                    },
                    sourceAppId: {
                        ref: "sourceAppId",
                        label: "Source App ID",
                        type: "string"
                    },
                    destinationAppName: {
                        ref: "destinationAppName",
                        label: "Destination App Name",
                        type: "string"
                    },
                    destinationStreamId: {
                        ref: "destinationStreamId",
                        label: "Destination Stream ID",
                        type: "string"
                    },
                    destinationAppSheet: {
                        ref: "destinationAppSheet",
                        label: "Destination Sheet ID",
                        type: "string"
                    },
                    replaceApp: {
                        ref: "replaceApp",
                        type: "boolean",
                        component: "switch",
                        translation: "Replace the On Demand app if the same criteria has already been used",
                        defaultValue: !1,
                        options: [{
                            value: !0,
                            translation: "properties.on"
                        }, {
                            value: !1,
                            translation: "properties.off"
                        }]
                    }
                }
            },
            advanced: {
                label: "Advanced Capabilities",
                type: "items",
                items: {
                    waitForReload: {
                        ref: "waitForReload",
                        type: "boolean",
                        component: "switch",
                        translation: "Wait for reload prior to letting user go to analysis",
                        defaultValue: !1,
                        options: [{
                            value: !0,
                            translation: "properties.on"
                        }, {
                            value: !1,
                            translation: "properties.off"
                        }]
                    },
					delayPreReload: {
						ref: "reloadDelay",
						translation: "Delay prior to reload",
						type: "number",
						defaultValue: 3000
					},
                    jumpToNew: {
                        ref: "jumpToNew",
                        type: "boolean",
                        component: "switch",
                        translation: "Automatically jump to newly created analysis",
                        defaultValue: !1,
                        options: [{
                            value: !0,
                            translation: "properties.on"
                        }, {
                            value: !1,
                            translation: "properties.off"
                        }]
                    },
                    inMashup: {
                        ref: "inMashup",
                        type: "boolean",
                        component: "switch",
                        translation: "This extension will also be utilized in a mashup",
                        defaultValue: !1,
                        options: [{
                            value: !0,
                            translation: "properties.on"
                        }, {
                            value: !1,
                            translation: "properties.off"
                        }]
                    },
                    customJs: {
                        ref: "customJsPre",
                        label: "Custom Javascript to execute before reloading the app",
                        type: "string",
                        expression: "optional"
                    },
                    preHtml: {
                        ref: "preHtml",
                        label: "Custom HTML to show before the button",
                        type: "string",
                        expression: "optional"
                    },
                    postHtml: {
                        ref: "postHtml",
                        label: "Custom HTML to show after the button",
                        type: "string",
                        expression: "optional"
                    }
                }
            }
        }
    };
});
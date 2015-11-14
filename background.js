var actions = [];
var tabs = {};

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        window.open('http://etsytools.reatlat.net/', '_blank');
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        window.open('http://etsytools.reatlat.net/', '_blank');
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('etsy.com') >= 0) {
        chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }
});

chrome.webRequest.onBeforeSendHeaders.addListener(function(data) {
    actions.unshift({
        h: 1,
        tid: data.tabId
    });
    return true;
}, {
    urls: ["*://www.etsy.com/add_favorite_shop.php", "*://www.etsy.com/add_favorite_listing.php"]
}, []);

chrome.webRequest.onBeforeSendHeaders.addListener(function(data) {
    actions.unshift({
        h: -1,
        tid: data.tabId
    });
    return true;
}, {
    urls: ["*://www.etsy.com/remove_favorite_shop.php", "*://www.etsy.com/remove_favorite_listing.php"]
}, []);

chrome.webRequest.onCompleted.addListener(function(data) {
    var heart = 0;
    switch (data.method) {
        case 'POST':
            actions.unshift({
                h: 1,
                tid: data.tabId
            });
            break;
        case 'DELETE':
            actions.unshift({
                h: -1,
                tid: data.tabId
            });
            break;
    }
    return true;
}, {
    urls: ["*://www.etsy.com/api/v2/ajax/collections/*/listings/*"]
}, []);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.userid) {
        var userid = request.userid;
        tabs[sender.tab.id] = userid;
        getUserData(userid, function(userData) {
            var curHour = genHour();
            if (userData.hour != curHour) {
                reset(userid, function(resetedData) {
                    setUserData(userid, resetedData, function(newData) {
                        sendResponse(userData);
                    });
                });
            } else {
                sendResponse(userData);
            }
        });
    }
    return true;
});

function getUserData(userid, callback) {
    chrome.storage.local.get(userid, function(data) {
        if (typeof(data[userid]) == 'undefined') {
            reset(userid, function(data) {
                callback(data[userid]);
            });
            exit;
        };
        callback(data[userid]);
    });
}

function setUserData(userid, data, callback) {
    var d = {};
    d[userid] = data;
    chrome.storage.local.set(d, function() {
        if (typeof(callback) == 'function') {
            callback(data);
        }
    });
}

function reset(userid, callback) {
    data = {
        'hearted': 0,
        'unhearted': 0,
        'hour': genHour()
    };
    setUserData(userid, data, function(newData) {
        if (typeof(callback) == 'function') {
            callback(newData);
        }
    });
}

function genHour() {
    var d = new Date();
    return parseInt(d.getUTCFullYear() + ('0' + d.getUTCMonth().toString()).slice(-2) + ('0' + d.getUTCDate().toString()).slice(-2) + ('0' + d.getUTCHours().toString()).slice(-2));
}

(function timer() {
    if (actions.length > 0) {
        var pool = {};
        var action;
        while ((action = actions.pop()) != undefined) {
            if (typeof(pool[action.tid]) == 'undefined') {
                pool[action.tid] = {
                    hearted: 0,
                    unhearted: 0
                };
            }
            if (action.h > 0) {
                pool[action.tid].hearted += action.h;
            } else {
                pool[action.tid].unhearted += Math.abs(action.h);
            }
        }
        for (var tid in pool) {
            if (pool.hasOwnProperty(tid)) {
                var newData = pool[tid];
                if (typeof(tabs[tid]) == 'undefined') {
                    console.log('Undefined tab');
                } else {
                    var userid = tabs[tid];
                    getUserData(userid, function(oldData) {
                        var curHour = genHour();
                        var appendUserData = function(oldData, newData) {
                            oldData.hearted += newData.hearted;
                            oldData.unhearted += newData.unhearted;
                            setUserData(userid, oldData, function(updatedData) {
                                chrome.tabs.sendMessage(parseInt(tid), updatedData, function(data) {});
                            });
                        };
                        if (oldData.hour != curHour) {
                            reset(userid, function(resetedData) {
                                appendUserData(resetedData, newData);
                            });
                        } else {
                            appendUserData(oldData, newData);
                        }
                    });
                }
            }
        };
    }
    setTimeout(timer, 100);
})();

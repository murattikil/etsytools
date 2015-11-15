var css = document.createElement('LINK'), userid, bar, buttons, counter, reply, note, ad;
css.rel = 'stylesheet';
css.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css';
document.getElementsByTagName('HEAD')[0].appendChild(css);

bar = '<div id="et-bar" class="etsytools-bar"><div id="et-bar-container">';
bar += '<div id="et-counter"></div>';
bar += '<div id="et-status-bar"><ul id="et-status-list"></ul></div>';
bar += '<div id="et-menu"></div>';
bar += '</div></div>';

buttons = '<button id="fav-all" class="fa fa-heart" title="unFav/Fav all products"> unFav/Fav</button>';
buttons += '<button id="click-all" class="fa fa-external-link" title="Click all listings"> ClickAll</button>';

counter = '<span id="et-hearts-timer" title="Minutes left until next hour">0</span>';
counter += '<span id="hearts-container">';
counter += '<i class="hearts fa fa-heart hearted"> </i><span id="et-hearted" title="Hearted this hour">0</span>';
counter += '<i class="hearts fa fa-heart-o"> </i><span id="et-unhearted" title="Unhearted this hour">0</span>';
counter += '</span>';

reply = '<button id="et-here-btn">here</button>';
reply += '<button id="et-done-btn">done</button>';
reply += '<br><button id="et-outhearts-btn">out of hearts</button>';

note = '\n\n❤❤❤❤❤❤❤❤❤❤❤❤';
note += '\nI am using EtsyTools';
note += '\nIt\'s quick. It\'s easy to use. It\'s free!';
note += '\nhttp://etsytools.reatlat.net/';

ad = [
    'Simplicity is the ultimate sophistication. - Leonardo da Vinci',
    'Please share "<a href="http://etsytools.reatlat.net/" target="_blank">EtsyTools</a>"" for friends',
    'Do you like "<a href="http://etsytools.reatlat.net/" target="_blank">EtsyTools</a>"? Please leave <a href="https://chrome.google.com/webstore/detail/etsytools/cmmikdmpeopfconfkmdnoffbplecnjae/reviews" target="_blank">review</a> =)'
];

$('body').prepend(bar);
$('#et-counter').prepend(counter);
$('#et-menu').append(buttons);
$("div#right").children("div.panel.clear").children('a#reply-box-button').before(reply);
$('#et-status-list').prepend('<li>' + ad[Math.floor(Math.random() * ad.length)] + '</li>')

if ($('#pager-wrapper').length) {
    var page = $('#pager-wrapper .current-page').text() || $('#pager-wrapper .active a').text();
    var pages = $('#pager-wrapper .page_num:last').text() || $('#pager-wrapper li:last a').text();
    $('#et-status-list').prepend('<li>page ' + page + ' of ' + pages + '</li>')
}

$('#et-here-btn').click(function() {
    txt('here | page ' + page);
});
$('#et-done-btn').click(function() {
    txt('done | page ' + page);
});
$('#et-outhearts-btn').click(function() {
    txt('out of hearts | page ' + page);
});
$('#fav-all').click(function() {
    favStart();
});
$('#click-all').click(function() {
    clickAll();
});

function init() {
    var section = window.location.pathname.split('/')[1];
    if (section == 'your' || section == 'developers') {
        $('#et-bar').attr('style', 'display:none');
        $('body').attr('style', 'margin-top: 0px');
    };
    userid = $('html').data('user-id');
    if (!userid) return;
    userid = userid.toString();
    ask();
    timer();
}

function ask() {
    chrome.runtime.sendMessage({
        "userid": userid,
    }, function(data) {
        update_counters(data);
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    update_counters(request);
});

function update_counters(data) {
    localStorage.hearted = parseInt(data.hearted);
    $('#et-hearted').text(parseInt(data.hearted));
    $('#et-unhearted').text(parseInt(data.unhearted));
}

function timer() {
    var d = new Date();
    var time_left = 60 - d.getUTCMinutes();
    ask();
    $('#et-hearts-timer').text(time_left);
    setTimeout(timer, 1000);
}

function txt(t) {
    $('p#reply-paragraph').children('textarea').text(t + note);
    $('input#new-post-submit').simulateClick('click');
};

function favStart() {
    if (localStorage.hearted > 300) {
        sessionStorage.favathone = 0;
        $('#et-status-list').attr('style', 'background:#F49D92').prepend('<li>The limit of 300 hearts is reached. Please, wait until next hour and press the button again.</li>');
    } else {
        if ($(".thread").length) {
            favAll(".thread .favorited-button", ".thread .button-fave", ".favorited-button", 1);
        } else if ($("#listing-wrapper").length || $(".treasury-view").length) {
            favAll(".listings .listing-card .btn-fave.done", ".listings .listing-card .btn-fave", ".done", 0);
        }
    }
}

function favAll(a, b, c, d) {
    var one = setInterval(function() {
        $(a).each(function() {
            $(this).simulateClick('click');
        });
        if (0 == $(a).length) {
            clearInterval(one);
            var two = setInterval(function() {
                $(b).not(c).each(function() {
                    $(this).simulateClick('click');
                });
                if (!($(b).not(c).length)) {
                    clearInterval(two);
                    if ($("#pager-wrapper .next").length) {
                        sessionStorage.favathone = d;
                        $('a.next').simulateClick('click');
                    } else {
                        sessionStorage.favathone = 0;
                        $('#et-status-list').attr('style', 'background:#92F496').prepend('<li>Finished! Please, don\'t forget to check few pages, just in case if you were out of hearts.</li>');
                    }
                }
            }, 1000)
        }
    }, 1000)
}

function clickAll() {
    var protocol = window.location.protocol;
    var links = $('.forum-post .body a[href*="/listing/"]:visible, .forum-post .listing-title a[href*="/listing/"]:visible');
    for (var i = 0; i < links.length; i++) {
        var url = $(links[i]).attr('href').replace(/http[s]?:/, protocol);
        openLink(url, true);
    };
    var next = $('#pager-wrapper .next');
    if (next.length) {
        openLink(next.attr('href'), false);
    } else {
        $('#et-status-list').attr('style', 'background:#92F496').prepend('<li>Congratulations!!! We are done!</li>');
    }
}

function openLink(url, newTab) {
    if (typeof(newTab) == 'undefined') {
        newTab = false;
    }
    var a = document.createElement("a");
    a.href = url;
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, newTab, false, false, newTab, 0, null);
    a.dispatchEvent(evt);
}

jQuery.fn.simulateClick = function() {
    return this.each(function() {
        if ('createEvent' in document) {
            var doc = this.ownerDocument,
                evt = doc.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.dispatchEvent(evt);
        } else {
            this.click();
        }
    });
};

init();

if (sessionStorage.favathone == 1) {
    favStart();
}

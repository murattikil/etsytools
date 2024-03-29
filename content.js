var css = document.createElement('LINK'),
    userid, bar, buttons, counter, reply, ad, here, view, done, ooh;
css.rel = 'stylesheet';
css.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css';
document.getElementsByTagName('HEAD')[0].appendChild(css);

var sound = {
    'oops': chrome.extension.getURL('audio/oops.mp3'),
    'pling': chrome.extension.getURL('audio/pling.mp3')
}

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

reply = '<button id="et-here-btn" title="faved up to here">F2H</button>';
reply += '<button id="et-view-btn" title="viewed up to here">V2H</button>';
reply += '<br>';
reply += '<button id="et-ooh-btn" title="out of hearts on this page">OOH</button>';
reply += '<button id="et-done-btn" title="done up to here">DONE!</button>';

ad = [
    'Have fun ;)',
    'Have a nice sales',
    'Simplicity is the ultimate sophistication. - Leonardo da Vinci',
    '<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=donate%40reatlat%2enet&lc=GB&item_name=Thanks%20for%20EtsyTools&item_number=EtsyTools&no_note=0&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHostedGuest" target="_blank">EtsyTools is not done for money, but feel free to show us how much you like it :)</a>',
    'Tell sellers about <a href="http://etsytools.reatlat.net/" target="_blank">EtsyTools</a>',
    'Please share "<a href="http://etsytools.reatlat.net/" target="_blank">EtsyTools</a>" to friends',
    'Do you like "<a href="http://etsytools.reatlat.net/" target="_blank">EtsyTools</a>"? Please leave <a href="https://chrome.google.com/webstore/detail/etsytools/cmmikdmpeopfconfkmdnoffbplecnjae/reviews" target="_blank">review</a> =)'
];

here = [
    'here',
    'faved up to here',
    'F2H',
    'FTH'
];

view = [
    'here',
    'viewed to here',
    'V2H',
    'VTH'
];

done = [
    'done',
    'done up to here',
    'finished',
    'D2H',
    'DTH'
];

ooh = [
    'out of hearts on page ',
    'OOH on page '
];

$('body').prepend(bar);
$('#et-counter').prepend(counter);
$('#et-menu').append(buttons);
$("div#right").children("div.panel.clear").children('a#reply-box-button').before(reply);
$('#et-status-list').prepend('<li>' + ad[Math.floor(Math.random() * ad.length)] + '</li>')

if ($('#pager-wrapper .pager').length) {
    var page = $('#pager-wrapper .current-page').text() || $('#pager-wrapper .active a').text();
    var pages = $('#pager-wrapper .page_num:last').text() || $('#pager-wrapper li:last a').text();
    $('#et-status-list').prepend('<li>page ' + page + ' of ' + pages + '</li>')
}

$('#et-here-btn').click(function() {
    txt(here[Math.floor(Math.random() * here.length)]);
});
$('#et-view-btn').click(function() {
    txt(view[Math.floor(Math.random() * view.length)]);
});
$('#et-done-btn').click(function() {
    txt(done[Math.floor(Math.random() * done.length)]);
});
$('#et-ooh-btn').click(function() {
    txt(ooh[Math.floor(Math.random() * ooh.length)] + page);
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
    } else {
        $('body').attr('style', 'margin-top: 50px');
    }
    userid = $('html').data('user-id');
    if (!userid) return;
    userid = userid.toString();
    ask();
    timer();
    if (sessionStorage.favathone == 1) {
        favStart();
    }
}

function ask() {
    chrome.runtime.sendMessage({
        "userid": userid,
    }, function(data) {
        update_counter(data);
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    update_counters(request);
});

function update_counter(data) {
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
    $('p#reply-paragraph').children('textarea').text(t);
    $('input#new-post-submit').simulateClick('click');
};

function favStart() {
    if (localStorage.hearted > 300) {
        sessionStorage.favathone = 0;
        playSound(sound.oops);
        $('#et-status-list').attr('style', 'background:#F49D92').prepend('<li>The limit of 300 hearts is reached. Please, wait until next hour and press the button again.</li>');
    } else if ($(".thread").length) {
        favA();
    } else if ($("#listing-wrapper").length || $(".treasury-view").length) {
        favB();
    }
}

function favA() {
    var x = [];
    $('.thread .favorited-button:visible').each(function() {
        if (0 > $.inArray($(this).attr('rel'), x)) {
            x.push($(this).attr('rel'));
            this.click();
        }
    });
    var y = setInterval(function() {
        if (0 == $('.thread .favorited-button:visible').length) {
            clearInterval(y);
            var x = [];
            $('.thread .button-fave:visible').not('.favorited-button').each(function() {
                if (0 > $.inArray($(this).attr('rel'), x)) {
                    x.push($(this).attr('rel'));
                    this.click();
                }
            });
            var z = setInterval(function() {
                if (0 == $('.thread .button-fave:visible').not('.favorited-button').length) {
                    clearInterval(z);
                    if ($('#pager-wrapper .next').length) {
                        sessionStorage.favathone = 1;
                        $('a.next').simulateClick('click');
                    } else {
                        sessionStorage.favathone = 0;
                        playSound(sound.pling);
                        $('#et-status-list').attr('style', 'background:#92F496').prepend('<li>Finished! Please, don\'t forget to check few pages, just in case if you were out of hearts.</li>');
                    }
                }
            }, 100)
        }
    }, 100)
}

function favB() {
    var x = [];
    $('.listings .listing-card .btn-fave.done').each(function() {
        if (0 > $.inArray($(this).parent().data('listing-id'), x)) {
            x.push($(this).parent().data('listing-id'));
            this.click();
        }
    });
    var y = setInterval(function() {
        if (0 == $('.listings .listing-card .btn-fave.done').length) {
            clearInterval(y);
            var x = [];
            $('.listings .listing-card .btn-fave').not('.done').each(function() {
                if (0 > $.inArray($(this).parent().data('listing-id'), x)) {
                    x.push($(this).parent().data('listing-id'));
                    this.click();
                }
            });
            var z = setInterval(function() {
                if (0 == $('.listings .listing-card .btn-fave').not('.done').length) {
                    clearInterval(z);
                    if ($('#pager-wrapper .next').length) {
                        sessionStorage.favathone = 0;
                        $('a.next').simulateClick('click');
                    } else {
                        sessionStorage.favathone = 0;
                        playSound(sound.pling);
                        $('#et-status-list').attr('style', 'background:#92F496').prepend('<li>Finished! Please, don\'t forget to check few pages, just in case if you were out of hearts.</li>');
                    }
                }
            }, 100)
        }
    }, 100)
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
        playSound(sound.pling);
        $('#et-status-list').attr('style', 'background:#92F496').prepend('<li>Congratulations!!! We are done!</li>');
    }
}

function openLink(url, newTab) {
    if (typeof(newTab) == 'undefined') {
        newTab = false;
    }
    var a = document.createElement('a');
    a.href = url;
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, newTab, false, false, newTab, 0, null);
    a.dispatchEvent(evt);
}

function playSound(url) {
    $('body').prepend('<audio autoplay><source src="' + url + '" controls></source></audio>');
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

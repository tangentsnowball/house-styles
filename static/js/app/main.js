var app = window.app || {};

app.main = {

    init: function() {
        'use strict';
        var self = this;
        self.setupDropdownButtonCloseOnClick();
        self.setupDisableOtherDropdownsOnClick();
        self.setupTabs();
        self.setupAlertMessageClosing();
        self.setupPopups(self);
    },

    setupDropdownButtonCloseOnClick: function() {
        'use strict';
        $('html').on('click touchstart', function(){
            $('.btn-group').removeClass('open'); //button dropdowns
        });
    },

    setupFormButtonDisableOnSubmit: function() {
        //if we want any forms to not be submittable twice, add the 'js-disable-on-click' class to any buttons in the form
        'use strict';
        $('form').submit(function(){
            $(this).find('.js-disable-on-click').attr('disabled','disabled');
        });
    },

    setupDisableOtherDropdownsOnClick: function() {
        //button dropdowns
        //note that this should be removed for oscar projects as it will be in the js already
        'use strict';
        $('.dropdown-toggle').click(function(e){
            e.stopPropagation();
            e.preventDefault();
            $('.btn-group').removeClass('open');
            $(this).closest('.btn-group').toggleClass('open');
        });
    },

    setupTabs: function() {
        //initialise tabs
        'use strict';
        if($('.js-tabbable').length <= 0) {
            return;
        }
        $('.js-tabbable').find('.nav a').click(function(e) {
            var tab = $(this).attr('href');
            if($(tab).length > 0) {
                e.preventDefault();
                var parentel = $(this).closest('.nav');
                parentel.find('li').removeClass('active');
                $(this).parent().addClass('active');
                $(tab).closest('.tabwrapper').children('.tabpane').removeClass('active');
                $(tab).addClass('active');
            }
        });
    },

    setupAlertMessageClosing: function() {
        'use strict';
        //alert messages
        $('body').on('click','.alert .close',function(e){
            e.preventDefault();
            $(this).parent().fadeOut();
        });
    },

    setupPopups: function(self) {
        'use strict';
        //popups
        $('body').on('click','.js-openpopup',function(e){
            e.preventDefault();
            $('.popupwrapper').find('.mask').fadeIn();
            var popup = $(this).attr('data-target'),
                $target = $('.popup[data-id=' + popup + ']'),
                option = 0, //used to detect positioning options
            //if fixed position
                position = $(this).attr('data-position');

            if(position){
                $target.addClass(position);
                option = 1;
            }

            if(!option) {
                var scrolltop = $(window).scrollTop();
                $target.css('top',scrolltop + 50);
            }
            $target.fadeIn().addClass('js-enabledpopup');
        });
        $('body').on('keyup', function(e) {
            if(e.keyCode === 27) {
                self.popupClose();
            }
        });
        $('.mask').on('click', function(e) {
            self.popupClose();
        });
        $('.popup').click(function(event){
          event.stopPropagation();
        });
        $('.popup .js-closepopup').click(function(e){
            e.preventDefault();
            self.popupClose(e);
        });
    },

    popupClose: function(e) {
        if(e === undefined) {
            $('.popupwrapper .mask').fadeOut();
            $('.popup.js-enabledpopup').fadeOut();
        } else {
            var $this = $(e.target);
            $('.popupwrapper .mask').fadeOut();
            $this.closest('.popup').fadeOut();
        }
    }

};

$(document).ready(function() {
    app.main.init();
});

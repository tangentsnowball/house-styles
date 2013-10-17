
$(function() {
    $('body').removeClass('no-js');

    //if we want any forms to not be submittable twice, add the 'js-disable-on-click' class to any buttons in the form
    //(untested)
    /*
    $('form').submit(function(){
        $(this).find('.js-disable-on-click').attr('disabled','disabled');
    });
    */

    //put here any generic functions for body clicks e.g. dropdowns should disappear
    $('html').click(function(){
        $('.btn-group').removeClass('open'); //button dropdowns
    });

    //button dropdowns
    //note that this should be removed for oscar projects as it will be in the js already
    $('.dropdown-toggle').click(function(e){
        e.stopPropagation();
        e.preventDefault();
        $('.btn-group').removeClass('open');
        $(this).closest('.btn-group').toggleClass('open');
    });

    //initialise tabs
    if($('.js-tabbable').length > 0){
        $('.js-tabbable').find('.nav a').click(function(e){
            var tab = $(this).attr('href');
            if($(tab).length > 0){
                e.preventDefault();
                var parentel = $(this).closest('.nav');
                parentel.find('li').removeClass('active');
                $(this).parent().addClass('active');
                $(tab).closest('.tabwrapper').find('.tabpane').removeClass('active');
                $(tab).addClass('active');
            }
        });
    }


    //alert messages
    $('.alert .close').on('click',function(e){
        e.preventDefault();
        $(this).parent().fadeOut();
    });


});

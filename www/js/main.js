/* =================================
------------------------------------
	Civic - CV Resume
	Version: 1.0
 ------------------------------------ 
 ====================================*/


'use strict';


$(window).on('load', function () {
    /*------------------
        Preloder
    --------------------*/
    $(".loader").fadeOut();
    $("#preloder").delay(400).fadeOut("slow");

});


(function ($) {

    var experienceYears = new Date(new Date().getTime() - new Date(Date.parse("01/9/2009")).getTime()).getFullYear() - 1970;
    $("#experience").html(experienceYears + "+ years of experience");
    /*------------------
        Background set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });


    $('.rs1').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        autoplayTimeout: 10000,
        autoplay: true
    });

    $('.rs2').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        autoplayTimeout: 7000,
        autoplay: true
    });


    $('.progress-bar-style').each(function () {
        var progress = $(this).data("progress");
        var prog_width = progress + '%';
        if (progress <= 100) {
            $(this).append('<div class="bar-inner" style="width:' + prog_width + '"><span>' + prog_width + '</span></div>');
        } else {
            $(this).append('<div class="bar-inner" style="width:100%"><span>' + prog_width + '</span></div>');
        }
    });


    $('.lan-prog').each(function () {
        var progress = $(this).data("lanprogesss");
        var ele = '<span></span>';
        var ele_fade = '<span class="fade-ele"></span>';

        for (var i = 1; i <= 5; i++) {
            if (i <= progress) {
                $(this).append(ele);
            } else {
                $(this).append(ele_fade);
            }
        }
    });


    /*------------------
        Popup
    --------------------*/
    $('.portfolio-item .port-pic').magnificPopup({
        type: 'image',
        mainClass: 'img-popup-warp',
        removalDelay: 500,
    });


    if ($().circleProgress) {

        //Set progress circle 1
        $("#progress1").circleProgress({
            value: 0.75,
            size: 175,
            thickness: 2,
            fill: "#40424a",
            emptyFill: "rgba(0, 0, 0, 0)"
        });
        //Set progress circle 2
        $("#progress2").circleProgress({
            value: 0.83,
            size: 175,
            thickness: 2,
            fill: "#40424a",
            emptyFill: "rgba(0, 0, 0, 0)"
        });

        //Set progress circle white
        $("#progress3").circleProgress({
            value: 0.75,
            size: 175,
            thickness: 2,
            fill: "#ffffff",
            emptyFill: "rgba(0, 0, 0, 0)"
        });

        //Set progress circle white
        $("#progress4").circleProgress({
            value: 0.83,
            size: 175,
            thickness: 2,
            fill: "#ffffff",
            emptyFill: "rgba(0, 0, 0, 0)"
        });

        //Set progress circle skyblue
        $("#progress5").circleProgress({
            value: 0.75,
            size: 175,
            thickness: 2,
            fill: "#009fff",
            emptyFill: "rgba(0, 0, 0, 0)"
        });

        //Set progress circle skyblue
        $("#progress6").circleProgress({
            value: 0.83,
            size: 175,
            thickness: 2,
            fill: "#009fff",
            emptyFill: "rgba(0, 0, 0, 0)"
        });

        $.get('https://api.github.com/repos/victorpaul/web-kosh/commits', (data) => {
            var commit = data[0];
            $("#commit").html("Last commit " + commit.sha + " " + commit.commit.author.date);
        });
		// $.get('https://apps.garmin.com/en-US/apps/1b2d5771-651f-4c10-8b1b-600d2fa07c18', (data) => {
		// 	var htmlPage = data;
		// 	console.log(data);
		// 	//$("#chalkdownloads").html("Last commit " + commit.sha + " " + commit.commit.author.date);
		// });

    }

})(jQuery);


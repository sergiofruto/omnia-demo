(function($){
  $(function(){

    $('.button-collapse').sideNav();
    $('select').material_select();
    $('.modal-trigger').leanModal();
    $(".dropdown-button").dropdown();

    $('.toggle-show').click(function() {
        $( '#prob_more_info' ).toggleClass("hide");
    });

  }); // end of document ready
})(jQuery); // end of jQuery name space

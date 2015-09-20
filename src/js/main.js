(function() {
    "use strict";
    // ES6
    console.log([1, 2, 3].map((v) => v * v));
}());

$( document ).ready(function(){
  // Initialize collapse button
  $(".button-collapse").sideNav();
  $("select").material_select();
  console.log ("funciona");
})

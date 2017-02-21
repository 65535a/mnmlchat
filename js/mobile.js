$(document).ready(function(){

var width = $(window).width();

if (width <= 768) {

	$('<link/>', {
		rel: "stylesheet",
		type: "text/css",
		href: "/css/mobile.css"
	}).appendTo('head');

	
	$('#mobileMenu').bind('click', toggleMenu);
	var menu = true;
		
	function toggleMenu(e) {
		if (menu) {
			$('#sideBar').css('visibility', 'visible');
			$('#sideBar').animation('fadeIn');
			$('#add').css('visibility', 'visible');
			$('#room').css('visibility', 'visible');
			
			console.log("menu päälle");
		}else{
			$('#sideBar').animation('fadeOut');
			$('#sideBar').css('visibility', 'collapse');	
			$('#add').css('visibility', 'collapse');
			$('#room').css('visibility', 'collapse');

			console.log("menu pois");
		}
		menu = !menu;
	}
	
}
	
});
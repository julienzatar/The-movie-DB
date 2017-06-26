$("document").ready(function() {

	console.log('load ok');

	$("#liked").on('click', function(event){

		if ($(this).attr('id') == 'liked') {
			event.preventDefault();	
		} 
		else {
			$(this).addClass( "liked" );
		};
	});

	$(".search-form").submit(function(event){

		var length = $('#search').val().length;

		if (length < 3) {

			event.preventDefault();	
			
		};

	});




});
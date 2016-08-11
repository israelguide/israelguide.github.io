function formatDateFromString( date ) {
	if( date ) {
		dObj = new Date( date );
		return dObj.getUTCHours() + ':' + dObj.getUTCMinutes() + ':' + dObj.getUTCSeconds()
			+ ' ' + dObj.getMonth() + '/' + dObj.getDate() + '/' + dObj.getFullYear();
	} else {
		return '';
	}
}

function cutText(text, maxLength) {
	var cuted = text;
	if (cuted.length > maxLength) {
		cuted = cuted.substr(0, maxLength - 1) + "…";
	}
	return cuted;
}

function checkPage( id = null ) {
  	return (id == null) ? 'retreive-new' : id;
}

function processPage( page ) {

	arr = page.split('-');

	$('#results').empty().html('<h3>Retrieving ' + arr[1] + ' questions</h3>');

	db.ref('/').once("value").then(function(obj) {
		data = obj.val();

		$('#results').empty().html('<table class="table table-striped table-hover ">'
  + '<thead>'
  + '<tr>'
    + '<th>#</th>'
    + '<th>Date</th>'
    + '<th>Question</th>'
    + '<th></th>'
    + '<th></th>'
  + '</tr>'
  + '</thead>'
  + '<tbody></tbody></table>');

		i = 1;
		var unanswered = 0;

		for( var key in data ) {
			v = data[key];

			if( v.hasOwnProperty('answers') ) {
				answersView = ' <a href="javascript:void(0)" class="btn btn-info" data-key="' + key + '" data-toggle="modal" data-target="#viewModal">Read ' + Object.keys( v['answers'] ).length + ' answers</a> ';
			} else {
				unanswered++;
				answersView = ' <a href="javascript:void(0)" class="btn btn-info" disabled="">Read answers</a> ';
			}

			$('#results tbody').append('<tr id="q__' + key + '">'
				+ '<td>' + i++ + '</td>'
				+ '<td><small>' + formatDateFromString( v['mDate'] ) + '</small></td>' 
				+ '<td><p>' + cutText(v['question'], 50) + '</p>'
				+ '<p class="full-text" style="display:none;">' + v['question'] + '</p>'
				+ '</td>' 
				+ '<td><a href="javascript:void(0);" class="btn btn-primary" data-key="' + key + '" data-toggle="modal" data-target="#replyModal">reply</a></td>'
				+ '<td>' + answersView + '</td>'
				+ '</tr>');
		}

		/**
		 * Update info about unanswered questions
		 */
		$("#unanswered_questions").html($("#unanswered_questions").html().replace(/__unansw__/g, unanswered));
		$('#unanswered_questions a').popover();


	});

}


// var buddy_name = Cookies.get('buddy_name');
var buddy_name = null;
if( buddy_name == undefined || buddy_name == null ) {
	buddy_name = prompt('Enter your name', '');
	Cookies.set('buddy_name', buddy_name, { expires: 7 });
}
$("#buddyName").text($("#buddyName").text().replace(/__buddy_name__/g, buddy_name));

var page = checkPage();
processPage( page );

db.ref('/').on('value', function(data) {
	processPage( page );
});

/**
 * View functionality
 */

$('#viewModal').on('show.bs.modal', function (event) {
	var button = $(event.relatedTarget)
  	var key = button.data('key')
  	var modal = $(this)

	$('.modal-title', modal).empty().html('<h3>Retrieving answers</h3>');

	db.ref('/' + key + '/answers/').once("value").then(function(obj) {
		$('.modal-title', modal).empty().html('<div class="list-group"></div>');
		data = obj.val();
		for( var key in data ) {
			v = data[key];
			vote = v['vote'] || 0;
			$('.modal-title .list-group', modal).append('<div class="list-group-item">'
			    + '<div class="row-action-primary text-center">'
			      + '<i class="material-icons" ' + ((vote > 0) ? 'style="background-color:rgb(177, 239, 152) !important"' : '') + '>thumb_up</i>'
			    + '</div>'
			    + '<div class="row-content">'
			      + '<div class="least-content">' + formatDateFromString( v['mDate'] ) + '</div>'
			      + '<h4 class="list-group-item-heading">' + v['BuddyName'] + '</h4>'
			      + '<p class="list-group-item-text">' + v['answer'] + '</p>'
			    + '</div>'
			  + '</div>'
			  + '<div class="list-group-separator"></div>');
		}
	});
});

$('#viewModal').on('hidden.bs.modal', function (event) {
	var modal = $(this)
	modal.find('.modal-title').empty();
});


/**
 * Reply functionality
 */

$('#replyModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget)
  var key = button.data('key')
  var modal = $(this)
  var text = $('#q__' + key + ' .full-text').text();
  modal.find('.question-field').html('&laquo;' + text + '&raquo;')
  modal.find('input[name="key"]').val(key)
});

$('#replyModal').on('hidden.bs.modal', function (event) {
	form = $('form', this);
	$('input, textarea', form).val('');
	$('.question-field', form).text('');
});

$('#replyModal').on('submit', function() {

	var modal = $(this)

	form = $('form', modal).serializeArray();

	buddyName = form[0]['value'];
	key = form[1]['value'];
	answerText = form[2]['value'];
	d = new Date();
	
	db.ref('/' + key + '/answers/').push({
		mDate: d.getTime(),
		answer: answerText,
		BuddyName: buddy_name,
		vote: 0
	});

	$('.alert', modal).show();

	setTimeout(function() { 
		$('.alert', modal).hide();
		$('#replyModal').modal('hide');
	}, 1500);

	return false;
});

$(document).ready(function() {


  $('.container').hide();

  fetchData();

  $("#seek-box").hide();
  $("#input-area").hide();
  $("#saved-text").hide();
  $("#saved-area").hide();

  $("#seek-box").click(function() {

    populate();

    $('.container').show();

    $("#seek-box").hide();
  });

});

var mongoData;
var dataCount = 0;
var dataDate;

var state = 0;
var cubeRotateAry = ['show-front', 'show-back', 'show-right', 'show-left', 'show-top', 'show-bottom'];
var sideAry = ['back', 'right', 'left', 'top', 'bottom', 'front'];

var populate = function() {

  $.getJSON('/check', function(data) {

    mongoData = data;

    dataDate = mongoData[mongoData.length - 1].date;
  })
  .done(function() {
    clickBox();
    saveNote();
  });
};

var gather = function() {

  var idCount = dataCount - 1;

  $.ajax({
    type: "POST",
    dataType: "json",
    url: '/gather',
    data: {
      id: mongoData[idCount]._id
    }
  })

  .done(function(currentNotes) {
    postNote(currentNotes);
  })

  .fail(function() {
    console.log("Sorry. Server unavailable.");
  });
};

var postNote = function(currentNotes) {

  $("#note-box").val("");

  var note = "";

  for (var i = 0; i < currentNotes.length; i++) {

    note = note + currentNotes[i].noteText + '\n';
  }
  $("#note-box").val(note);
};

var saveNote = function() {

  $("#note-button").on('click', function() {

    var text = $("#input-box").val();

    var idCount = dataCount - 1;

    $.ajax({
      type: "POST",
      dataType: "json",
      url: '/save',
      data: {
        id: mongoData[idCount]._id, 
        date: dataDate, 
        note: text 
      }
    })
    .done(function() {

      $("#input-box").val("");

      gather();
    })
    .fail(function() {
      console.log("Sorry. Server unavailable.");
    });

  });
};

var deleteNote = function() {

  $("#delete-button").on('click', function() {

    var idCount = dataCount - 1;

    $.ajax({
      type: "DELETE",
      dataType: "json",
      url: '/delete',
      data: {
        id: mongoData[idCount]._id,
      }
    })
    .done(function() {
      $("#note-box").val("");
    })
    .fail(function() {
      console.log("Sorry. Server unavailable.");
    });

  });
};

var typeIt = function() {
  $("#typewriter-headline").remove();
  $("#typewriter-summary").remove();
  var h = 0;
  var s = 0;
  var newsText;

  if (state > 0) {
    side = state - 1;
  } else {
    side = 5;
  }

  $("." + sideAry[side]).append("<div id='typewriter-headline'></div>");
  $("." + sideAry[side]).append("<div id='typewriter-summary'></div>");

  // cycle to different story
  console.log(mongoData);
  var headline = mongoData[dataCount].headline;
  var summary = mongoData[dataCount].summary;
  dataCount++;
  (function type() {
    printHeadline = headline.slice(0, ++h);
    printSummary = summary.slice(0, ++s);


    $("#typewriter-headline").text(printHeadline);
    $("#typewriter-summary").text(printSummary);

    if (printHeadline.length === headline.length && printSummary.length === summary.length) {
      return;
    }
    setTimeout(type, 35);
  }());
};

var headline = function() {
  var show = "|| Article:" + (dataCount + 1) + " ||";
  $("#headline").text(show);
  $("#headline").fadeIn()
    .css({
      position: 'relative',
      'text-align':'center',
      top:100
    })
    .animate({
      position:'relative',
      top: 0
    });
};

var clickBox = function() {
  $("#cube").on("click", function() {
    if (state <= 5) {
      state++;
    } else {
      state = 0;
    }
    $('#cube').removeClass().addClass(cubeRotateAry[state]);

    headline();

    typeIt();

    gather();

    deleteNote();

    $("#input-area").show();
    $("#saved-area").show();
  });
};

var fetchData = function() {
  $.ajax({
    type: "POST",
    url: '/fetch'
  }).done(function() {
    $("#seek-box").show();
  }).fail(function() {
    alert("Sorry. Server unavailable.");
  });
};



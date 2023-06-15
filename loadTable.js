$(document).ready(function () {
  let table = $("#modelTable").DataTable({
    ajax: {
      url: "/api/models",
      dataSrc: ""
    },
    columns: [
      { data: "model" },
      { data: "code" },
      { data: "location" },
      {
        data: null,
        render: function (data, type, row) {
          data.originalLocation = data.location; // Store the original location
          let locations = ['ELP_1', 'ELP_2', 'ELP_3', 'ELP_4', 'ELP_5', 'ELP_6', 'ELP_7', 'ELP_8', 'ELP_9', 'ELP_10', 'ELP_11'];
          let selectBox = '<select class="locationSelect">';
          for(let i = 0; i < locations.length; i++) {
            selectBox += '<option value="' + locations[i] + '"' + (row.location == locations[i] ? ' selected' : '') + '>' + locations[i] + '</option>';
          }
          selectBox += '</select>';
          return selectBox;
        }
      },
      {
        data: null,
        className: "center",
        defaultContent: '<button class="submitBtn">Submit</button>'
      }
    ],
  });

  $('#modelTable tbody').on('click', 'button.submitBtn', function () {
    let data = table.row($(this).parents('tr')).data();
    let selectedLocation = $(this).parents('tr').find('select.locationSelect').val();
    console.log(`original location: ${data.originalLocation} selected location: ${selectedLocation}`)
    if (data.originalLocation !== selectedLocation) {
      // Only send AJAX request if location has changed
      data.location = selectedLocation;

      delete data.originalLocation; // Delete the originalLocation field before sending

      $.ajax({
        url: '/api/models/update',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data, null, 2),
        success: function(response) {
          console.log(response);
          table.ajax.reload(null, false);  // Reload the table data, keep pagination
        },
        error: function(error) {
          console.error(error);
        }
      });
    }
  });

  $('#resetBtn').on('click', function() {
    let confirmRestore = confirm("Are you sure you want to restore the default values? This cannot be undone.");
    if (confirmRestore) {
        // If user confirms, send AJAX request to restore defaults
        $.ajax({
            url: '/api/models/reset',
            type: 'POST',
            success: function(response) {
                console.log(response);
                // Reload the table data after reset
                table.ajax.reload(null, false);
            },
            error: function(error) {
                console.error(error);
            }
        });
    }
  });
});

$(function() {
    var client = new WindowsAzure.MobileServiceClient('https://dosmentum.azure-mobile.net/', 'mfwERnDjwtGbPJRyTKTmPxCgopsaFx18'),
        groupsTable = client.getTable('groups');

    // Read current data and rebuild UI.
    // If you plan to generate complex UIs like this, consider using a JavaScript templating library.
    function refreshgroupItems() {
        var query = groupsTable;

        query.read().then(function(groupItems) {
            var group = $.map(groupItems, function(item) {
                return $('<li>')
                    .attr('data-todoitem-id', item.id)
                    .append($('<button class="item-delete">Delete</button>'))
                    .append($('<div>').append($('<input class="item-text">').val(item.text)));
            });

            $('#todo-items').empty().append(group).toggle(group.length > 0);
            $('#summary').html('<strong>' + groupItems.length + '</strong> item(s)');
        }, handleError);
    }

    function handleError(error) {
        var text = error + (error.request ? ' - ' + error.request.status : '');
        $('#errorlog').append($('<li>').text(text));
    }

    function getTodoItemId(formElement) {
        return $(formElement).closest('li').attr('data-todoitem-id');
    }

    // Handle insert
    $('#add-item').submit(function(evt) {
        var textbox = $('#new-item-text'),
            itemText = textbox.val();
        if (itemText !== '') {
            groupsTable.insert({ text: itemText }).then(refreshgroupItems, handleError);
        }
        textbox.val('').focus();
        evt.preventDefault();
    });

    // Handle update
    $(document.body).on('change', '.item-text', function() {
        var newText = $(this).val();
        groupsTable.update({ id: getTodoItemId(this), text: newText }).then(null, handleError);
    });

    $(document.body).on('change', '.item-complete', function() {
        var isComplete = $(this).prop('checked');
        groupsTable.update({ id: getTodoItemId(this), complete: isComplete }).then(refreshgroupItems, handleError);
    });

    // Handle delete
    $(document.body).on('click', '.item-delete', function () {
        groupsTable.del({ id: getTodoItemId(this) }).then(refreshgroupItems, handleError);
    });

    // On initial load, start by fetching the current data
    refreshgroupItems();
});
var socket = io();

socket.on('connect', () => {
    $.get("http://localhost:3000/sessions/connect",
        function (data) {
            console.log(data);
        });
})


$(window).on("beforeunload", function () {

    //change localhost to the respective server ip
    $.get("http://localhost:3000/sessions/disconnect",
        function (data) {
            console.log("Data: " + data);
        });
    socket.emit('leave', {
        cookie: document.cookie
    })
})

socket.on('updateDoc', (updateValue) => {
    /*
        {
            'id':the doc id,
            'done_status':0 or 1,
            'error':0 or 1
        }
    */
    console.log(updateValue)
    if (updateValue.error === 1) {
        console.log('error')
    } else {
        console.log('No error')
    }
    /*
     If a done/undone is clicked, then update that particular ids done/undone
    */
    // let li = jQuery('<li></li>');
    // li.text(`${newMessage.from}: ${newMessage.text}`)
    // jQuery('#messages').append(li);
})

socket.on('callUsers', () => {
    /*
        {
            'id':the doc id,
            'done_status':0 or 1,
            'error':0 or 1
        }
    */
    /*
     If a done/undone is clicked, then update that particular ids done/undone
    */
    // let li = jQuery('<li></li>');
    // li.text(`${newMessage.from}: ${newMessage.text}`)
    // jQuery('#messages').append(li);
    $.get("http://localhost:3000/sessions/users",
        function (data) {
            console.log("Users");
            console.log(data);
        });
})

jQuery('#date-select').on('submit', function (e) {
    e.preventDefault();
    let date = jQuery('[name=evalDate]').val()
    $.post("http://localhost:3000/scan/submissions", {
            "start_year": 2018,
            "start_month": 11,
            "start_day": 25,
            "end_year": 2018,
            "end_month": 11,
            "end_day": 25,
        },
        function (data, status) {
            console.log("Data: " + data + "\nStatus: " + status);
        });
    // socket.emit('createMessage',{
    //     from: 'User',
    //     text: jQuery('[name=message]').val()
    // })

})
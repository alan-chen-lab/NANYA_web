// Connect to ROS.
var ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

ros.on('connection', function () {
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('connected').style.display = 'inline';
    console.log('Connected to websocket server.');
});

ros.on('error', function (error) {
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function () {
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'inline';
    console.log('Connection to websocket server closed.');
});

// Create a connection to the rosbridge WebSocket server.
function connect() {
    var urls = document.getElementById("URL").value;
    // alert(urls)//'ws://localhost:9090'
    ros.connect(urls);
}

// --------------------------------------------------------------------------------------------

let arr = [];
var num = 1;
var sec;
var D = 20;
var rotation;
var isMouseDown = false;
var return_step = document.getElementById('return_step');
var canvas = document.getElementById('canvas3');
// console.log(return_step);

var btn = document.getElementById('btn3');
var ctx = document.getElementById('canvas3').getContext('2d');

var img = new Image();
btn.addEventListener("click", function (e) {
    img.src = '/home/alan/ros_html/src/htmljs/images/marker.png';
    ctx.drawImage(img, 0, 0);
    // img.onload = function () {
    //     ctx.fillStyle = 'rgba(0,0,0,0)'; //rgba(0,0,0,0)透明
    //     ctx.fillRect(0, 0, 400, 400);
    // };
});

// draw line function
function drawLine(x, y, stopX, stopY) {
    ctx.strokeStyle = 'rgb(200,10,10)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(stopX, stopY);
    ctx.closePath();
    ctx.stroke();
}

var x_click, y_click;
// mousedown
canvas.addEventListener("mousedown", function (event) {

    const rect = canvas.getBoundingClientRect()
    x_click = event.clientX - rect.left
    y_click = event.clientY - rect.top

    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgb(200,10,10)';
    ctx.beginPath();
    ctx.arc(x_click, y_click, 7, 0, Math.PI * 2, true);// Outer circle
    ctx.fillStyle = "red";//填充顏色,預設是黑色
    ctx.fill();//畫實心圓
});
// mousemup
canvas.addEventListener('mouseup', function (e) {
    const rect = canvas.getBoundingClientRect()
    x_up = e.clientX - rect.left
    y_up = e.clientY - rect.top
    // console.log("Point:" + x_up + ", " + y_up)
    // drawLine(x, y, x_up, y_up);
    // var pixelLength = Math.sqrt(Math.pow((e.moveX - x), 2) + Math.pow((e.moveY - y), 2));

    // rotation calulate
    dx = x_up - x_click;
    dy = y_up - y_click;
    rotation = Math.atan2(dy, dx);
    console.log("rolation_rad:" + rotation)



    // limit dis && Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(D_, 2)
    if (Math.pow(dx, 2) + Math.pow(dy, 2) > Math.pow(D, 2)) {
        let L = 30;
        let x_plus = Math.cos(rotation) * L;
        let y_plus = Math.sin(rotation) * L;
        drawLine(x_click, y_click, x_click + x_plus, y_click + y_plus);
    }

    sec = window.prompt('希望停留秒數:');
    window.alert("第" + num + "點停留" + sec + "秒");
    arr.push([x_click, y_click, rotation, sec]);
    console.log("第" + num + "點: " + "x: " + x_click + ", y: " + y_click + ", rolation: " + rotation + ", sec: " + sec)
    console.log("point:" + arr)
    num = num + 1;
});

// clear point

return_step.addEventListener("click", function (e) {
    while (arr.length > 0) {
        arr.pop();
        num = num - 1;
    }
    alert("Point: null!");
    console.log("Point: null!")
});

// roslib severs----------------------------------------------------

var send = document.getElementById('send_goals');
// console.log(send);

send.addEventListener("click", function (e) {

    console.log("in click")

    let x_srv = [];
    let y_srv = [];
    let theta_srv = [];
    let sec_srv = [];
    for (var i = 0; i < arr.length; i++) {
        x_srv.push(arr[i][0]);// = arr[i][0];//x
        y_srv.push(arr[i][1]);//y
        theta_srv.push(arr[i][2]);//th
        sec_srv.push(arr[i][3]);//sec
    }

    var sendGoalClient = new ROSLIB.Service({
        ros: ros,
        name: '/send_multi_goals',
        serviceType: 'simple_navigation_goals/multi_point'
    });

    var request = new ROSLIB.ServiceRequest({
        x_goal: x_srv,
        y_goal: y_srv,
        theta_goal: theta_srv,
        sec_goal: sec_srv
    });

    sendGoalClient.callService(request, function (e) {
        console.log('Call service! ');
    });

});


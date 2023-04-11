/**
  * Setup all visualization elements when the page is loaded. 
  */
var ros;
var viewer;
var nav;
var controller;
var cloudScan;

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

// get battery info----------------------------
// var pt = document.querySelector('.percentages');

var battery_listener = new ROSLIB.Topic({
    ros: ros,
    name: '/battery',
    messageType: 'sensor_msgs/BatteryState'
});

battery_listener.subscribe(function (m) {
    document.getElementById("msg").innerHTML = m.percentage.toFixed(2) * 100 + "%";
  document.getElementById("batteryPer").style.width = m.percentage.toFixed(2) * 100 + "%";
    // pt.style.width = m.percentage.toFixed(2) * 100 + "%"
});
//-------------------------------------------------

function showview() {

    // Create the main viewer.(camera)
    var viewer1 = new MJPEGCANVAS.Viewer({
        divID: 'camera',
        host: window.location.host,  //laptop ip
	port: 8083,
        width: 640,
        height: 480,
        topic: '/camera_info'
    });

    // Create the main viewer(navigation).
    viewer = new ROS2D.Viewer({
        divID: 'nav',
        width: 1024,
        height: 950,
    });

    //Setup the nav client.
    nav = NAV.OccupancyGridClientNav({
        ros: ros,
        rootObject: viewer.scene,
        viewer: viewer,
        serverName: '/move_base'
    });

    // // keyboard W A S D control the robot
    // controller = NAV.controller(ros,'/cmd_vel_mux/input/teleop', 'controller_show_div')

    // show topics
    var showTopics = new SCAN.topicShowAll(ros, "show_all");

    // pointCloud Scan
    cloudScan = new SCAN.cloudScan({
        ros: ros,
        robotName: '/robot_pose',
        scanName: '/laser/scan',
        scanType: 'sensor_msgs/LaserScan',
        // scanName: '/move_base/global_costmap/obstacle_layer/clearing_endpoints',
        // scanType: 'sensor_msgs/PointCloud',
        isPointedCloud: true
    })

    // show path view--------------------------------------------------------------------------------

    // var path_view = new ROSLIB.Topic({
    //     ros: ros,
    //     name: '/move_base/GlobalPlanner/plan',
    //     messageType: 'nav_msgs/Path'
    // });

    // path_view.subscribe((msg) => {
    //     // console.log("robot",pos)
    //     RosCanvas.PathShape.prototype.setPath(msg);
    // });

    //--------------------------------------------------------------------------------------------------------

    // ros.on('error', function(error) {
    //   document.querySelector('#rosStatus').className = ("error_state");
    //   document.querySelector('#rosStatus').innerText = "Error in the backend!";
    //   console.log("[Rosbridge connect] ERROR:",error);
    // });

    // Find out exactly when we made a connection.
    ros.on('connection', function () {
        console.log('Connection made!');
        showTopics.update();
        viewer.scene.addChild(cloudScan.poindCloud);
        document.querySelector('#rosStatus').className = ("connected_state");
        document.querySelector('#rosStatus').innerText = " Connected.";
    });

    ros.on('close', function () {
        console.log('Connection closed.');
        document.querySelector('#rosStatus').className = ("");
        document.querySelector('#rosStatus').innerText = " Connection closed.";
    });

}

// show all on window
window.onload = function () {
    showview()
}


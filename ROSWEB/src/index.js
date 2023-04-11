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
    host: '192.168.0.2',  //laptop ip
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
    scanName: '/laser/scan_raw',
    scanType: 'sensor_msgs/LaserScan',
    // scanName: '/move_base/global_costmap/obstacle_layer/clearing_endpoints',
    // scanType: 'sensor_msgs/PointCloud',
    isPointedCloud: true
  })

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


// joystick----------------------------------------------------------------------------------------
cmd_vel_listener = new ROSLIB.Topic({
  ros: ros,
  name: '/joystick_set_velocity',
  messageType: 'geometry_msgs/Twist'
});

move = function (linear, angular) {
  var twist = new ROSLIB.Message({
    linear: {
      x: linear,
      y: 0,
      z: 0
    },
    angular: {
      x: 0,
      y: 0,
      z: angular
    }
  });
  cmd_vel_listener.publish(twist);
}

createJoystick = function () {
  var options = {
    zone: document.getElementById('zone_joystick'),
    threshold: 0.1,
    position: { top: '200px', left: '200px' },
    mode: 'static',
    size: 350,
    color: '#000000',
  };
  manager = nipplejs.create(options);

  linear_speed = 0;
  angular_speed = 0;

  manager.on('start', function (event, nipple) {
    timer = setInterval(function () {
      move(linear_speed, angular_speed);
    }, 25);
  });

  manager.on('move', function (event, nipple) {
    max_linear = 0.15; // m/s
    max_angular = 8.0; // rad/s
    max_distance = 100.0; // pixels;
    linear_speed = Math.sin(nipple.angle.radian) * max_linear * nipple.distance / max_distance;
    angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance / max_distance;
  });

  manager.on('end', function () {
    if (timer) {
      clearInterval(timer);
    }
    self.move(0, 0);
  });
}

// show all on window
window.onload = function () {
  createJoystick();
  showview()
}

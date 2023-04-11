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
    position: { left: 50 + '%' },
    mode: 'static',
    size: 150,
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
    max_linear = 5.0; // m/s
    max_angular = 2.0; // rad/s
    max_distance = 75.0; // pixels;
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

// // to solve both camera and joystick
// if (window.addEventListener) {
//   // DOM2 standard
//   window.addEventListener("load", createJoystick(), false);
// }
// else if (window.attachEvent) {
//   // Microsoft's precursor to it, IE8 and earlier
//   window.attachEvent("onload", createJoystick());
// }
// else {
//   // Some pre-1999 browser
//   window.onload = createJoystick();
// }
window.onload = function () {
  createJoystick();
}

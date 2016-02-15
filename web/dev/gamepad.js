var Gamepad = (function() {
    'use strict';

    var wsUri = "ws://" + location.host + "/index.html?command=true";
    var wsUri = "ws://" + '192.168.1.92' + "/index.html?command=true";
    
    var statusText;
    
    var gpDataCmds;
    var gpButtons;
    var gpAccel;
    var gpJoysticks;

    function writeMessage(message) {
        statusText.setText(message);
        Controller.layer.draw();
    };

    function _init_controllers(stage, layer) {
        Controller.init({
            stage: stage,
            layer: layer,
            rotated: true,
        });

        var joy_left = new Controller.Joystick1a({
            x:130,
            y:300,
            length:200,
            breadth:70,
            padding:20,
            spring:true,
            horizontal:true,
            on_move: function(pos) {
                gpJoysticks[0] = Math.round(pos*100);
                writeMessage(pos.toFixed(2));
            }
        });

        var joy_right = new Controller.Joystick1a({
            x:500,
            y:200,
            length:200,
            breadth:70,
            padding:20,
            spring:true,
            horizontal:false,
            on_move: function(pos) {
                gpJoysticks[1] = Math.round(pos*100);
                writeMessage(pos.toFixed(2));
            }
        });

        var btn1 = new Controller.Button({
            x: 100,
            y: 100,
            on_press: function(btn) {
                btn.setState(!btn.state);
                gpButtons = gpButtons ^ 1;
            }
        });

        var btn2 = new Controller.Button({
            x: 200,
            y: 100,
            on_press: function(btn) {
                btn.setState(!btn.state);
                gpButtons = gpButtons ^ 2;
            }
        });

        statusText = new Konva.Text({
          x: 10,
          y: 10,
          fontFamily: 'Calibri',
          fontSize: 24,
          text: '',
          fill: 'black'
        });

        layer.add(statusText);
        layer.add(joy_left.shape);
        layer.add(joy_right.shape);
        layer.add(btn1.shape);    
        layer.add(btn2.shape);    
    };

    function deviceOrientationListener(event) {
        gpAccel[0] = Math.round(event.alpha);
        gpAccel[1] = Math.round(event.beta);
        gpAccel[2] = Math.round(event.gamma);
    };

    function _init() {
        var width = window.innerWidth; // 360
        var height = window.innerHeight; //640

        gpDataCmds = new ArrayBuffer(20);
        var gpHeader = new Uint32Array(gpDataCmds, 0, 1);
        gpHeader[0] = 0x11121314;
        gpButtons = new Uint16Array(gpDataCmds, 4, 1);
        gpAccel = new Int16Array(gpDataCmds, 6, 3);
        gpJoysticks = new Int8Array(gpDataCmds, 12, 4);

        var stage = new Konva.Stage({
          container: 'container',
          x: width,
          rotation: 90,
          width: width,
          height: height,
    //      scaleX: height/640,
    //      scaleY: height/640,
        });

        var layer = new Konva.Layer();

        _init_controllers(stage, layer);

        // add the layer to the stage
        stage.add(layer);
        
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", deviceOrientationListener);
        }
        
        wsComm.init(wsUri, 
            function(data) {  // onMessage
                    
            }
        );
        var interval = setInterval(
            function() { wsComm.send(gpDataCmds); }
            , 100);
    };

    return {
        init: _init,
    };
}) ();

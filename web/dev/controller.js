var Controller = Controller || {};

(function() {
    'use strict';
	var vec_normalize = function(v)
	{
		var dist2 = v.x*v.x + v.y*v.y;
		var dist = Math.sqrt(dist2);
		return {vn:{x:v.x/dist, y:v.y/dist}, mag:dist};
	}
	
	var coerce = function(x, min, max)
	{
		if (x<min) x=min;
		if (x>max) x=max;
		return x;
	}
	
	Controller.init = function(config) {
		Controller.rotated = config.rotated || false;
		Controller.stage = config.stage;
		Controller.layer = config.layer;
	}
	
	Controller.getPointerRelativePosition = function(obj) {
		var touchPos = Controller.stage.getPointerPosition();
		var ap = obj.getAbsolutePosition();
		
		var rx = (touchPos.x - ap.x);
		var ry = (touchPos.y - ap.y);
		
		if (Controller.rotated) {
			return {x:ry, y:-rx};
		} else {
			return {x:rx, y:ry};
		}
	}

	Controller.Joystick = function(config) {
		var default_args = {
			size:	60,
			spring: false,
			on_move: function(pos) {}
		}
		
		for(var index in default_args) {
			if(typeof config[index] === "undefined") config[index] = default_args[index];
		}	
		config.size_inner = config.size_inner || config.size*0.5;

		var that = this;
		
		this.pos = {x:0, y:0};
		
        this.shape = new Konva.Group({
            x: config.x,
            y: config.y,
        });

        var back = new Konva.Rect({
			width: config.size,
			height: config.size,
			offsetX: config.size/2,
			offsetY: config.size/2,
            fill: 'gray',
            strokeWidth: 0,
			opacity: 0.1
        });
		
        var back_drawn = new Konva.Rect({
			width: config.size_inner,
			height: config.size_inner,
			offsetX: config.size_inner/2,
			offsetY: config.size_inner/2,
            fill: 'gray',
            strokeWidth: 0,
			listening: false
        });		
        
        var nub = new Konva.Circle({
            x: 0,
            y: 0,
            radius: config.size/10,
            fill: 'black',
            strokeWidth: 0,
			listening : false
        });

        back.on('mousemove touchmove', function() {
			var pos = Controller.getPointerRelativePosition(that.shape);
			
			// limit to inner circle
			pos.x=coerce(pos.x, -config.size_inner/2, config.size_inner/2);
			pos.y=coerce(pos.y, -config.size_inner/2, config.size_inner/2);

			that.pos = {x:2*pos.x/config.size_inner, y:-2*pos.y/config.size_inner};
			config.on_move(that.pos);
			
			nub.position(pos);
            Controller.layer.draw();
        });

        back.on('mouseup touchend', function() {
			that.pos = {x:0, y:0};
			config.on_move(that.pos);
			
			nub.position(that.pos);
            Controller.layer.draw();
		});
		
        this.shape.add(back);
        this.shape.add(back_drawn);
        this.shape.add(nub);

      };

	Controller.Joystick1a = function(config) {
		var default_args = {
			length:	100,
			breadth: 30,
			padding: 30,
			horizontal:	false,
			spring: false,
			on_move: function(val) {}
		}
		
		for(var index in default_args) {
			if(typeof config[index] === "undefined") config[index] = default_args[index];
		}		
		
		var that = this;

		var length_inner = config.length - 2*config.padding;
		
        this.shape = new Konva.Group({
            x: config.x,
            y: config.y,
            rotation: config.horizontal ? 90:0
        });

        var back = new Konva.Rect({
			width: config.breadth,
			height: config.length,
			offsetX: config.breadth/2,
			offsetY: config.length/2,
            fill: 'gray',
            strokeWidth: 0,
//			visible: false,
			opacity: 0.1
        });
		
        var back_drawn = new Konva.Rect({
			width: config.breadth/8,
			height: length_inner,
			offsetX: config.breadth/16,
			offsetY: length_inner/2,
            fill: 'gray',
            strokeWidth: 0,
			listening: false
        });		
        
        var nub = new Konva.Rect({
            x: 0,
            y: 0,
            width: config.breadth/2,
			height: config.breadth/2,
			offsetX: config.breadth/4,
			offsetY: config.breadth/4,
            fill: 'black',
            strokeWidth: 0,
			listening : false
        });

		var _changeValue = function() {
			var mpos = Controller.getPointerRelativePosition(that.shape);
            var val = config.horizontal ? -mpos.x:mpos.y;

            val = coerce(val, -length_inner/2, length_inner/2);
			
			config.on_move(-2*val/length_inner);
			nub.position({x:0, y:val});
            Controller.layer.draw();			
		}

        back.on('mousedown touchstart', function() {
			_changeValue();
        });

        back.on('mousemove touchmove', function() {
			_changeValue();
        });

        back.on('mouseup touchend', function() {
			if (config.spring) {
                var pos = {x:0, y:0};
                config.on_move(0);
                
                nub.position(pos);
                Controller.layer.draw();
            }
		});
		
        this.shape.add(back);
        this.shape.add(back_drawn);
        this.shape.add(nub);
      };
	 
	Controller.Button = function(config) {
		var default_args = {
			size:	50,
			color_on: 'green',
			color_off: 'gray',
			on_press: function(btn) {}
		}
		for(var index in default_args) {
			if(typeof config[index] === "undefined") config[index] = default_args[index];
		}		
		
		var that=this;
		
		this.state = false;
		
		this.shape = new Konva.Rect({
			x: config.x,
			y: config.y,
			width: config.size,
			height: config.size,
			offsetX: config.size/2,
			offsetY: config.size/2,
			fill: config.color_off,
			strokeWidth: 1,
		});
		
        this.shape.on('mousedown touchstart', function() {
			config.on_press(that);
		});

		this._setState = function(state) {
			that.state = state;
				
			var color = state ? config.color_on:config.color_off;
			this.shape.fill(color);
			this.shape.draw();
		}
      };
	  
	  Controller.Button.prototype = {
		  setState: function(state) { this._setState(state); }
	  }
	 
}) ();
#pragma once 
#include <Libraries/Servo/ServoChannel.h>
//#include "../sminglib/servo/Servo.hpp>
#include "servo/Servo.hpp"
const int nServoChannels = 2;

extern ServoChannel *channel1, *channel2;
extern ServoChannel *channels[nServoChannels];

void init_servos();
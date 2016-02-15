#include "servos.hpp"
#include "Services/CommandProcessing/CommandProcessingIncludes.h"

#define SERVO_PIN_0 12 // 
#define SERVO_PIN_1 14 // 

//Timer procTimer;
//TimerDelegate procDelegate;

//ServoChannel *channel1, *channel2;
ServoChannel *channels[nServoChannels];

void cmdServo(String commandLine  ,CommandOutput* commandOutput)
{
	Vector<String> commandToken;
	int numToken = splitString(commandLine, ' ' , commandToken);
//    commandOutput->printf("numTokens: %d\r\n", numToken);
	if (numToken < 2)
	{
		commandOutput->printf("Servo 1 set 1500\r\n");
		commandOutput->printf("Servo 1 get\r\n");
		commandOutput->printf("Servo 1 conf 700 2300\r\n");
	} else {
        size_t i_servo = commandToken[1].toInt();
        if (i_servo>=nServoChannels) 
            return;
        
        if (commandToken[2] == "set") {           
            if (numToken != 4) return;
            uint32 val = commandToken[2].toInt();
            channels[i_servo]->setValue(val);
			commandOutput->printf("OK\r\n", i_servo, channels[i_servo]->getValue());
        } else if (commandToken[2] == "get") {
            uint32 val = commandToken[2].toInt();
			commandOutput->printf("Servo %d\r\n\tvalue: %d\r\n\tmin: %d\r\n\tmax: %d\r\n", i_servo, channels[i_servo]->getValue(), channels[i_servo]->getMinValue(), channels[i_servo]->getMaxValue());
        }
        else if (commandToken[2] == "conf") {
            if (numToken != 5) return;
            uint32 val1 = commandToken[3].toInt();
            uint32 val2 = commandToken[4].toInt();
            channels[i_servo]->setMinValue(val1);
            channels[i_servo]->setMaxValue(val2);
			commandOutput->printf("OK\r\n", i_servo, channels[i_servo]->getValue());
        }        
    }
}

void init_servos()
{
    commandHandler.registerCommand(CommandDelegate("servo","set servo value","user", cmdServo));    

    channels[0] = new(ServoChannel);
    channels[0]->attach(SERVO_PIN_0);
    channels[0]->setMinValue(520);
    channels[0]->setValue(800);
    
    channels[1] = new(ServoChannel);
    channels[1]->attach(SERVO_PIN_1);
    channels[1]->setMinValue(520);
    channels[1]->setValue(800);

//	procDelegate = calcValue;
//	procTimer.initializeMs(2000,procDelegate).start();
}
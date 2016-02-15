#pragma once

#include <user_config.h>
#include <SmingCore/SmingCore.h>

#ifndef WIFI_SSID
	#define WIFI_SSID "PleaseEnterSSID" // Put you SSID and Password here
	#define WIFI_PWD "PleaseEnterPass"
#endif

#define RC_CONFIG_FILE ".rc.conf"

/* 
enum TriggerType
{
	eTT_None = 0,
	eTT_Temperature,
	eTT_Humidity
};
 */
 
struct RCConfig
{
	RCConfig()
	{
        servoMin[0] = 700;
        servoMin[1] = 700;
        servoMax[0] = 2300;
        servoMax[1] = 2300;
    }

	String NetworkSSID;
	String NetworkPassword;

	uint32 servoMin[2];
	uint32 servoMax[2];
};

RCConfig loadConfig();
void saveConfig(RCConfig& cfg);

extern RCConfig ActiveConfig;

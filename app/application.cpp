#include <user_config.h>
#include <SmingCore/SmingCore.h>
#include "Services/CommandProcessing/CommandProcessingIncludes.h"
//#include "../../sminglib/servo/ServoControl.hpp"
#include "servos.hpp"
#include "wifi_secret.hpp"
#include "http_server.hpp"

// download urls, set appropriately
#define ROM_0_URL  "http://192.168.1.72:80/rom0.bin"
#define ROM_1_URL  "http://192.168.1.72:80/rom1.bin"
#define SPIFFS_URL "http://192.168.1.72:80/spiff_rom.bin"

rBootHttpUpdate* otaUpdater = 0;

void OtaUpdate_CallBack(bool result) {
	Serial.println("In callback...");
	if(result == true) {
		// success
		uint8 slot;
		slot = rboot_get_current_rom();
		if (slot == 0) slot = 1; else slot = 0;
		// set to boot new rom and then reboot
		Serial.printf("Firmware updated, rebooting to rom %d...\r\n", slot);
		rboot_set_current_rom(slot);
		System.restart();
	} else {
		// fail
		Serial.println("Firmware update failed!");
	}
}

void OtaUpdate() {
	uint8 slot;
	rboot_config bootconf;
	
	Serial.println("Updating...");
	
	// need a clean object, otherwise if run before and failed will not run again
	if (otaUpdater) delete otaUpdater;
	otaUpdater = new rBootHttpUpdate();
	
	// select rom slot to flash
	bootconf = rboot_get_config();
	slot = bootconf.current_rom;
	if (slot == 0) slot = 1; else slot = 0;

#ifndef RBOOT_TWO_ROMS
	// flash rom to position indicated in the rBoot config rom table
	otaUpdater->addItem(bootconf.roms[slot], ROM_0_URL);
#else
	// flash appropriate rom
	if (slot == 0) {
		otaUpdater->addItem(bootconf.roms[slot], ROM_0_URL);
	} else {
		otaUpdater->addItem(bootconf.roms[slot], ROM_1_URL);
	}
#endif
	
#ifndef DISABLE_SPIFFS
	// use user supplied values (defaults for 4mb flash in makefile)
	if (slot == 0) {
		otaUpdater->addItem(RBOOT_SPIFFS_0, SPIFFS_URL);
	} else {
		otaUpdater->addItem(RBOOT_SPIFFS_1, SPIFFS_URL);
	}
#endif

	// request switch and reboot on success
	//otaUpdater->switchToRom(slot);
	// and/or set a callback (called on failure or success without switching requested)
	otaUpdater->setCallback(OtaUpdate_CallBack);

	// start update
	otaUpdater->start();
}

void Switch() {
	uint8 before, after;
	before = rboot_get_current_rom();
	if (before == 0) after = 1; else after = 0;
	Serial.printf("Swapping from rom %d to rom %d.\r\n", before, after);
	rboot_set_current_rom(after);
	Serial.println("Restarting...\r\n");
	System.restart();
}

/*
void ShowInfo() {
    Serial.printf("\r\nSDK: v%s\r\n", system_get_sdk_version());
    Serial.printf("Free Heap: %d\r\n", system_get_free_heap_size());
    Serial.printf("CPU Frequency: %d MHz\r\n", system_get_cpu_freq());
    Serial.printf("System Chip ID: %x\r\n", system_get_chip_id());
    Serial.printf("SPI Flash ID: %x\r\n", spi_flash_get_id());
    //Serial.printf("SPI Flash Size: %d\r\n", (1 << ((spi_flash_get_id() >> 16) & 0xff)));
}
*/

void cmdConnect(String commandLine, CommandOutput* commandOutput) {
    WifiStation.config(WIFI_SSID, WIFI_PWD);
    WifiStation.enable(true);
}

void cmdDisconnect(String commandLine, CommandOutput* commandOutput) {
    WifiStation.enable(false);
}


void cmdLs(String commandLine, CommandOutput* commandOutput) {
    Vector<String> files = fileList();
    commandOutput->printf("filecount %d\r\n", files.count());
    for (unsigned int i = 0; i < files.count(); i++) {
        commandOutput->printf(files[i].c_str());
        commandOutput->printf("\r\n");
    }
}

void cmdIP(String commandLine, CommandOutput* commandOutput) {
    commandOutput->printf("ip: %s mac: %s\r\n", WifiStation.getIP().toString().c_str(), WifiStation.getMAC().c_str());
}

void cmdOTA(String commandLine, CommandOutput* commandOutput) {
    OtaUpdate();
}

void cmdAppHeap(String commandLine  ,CommandOutput* commandOutput)
{
    commandOutput->printf("Heap current free = %d\r\n", system_get_free_heap_size());
}

void startAP()
{
    WifiAccessPoint.enable(true);
    WifiAccessPoint.config("Sming InternetOfThings", "", AUTH_OPEN);

	// Optional: Change IP addresses (and disable DHCP)
	WifiAccessPoint.setIP(IPAddress(192, 168, 4, 1));    
}

void cmdAP(String commandLine, CommandOutput* commandOutput) {
    startAP();
} 
void init() {
	Serial.begin(SERIAL_BAUD_RATE); // 115200 by default
	Serial.systemDebugOutput(false); // Debug output to serial
	
	// mount spiffs
	int slot = rboot_get_current_rom();

	if (slot == 0) {
#ifdef RBOOT_SPIFFS_0
		debugf("trying to mount spiffs at %x, length %d", RBOOT_SPIFFS_0 + 0x40200000, SPIFF_SIZE);
		spiffs_mount_manual(RBOOT_SPIFFS_0 + 0x40200000, SPIFF_SIZE);
#else
		debugf("trying to mount spiffs at %x, length %d", 0x40300000, SPIFF_SIZE);
		spiffs_mount_manual(0x40300000, SPIFF_SIZE);
#endif
	} else {
#ifdef RBOOT_SPIFFS_1
		debugf("trying to mount spiffs at %x, length %d", RBOOT_SPIFFS_1 + 0x40200000, SPIFF_SIZE);
		spiffs_mount_manual(RBOOT_SPIFFS_1 + 0x40200000, SPIFF_SIZE);
#else
		debugf("trying to mount spiffs at %x, length %d", 0x40500000, SPIFF_SIZE);
		spiffs_mount_manual(0x40500000, SPIFF_SIZE);
#endif
	}

	WifiAccessPoint.enable(false);
	WifiStation.config(WIFI_SSID, WIFI_PWD);
    WifiStation.enable(true);
	
    Serial.printf("\r\nCurrently running rom %d.\r\n", slot);
	Serial.println("Type 'help' and press enter for instructions.");
	Serial.println();
	Serial.commandProcessing(true);
    
    commandHandler.registerCommand(CommandDelegate("ip","show current ip address","user", cmdIP));
    commandHandler.registerCommand(CommandDelegate("ota","perform ota update, switch rom and reboot","user", cmdOTA));
    commandHandler.registerCommand(CommandDelegate("heap","display free heap","user", cmdAppHeap));
    commandHandler.registerCommand(CommandDelegate("ls","list files in spiffs","user", cmdLs));
    commandHandler.registerCommand(CommandDelegate("connect","connect to wifi","user", cmdConnect));
    commandHandler.registerCommand(CommandDelegate("disconnect","disconnect from wifi","user", cmdConnect));
    commandHandler.registerCommand(CommandDelegate("ap","create access point","user", cmdAP));
    
	//Serial.setCallback(serialCallBack);
    init_servos(); 
    WifiStation.waitConnection(startWebServer, 30, startAP);    
    
}

#include <user_config.h>
#include <SmingCore/SmingCore.h>
#include "Servos.hpp"

// If you want, you can define WiFi settings globally in Eclipse Environment Variables
#ifndef WIFI_SSID
	#define WIFI_SSID "PleaseEnterSSID" // Put you SSID and Password here
	#define WIFI_PWD "PleaseEnterPass"
#endif

HttpServer server;
int totalActiveSockets = 0;

void onIndex(HttpRequest &request, HttpResponse &response)
{
	TemplateFileStream *tmpl = new TemplateFileStream("index.html");
	auto &vars = tmpl->variables();
	//vars["counter"] = String(counter);
	response.sendTemplate(tmpl); // this template object will be deleted automatically
}

void onGamepad(HttpRequest &request, HttpResponse &response)
{
	TemplateFileStream *tmpl = new TemplateFileStream("gamepad.html");
	auto &vars = tmpl->variables();
	//vars["counter"] = String(counter);
	response.sendTemplate(tmpl); // this template object will be deleted automatically
}

void onFile(HttpRequest &request, HttpResponse &response)
{
	String file = request.getPath();
	if (file[0] == '/')
		file = file.substring(1);

	if (file[0] == '.')
		response.forbidden();
	else
	{
		response.setCache(86400, true); // It's important to use cache for better performance.
		response.sendFile(file);
	}
}

void wsConnected(WebSocket& socket)
{
	totalActiveSockets++;

	// Notify everybody about new connection
	WebSocketsList &clients = server.getActiveWebSockets();
	for (int i = 0; i < clients.count(); i++)
		clients[i].sendString("New friend arrived! Total: " + String(totalActiveSockets));
}

void wsMessageReceived(WebSocket& socket, const String& message)
{
	//Serial.printf("WebSocket message received:\r\n%s\r\n", message.c_str());
	String response = "Echo: " + message;
	socket.sendString(response);
}

void wsBinaryReceived(WebSocket& socket, uint8_t* data, size_t size)
{
  static uint16_t cnt=0;
  int8_t x, y;
  x = (int8_t) data[12];
  y = (int8_t) data[13];
//	Serial.printf("Websocket binary data recieved, size: %d\r\n", size);
//  debugf("%d\n", cnt++);
//  Serial.printf("Joy x: %4d y: %4d\n\n", x, y);
  
  uint16_t s1, s2;
  s1= (((int8_t) data[12] ) + 100 )*8;
  s2= ((- (int8_t) data[13] ) + 100 )*8;

  channels[0]->setValue(s1);
  channels[1]->setValue(s2);
//  debugf("Joy x: %4d y: %4d\n\n", s1, s2);
      
}

void wsDisconnected(WebSocket& socket)
{
	totalActiveSockets--;

	// Notify everybody about lost connection
	WebSocketsList &clients = server.getActiveWebSockets();
	for (int i = 0; i < clients.count(); i++)
		clients[i].sendString("We lost our friend :( Total: " + String(totalActiveSockets));
}

void startWebServer()
{
	server.listen(80);
	server.addPath("/", onIndex);
	server.addPath("/gamepad", onGamepad);
	server.setDefaultHandler(onFile);

	// Web Sockets configuration
	server.enableWebSockets(true);
	server.setWebSocketConnectionHandler(wsConnected);
	server.setWebSocketMessageHandler(wsMessageReceived);
	server.setWebSocketBinaryHandler(wsBinaryReceived);
	server.setWebSocketDisconnectionHandler(wsDisconnected);
    server.commandProcessing(true,"command");

	Serial.println("\r\n=== WEB SERVER STARTED ===");
	Serial.println(WifiStation.getIP());
	Serial.println("==============================\r\n");
}

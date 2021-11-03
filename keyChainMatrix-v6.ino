#include<ESP8266WiFi.h>
#include<WiFiManager.h>
#include<ESP8266WebServer.h>
#include<FS.h>
#include<WebSocketsServer.h>

#include<SPI.h>
#include "ASCII_Table.h"
static const uint8_t COLSIZE = 16;
static const uint8_t MAXBRIGHT = 200;
static const uint16_t MAXSPEED = 1000;
uint8_t DATA = 13;
uint8_t CLK = 14;
uint8_t LATCH = 4;

String NAME = "AB  ";
uint16_t currentInd = 0;

uint8_t BUFFER[COLSIZE];
bool changeOfName = false;

uint16_t SPEED = 500;
uint16_t BRIGHT = 300;
String CONTENT = "/data";
String CONTENT2 = "/dat";

bool WM = 0;
unsigned long AO = 0;
String AP = "pocketMatrix,pocketMatrix";
String AP_SSID = "";
String AP_PASS = "";

unsigned long WO = 0;

unsigned long A_time = 0;
unsigned long WO_time = 0;

String WO_SSID = "";
String WO_PASS = "";

bool dispOff = true;
IPAddress apIP(192, 168, 4,1);  
IPAddress gateway(192, 168,12, 7);
IPAddress subnet(255, 255, 255, 0); 

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);
WiFiManager wifimanager;

void returnOK() {
  server.send(200, "text/plain", "");
}

void handleOtherFiles(){
  if(checkInFS(server.uri())){
    return;
  }
  server.send(404,"text.plain", "please restart the display");
  
}

void createCurr(){  
  File file = SPIFFS.open("/curr.txt", "w");
  file.print("Test  \n880\n150\n/data.txt\n/dat.txt\n0\n0\npocketMatrix,\n");
  file.close();
}

bool checkInFS(String path){
  
  feedAutoOff();
  String dataType = "text/plain";
  if(path.endsWith("/") || path.endsWith(".html")){
    dataType = "text/html";
    path = "/index.html";
  }else if(path.endsWith(".css")){
    dataType = "text/css";
    path = "/styles.css";
  }else if(path.endsWith(".js")){
    dataType = "application/js";
    path = "/script.js";
  }else{
    return false;
  }
  
  File file = SPIFFS.open(path, "r");
  if(!file)
    return false;
  server.streamFile(file, dataType);
  file.close();
  return true;
}

void formatName(String ARG){
  NAME = ARG;
  NAME += "  ";
  currentInd = 0;
  updateCurr();
  changeOfName = true;
  clearBuffer();
}

void inputText(){
  formatName(server.arg(0));
  File fileAppend = SPIFFS.open(CONTENT, "a");
  fileAppend.println(server.arg(0));
  fileAppend.close();
  returnOK();
  feedAutoOff();
}

void updateCurr(){
  File file = SPIFFS.open("/curr.txt", "w");
  String toWrite = NAME + '\n' + String(SPEED) + '\n' + String(BRIGHT) + '\n' + CONTENT + '\n' + CONTENT2 + '\n' + String(WM) + '\n' + String(AO) + '\n' + AP + '\n';
  Serial.println(toWrite);
  file.print(toWrite);
  file.close();
  feedAutoOff();
}

void sendJSON(){
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "text/json", "");
  server.sendContent("[");
  File file = SPIFFS.open(CONTENT, "r");
  uint8_t removeSpace = (COLSIZE/8);
  while(file.available()){
    server.sendContent("\"");
    String buttonName = file.readStringUntil('\n');
    server.sendContent(buttonName.substring(0, buttonName.length()-1)); // remove the \n
    server.sendContent("\",");
  }
  server.sendContent("]");
  server.sendContent("");
  file.close();
  feedAutoOff();
}

String IPToString(const IPAddress& ipAddress)
{
    return String(ipAddress[0]) + String(".") +
           String(ipAddress[1]) + String(".") +
           String(ipAddress[2]) + String(".") +
           String(ipAddress[3]);
}

void displayIP(uint16_t s, uint16_t b){
  SPEED = (MAXSPEED * 0.98);
  BRIGHT = MAXBRIGHT;
  scroll(IPToString(WiFi.localIP()) + "  ");
  SPEED = s;
  BRIGHT = b;
}

void deleteTXT(){
  uint32_t ind = server.arg(0).toInt();
  uint32_t cur = server.arg(1).toInt();
  Serial.println(server.arg(0));
  uint32_t count = 0;
  File file = SPIFFS.open(CONTENT2, "w");
  file.print("");
  file.close();
  
  file = SPIFFS.open(CONTENT, "r");
  File file2 = SPIFFS.open(CONTENT2, "a");
  while(file.available()){
    String temp = file.readStringUntil('\n');
    uint16_t len = temp.length();
    temp = temp.substring(0,len-1);
    if(count == cur)
      formatName(temp);
    if(count != ind)
      file2.println(temp);
    ++count;
  }
  file.close();
  file2.close();
  String temp = CONTENT;
  CONTENT = CONTENT2;
  CONTENT2 = temp;
  updateCurr();
  feedAutoOff();
  returnOK();  
}
void renameTXT(){
  uint32_t ind = server.arg(0).toInt();
  String txt = server.arg(1);
  uint8_t FL = server.arg(2).toInt();
  uint32_t count = 0;
  File file = SPIFFS.open(CONTENT2, "w");
  file.print("");
  file.close();
  file = SPIFFS.open(CONTENT, "r");
  File file2 = SPIFFS.open(CONTENT2, "a");
  while(file.available()){
    String temp = file.readStringUntil('\n');
    uint16_t len = temp.length();
    temp = temp.substring(0,len-1);
    if(count != ind){
      file2.println(temp);
    }
    else{
      file2.println(txt);
      if(FL) formatName(txt);
    }
    ++count;
  }
  file.close();
  file2.close();
  String temp = CONTENT;
  CONTENT = CONTENT2;
  CONTENT2 = temp;
  updateCurr();
  feedAutoOff();
  returnOK();  
}

void initFlags(){
  File file = SPIFFS.open("/curr.txt", "r");
  NAME = file.readStringUntil('\n');
  SPEED = file.readStringUntil('\n').toInt();
  BRIGHT = file.readStringUntil('\n').toInt();
  CONTENT = file.readStringUntil('\n');
  CONTENT2 = file.readStringUntil('\n');
  WM = (bool)file.readStringUntil('\n').toInt();
  AO = file.readStringUntil('\n').toInt();
  AP = file.readStringUntil('\n');
  
  AP_SSID = AP.substring(0, AP.indexOf(','));
  AP_PASS = AP.substring(AP.indexOf(',')+1);
  
  Serial.println(AP_SSID);
  Serial.println(AP_PASS);
  file.close();
  changeOfName = true;
}
void setup() {
  Serial.begin(115200);
  SPIFFS.begin();
  if(!SPIFFS.exists("/curr.txt")){
    createCurr();
  }
  initFlags();
  

  Serial.println(CONTENT);
  Serial.println(CONTENT2);
  pinMode(DATA, OUTPUT);
  pinMode(CLK, OUTPUT);
  pinMode(LATCH, OUTPUT);
  SPI.begin();
  mprint(0,0,0xFF); //clear Display
  if(!WM)
    wifimanager.autoConnect(AP_SSID.c_str());
  else{
    WiFi.config(apIP, gateway, subnet);
    WiFi.mode(WIFI_AP);
    WiFi.disconnect();
    delay(100);
        //changing softAP config and starting the Start AP
    WiFi.softAPConfig(apIP, gateway, subnet);
    WiFi.softAP(AP_SSID.c_str(), AP_PASS.c_str());
  }
  server.on("/name", HTTP_GET, [](){
      server.send(200, "text/json", "[\""+NAME+"\", \""+String(SPEED)+"\", \""+String(BRIGHT)+"\",\""+"WM"+String(WM)+"\","+AO+"]");
    });
  server.on("/init", HTTP_GET, sendJSON);
  server.on("/input", HTTP_GET, inputText);
  server.on("/exist", HTTP_GET, [](){
    formatName(server.arg(0));
    returnOK();
  });
  server.on("/curr", HTTP_GET, [](){
    updateCurr();
    returnOK();
  });
  server.on("/del", HTTP_GET, deleteTXT);
  server.on("/rn", HTTP_GET, renameTXT);
  server.on("/off", HTTP_GET, [](){
    dispOff = (bool)server.arg(0).toInt();
    mprint(0,0,0xFF);
    changeOfName = true;
    returnOK();
  });
  server.onNotFound(handleOtherFiles);
  server.begin();
  webSocket.begin();
  webSocket.onEvent(socketHandle);
  
  displayIP(SPEED, BRIGHT);
  feedAutoOff();
}
void feedAutoOff(){
  A_time = millis();
}
void AutoOff(){
  if(AO!=0)
    if(millis() - A_time > AO){
      clearBuffer();
      ESP.deepSleep(0);
    }
}
void WifiOff(){
  Serial.println(WO);
  if(WO != 0){
    if(millis() - WO_time  > WO){
      WiFi.forceSleepWake();
        if(!WM){
         WiFi.begin(WO_SSID, WO_PASS);
         while(WiFi.status() != WL_CONNECTED){
            scroll(NAME);
         }
        }else{
          WiFi.config(apIP, gateway, subnet);
          WiFi.mode(WIFI_AP);
          WiFi.disconnect();
          delay(80);
          //changing softAP config and starting the Start AP
          WiFi.softAPConfig(apIP, gateway, subnet);
          WiFi.softAP(AP_SSID.c_str(), AP_PASS.c_str());
        }
      WO = 0;
    }
  }
}
void loop() {
  if(dispOff)
    scroll(NAME);
  
  AutoOff();
  WifiOff();
  server.handleClient();
  webSocket.loop();
}

void latch(){
  delayMicroseconds(10);
  digitalWrite(LATCH, HIGH);
  delayMicroseconds(10);
  digitalWrite(LATCH, LOW);
}

uint8_t getNextCol(String txt, uint32_t * len){  
  uint8_t col;
  
  while(1){
    uint16_t row = *(len)>>3; // /8
    col = ASCIIArray[(int)txt[row] - 32][*len%8];
    
    if(txt[row] != ' '){
      if(currentInd != row){
        
        if(col != 0){
          --(*len);
          currentInd = row;
          return 0;
        }else{
          ++(*len);
        }
      }else{
        if(col == 0){
          ++(*len);
        }else{
          return col;
        }
      }
    }else{
      return col;
    }
  }
}

void scroll(String txt){
  currentInd = 0;
  clearBuffer();
  changeOfName = false;
  uint32_t txtSize = txt.length()*8; 
  for(uint32_t len = 0; len<txtSize; ++len){  
      for(int i=0; i<(1002 - SPEED); ++i){
          for(int row=0; row<COLSIZE; ++row){
            server.handleClient();
            webSocket.loop();
            if(changeOfName) break;
            uint32_t col = (1<<(COLSIZE - (row+1)));
            if(BRIGHT > 0 && BRIGHT < MAXBRIGHT){
              mprint((col>>8)&0xFF,col&0xFF,~BUFFER[row]);
              delayMicroseconds(BRIGHT);
              mprint(0,0,0xFF); 
              delayMicroseconds(MAXBRIGHT - BRIGHT);
            }else if(BRIGHT >= MAXBRIGHT){
              mprint((col>>8)&0xFF,col&0xFF,~BUFFER[row]);
              delayMicroseconds(BRIGHT); 
            }else{
              mprint(0,0,0xFF);
            }
          }
          if(changeOfName) break;
      }
      wdt_reset();
      if(changeOfName) break;
      for(uint32_t i = 0; i<COLSIZE-1; ++i) BUFFER[i] = BUFFER[i+1];
      BUFFER[COLSIZE - 1] =  getNextCol(txt, &len);
   }
 }

void mprint(byte col1, byte col2, byte row){
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  SPI.transfer(col1);
  SPI.transfer(col2);
  SPI.transfer(row);
  latch();
  SPI.endTransaction();
}

void clearBuffer(){
  for(int i = 0; i<COLSIZE; ++i) BUFFER[i] = 0x0;
}

void socketHandle(uint8_t num, WStype_t type, uint8_t * payload, size_t length){
  if(type == WStype_TEXT){
    switch(payload[0]){
      case 's': {
                  SPEED = (uint16_t) strtol((const char *)&payload[1], NULL, 10);
                  break;
                  }
      case 'b': {
                  BRIGHT = (uint16_t) strtol((const char *)&payload[1], NULL, 10);
                  break;
                }
      case 'W':{
                  switch(payload[1]){
                    case 'M':{
                      WM = (bool)(payload[2] - 48);
                      break;
                    }
                    case 'P':{
                      AP = String((char *)&payload[2]);
                      updateCurr();
                      AP_SSID = AP.substring(0, AP.indexOf(','));
                      AP_PASS = AP.substring(AP.indexOf(',')+1);
                      break;
                    }
                    case 'O':{
                      WO = String((const char *)&payload[2]).toInt()*60000;
                      
                      WO_SSID = wifimanager.getSSID();
                      WO_PASS = wifimanager.getPassword();
                      WiFi.persistent(false);
                      WiFi.mode(WIFI_OFF);      
                      WiFi.disconnect();          
                      WiFi.persistent(true);
                      WiFi.forceSleepBegin();
                      delay(10);
                      WO_time = millis();
                      break;
                    }
                  }
                }
      case 'A':{
                  AO = String((const char *)&payload[1]).toInt()*60000;
                  updateCurr();
                  Serial.println(AO);
                  break;
               }
      case 'R':{
                  switch(payload[1]){
                    case 'D':{
                      createCurr();
                      File fileAppend = SPIFFS.open("/data.txt", "w");
                      fileAppend.println("Test");
                      fileAppend.close();
                      initFlags();
                      break;
                    }
                    case 'S':{
                      switch(payload[2]){
                        case 'R':{
                          mprint(0,0,0xFF);
                          ESP.reset();
                        }
                        case 'D':{
                          uint32_t t= String((const char *)&payload[3]).toInt();
                          ESP.deepSleep(t);
                        }
                      }
                      break;  
                    }
                  }
               }
    }
    feedAutoOff();
    Serial.println(String((char *)&payload[0]));
  }
}

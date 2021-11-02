# keychain led matrix
This project aims to create a web interface for a custom made PCB for an 8x16 LED matrix display using ESP8266.

### Features: ###
* Pocket size PCB - smaller footprint using 0603 smd LEDs.
* Supports all printable characters in the ASCII table.
* Contains memory (Using SPIFFS).
* Web Interface to display words.
* Totally reprogrammable and hackable.
* Fewer components.
* battery operated and rechargable.
* Web Interface contains additional features to change from STA to AP, deepsleep, reset mcu etc.
* I have also built a webpage to create pixel art (8x8) however I also included the ASCII_Table.h containing all ASCII characters in 8 byte arrays.
* Brightness and scroll speed control.
* fast operation thanks to websockets.
* Uses Wifimanager hence can connect to any AP (Access Point) without reprogramming.

### The PCB is designed in KiCad ###

### Tool to make Pixel Art [click here](https://leddots.000webhostapp.com/)

### Steps to make one: ###

#### Fabricating the PCB ####
* Download and Install KiCad.
* Open the 'keychain.pro' file from '/PCB Design' folder
* Edit the design if needed
* Generate the gerber and drill files
* Upload to the PCB manufacturers website

#### Uploading the code ####
* Download and Install Arduino IDE
* Install ESP8266 board
* Open the keyChainMatrix-v6.ino
* select the board to be ESP-12
* Select the COM PORT and click upload

#### Initial Run ####

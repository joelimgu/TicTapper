#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <Math.h>
#include <ArduinoJson.h>


//NFC shield
PN532_SPI pn532spi(SPI, 10);               //SPI port digital 10
NfcAdapter nfc = NfcAdapter(pn532spi);     //Setup nfc drivers

#define BAUDRATE 9600 //9600



//GLOBALS
//NFC variables
String tagId = "";             //Variable for TAG NFC ID value
String command = "";                //Variable to receive RPI3 order
String tagNdefUri = "";        //Variable to store the URL for TAG writing
String response = "";          //Variable to store the response to RPI
int romIt = 0;                 //Variable to determine to ROM or not to ROM: 1 -> ROM  0-> NO ROM
String operationType = "";
unsigned long timeToDetect;    //Variable to store the time it took to detect TAG
unsigned long timeToIdentify;  //Variable to store the time it took to read TAG id
unsigned long timeToRead;      //Variable to store the time it took to read a NDEF field
unsigned long timeToWrite;     //Variable to store the time it took to write a NDEF field




/************************************* COMMON METHODS ******************************/

//METHOD TO READ String FROM SERIAL PORT
void readSerialString() {
    while(Serial.available() == 0){}       //Wait till a serial data is available
    if(Serial.available()) {               //If serial port is available
      command = Serial.readString();      //saves the input ( keep in mind if useing the arduino serial monitor it should be configured with no line ending)
    }
}


void writeURLToTag(){ //function called when a URL is passed through the USB to wite it to the sticker
    timeToDetect = 0;
    timeToIdentify = 0;
    timeToRead = 0;
    timeToWrite = 0;
    response = "";
    readTagId();                          //Read the id of the NFC chip
    unsigned long start = millis();
    unsigned long endOfWrite = 0;
    response = response + tagId + "**";              //Prepare response string idTag**
    if (writeTagUri()){                     //Write the URL into the chip
      endOfWrite = millis();
      if (checkTagUri()){                     //Check if the written URL is correct
        if (romIt == 1){                          //ROM it or not:
          romTag();
          response = response + "RO**";               //Prepare response string RO => Read Only => SUCCESS AND ROMED
          operationType = "RO";
        }else{
          response = response + "R**";                //Prepare response string R => Read => SUCCESS AND NO ROMED
          operationType = "R";
        }
      }else{
        response = response + "RE**";                 //Prepare response string RE => Read Error
        operationType = "RE";
      }
    }else{
      endOfWrite = millis();
      response = response + "WE**";                 //Prepare response string WE => Write Error
      operationType = "WE";
    }
    
    timeToWrite = endOfWrite - start;
    /* TODO: ADD timing params: Time to identify, Time to Write, Time to Read, Try to get more info about the chip */
    response = response + timeToDetect + "**";                 //Prepare response Time to Read tag in miliseconds
    response = response + timeToIdentify + "**";                 //Prepare response Time to Read tag in miliseconds
    response = response + timeToRead + "**";                 //Prepare response Time to Read tag in miliseconds
    response = response + timeToWrite + "**";                 //Prepare response Time to write tag in miliseconds
    //Serial.println(response + "***");
}

/************************************* NFC METHODS ******************************/
/*
void waitUntilTagIsDetected(){
  int timeout=0;
  while ((!nfc.tagPresent())&&(timeout!=0)) {
  delay(10);
  counter = counter+1;
  if (counter > 200){
    timeout = 1;
  }
}*/

//METHOD TO READ NFC ID
//Reads the NFC Tag id and stores it in the tagId variable and also saves the time to detect in the variable timeToDetect
void readTagId() {
  unsigned long start= millis();
  unsigned long endDetect = 0;
  unsigned long endIdentify = 0;
  int counter=0;
  int timeout=0;

  while ((!nfc.tagPresent())&&(timeout!=0)) {
    delay(10);
    counter = counter+1;
    if (counter > 200){
      timeout = 1;
    }
  }

  endDetect = millis();
  timeToDetect = endDetect - start;
  if (timeout == 0){
    NfcTag tag = nfc.read();
    tagId = tag.getUidString();
  }else{
    tagId = "error";
  }
  endIdentify = millis();
  timeToIdentify = endIdentify - start;
}

//METHOD TO READ THE URI OF THE FIRST NDEF FIELD FOUND
bool checkTagUri() {
  unsigned long start= millis();
  unsigned long endOfRead = 0;
  NfcTag tag = nfc.read();
  endOfRead = millis();
  timeToRead = endOfRead - start;
  NdefMessage message = tag.getNdefMessage();        //Get the ndef
  NdefRecord record = message.getRecord(0);         //Get the record of the ndef
  String payload = record.payloadStringify();
  tagNdefUri = payload;
  String original = "."+command;                      //not sure if needed: original.replace("http://","."); -> Old school, if it works don't touch it.
  if (original == payload){
   return true;                                     //Check is success :)
  }else{
    //response = response + payload + "::::" + original;
    return false;                                   //Check failed :(
  }
}


//METHOD TO WRITE A TAG
bool writeTagUri() {
  NdefMessage message = NdefMessage();
  message.addUriRecord(command);
  return nfc.write(message);
}

//METHOD TO ROM THE TAG
void romTag() {
  NfcTag tag = nfc.read();
  nfc.ROM();
}

void writeURL(){  
    timeToDetect = 0;
    timeToIdentify = 0;
    timeToRead = 0;
    timeToWrite = 0;
    response = "";
    readTagId();                          //Read the id of the NFC chip
    unsigned long start = millis();
    unsigned long endOfWrite = 0;
    if (writeTagUri()){                     //Write the URL into the chip
      endOfWrite = millis();
      if (checkTagUri()){                     //Check if the written URL is correct
        if (romIt == 1){                          //ROM it or not:
          romTag();
          response = response + "RO**";               //Prepare response string RO => Read Only => SUCCESS AND ROMED
        }else{
          response = response + "R**";                //Prepare response string R => Read => SUCCESS AND NO ROMED
        }
      }else{
        response = response + "RE**";                 //Prepare response string RE => Read Error
      }
    }else{
      endOfWrite = millis();
      response = response + "WE**";                 //Prepare response string WE => Write Error
    }
    timeToWrite = endOfWrite - start;
    /* TODO: ADD timing params: Time to identify, Time to Write, Time to Read, Try to get more info about the chip */
    /*response = response + tagId + "**";              //Prepare response string idTag**
    response = response + timeToDetect + "**";                 //Prepare response Time to Read tag in miliseconds
    response = response + timeToIdentify + "**";                 //Prepare response Time to Read tag in miliseconds
    response = response + timeToRead + "**";                 //Prepare response Time to Read tag in miliseconds
    response = response + timeToWrite + "**";                 //Prepare response Time to write tag in miliseconds
    //Serial.println(response + "***");
}

void setup(){
  nfc.begin();//Start NFC as SPI mode
  delay(250);
  Serial.begin(BAUDRATE);                 //Set the speed of the communication with RPI3
  while (!Serial) { }                     // wait for serial port to connect. Needed for native USB
  Serial.flush();
  //Serial.println("Arduino:nfc:Ready:*****");
  //Serial.println(" ");
  sendJSON();
 /*
  //JSON OBJECT CREATION
  const size_t capacity = JSON_OBJECT_SIZE(6);
  StaticJsonDocument <512> doc;
  
  doc["tagID"] = "22aaee3344ff";
  doc["operationType"] = "RO";
  doc["timeToDetect"] = 122;
  doc["timeToIdentify"] = 211;
  doc["timeToRead"] = 432;
  doc["timeToWrite"] = 223;
  
  serializeJson(doc, Serial);
  Serial.println();
  doc["tagID"] = "aaaaaaaaaaa";
  delay(200);
  serializeJson(doc, Serial);
  Serial.println();
  Serial.println("printed");
  const char* a = doc["tagID"];
  Serial.println(a);
  doc.clear();
  serializeJson(doc, Serial);
  */
};

void sendJSON(){
  //JSON OBJECT CREATION
  StaticJsonDocument <512> doc; //creates the JSON file using theArduinoJson libary
  
  doc["command"] = command;
  doc["tagID"] = tagId;
  doc["romIt"] = romIt;
  doc["operationType"] = operationType;
  doc["timeToDetect"] = timeToDetect;
  doc["timeToIdentify"] = timeToIdentify;
  doc["timeToRead"] = timeToRead;
  doc["timeToWrite"] = timeToWrite;
  serializeJson(doc, Serial);
  Serial.print("\r\n");
};

void loop(){
  command = "";
  if(Serial.available()) {               //If serial port is available
      command = Serial.readString();
      if (command.indexOf("https")>=0){        //Write the tag  
        writeURLToTag();
      }
      if (command == "D"){   //UnSet ROM -> NO tanquis les etiquetes
        romIt = 0;  //Rom disabled
      } else if (command == "C"){   //Set ROM -> Tanca les etiquetes
         romIt = 1; //Rom enable
      }
      sendJSON();//prints the JSON string to the serial port
  };
  //sendJSON();
  delay(10);
};

#include "U8glib.h"
U8GLIB_SH1106_128X64 u8g(U8G_I2C_OPT_NONE);

String inputString = "";

void setup()
{
  Serial.begin(9600);
}

void readFromSerial()
{
  while (Serial.available())
  {
    char inChar = (char)Serial.read();
    // end character is X
    if (inChar == 'X')
    {
      drawTurn(inputString);
      inputString = "";
    }
    else
    {
      inputString += inChar;
    }
  }
}

void drawTurn(String text)
{
  Serial.println(text);
  u8g.firstPage();
  do
  {
    u8g.setFont(u8g_font_profont12);
    u8g.setPrintPos(0, 10);
    u8g.print(text);
  } while (u8g.nextPage());
}

void loop()
{
  readFromSerial();
}

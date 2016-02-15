del /Q ..\files\*.*
call uglifyjs dev/konva_inject.js dev/gamepad.js dev/controller.js dev/comms.js -o dev/application.js
7za.exe a -tgzip ../files/application.js.gz dev/application.js
7za.exe a -tgzip ../files/konva.min.js.gz dev/konva.min.js
copy dev\*.html ..\files
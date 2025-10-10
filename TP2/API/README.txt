Instalación del API:
--------------------
1) Descomprimir el archivo "API v1.0.1 Installer.zip" en algún directorio temporal.
2) Descargar de https://nodejs.org/en/ la versión LTS (long-term support) 22.20.0 de Node.js correspondiente a la plataforma.
3) Crear un nuevo directorio donde quedará instalada el API una vez finalizado este instructivo.
4) Copiar el contenido del directorio temporal del paso 1 al directorio creado en el paso 3.
5) Utilizando la consola de línea de comandos o una terminal, posicionarse en el directorio creado en el paso 3, escribir "npm install" (sin las comillas) y presionar la tecla Enter.
NOTA: Ignorar las advertencias que se pudieran mostrar en relación a módulos que puedan estar deprecados.

Iniciar el API:
---------------
Utilizando la consola de línea de comandos o una terminal, posicionarse en el directorio de instalación, escribir "npm run api" (sin las comillas) y presionar la tecla Enter.

Detener el API:
---------------
Presionar Ctrl+C la consola de línea de comandos o terminal donde se está ejecutando el API (o cerrar la misma)

Acceder a la documentación del API:
-----------------------------------
Utilizando un navegador Web, acceder a la URL "http://localhost:8080/docs"

Modificar la configuración la dirección IP y/o del API:
-------------------------------------------------------
En caso de que estuviera ejecutando, detener el API.
Utilizando un editor de texto abrir el archivo .env que se encuentra en el directorio de instalación del API y luego agregar el parámetro PORT indicando el valor de puerto necesario.
Utilizando un editor de texto abrir el archivo swagger.json que se encuentra en el directorio docs y luego modificar el atributo "url" indicando el valor de puerto necesario.

Modificar la configuración del servidor de correo electrónico:
--------------------------------------------------------------
En caso de que estuviera ejecutando, detener el API.
Utilizando un editor de texto abrir el archivo .env que se encuentra en el directorio de instalación del API y luego modificar los siguientes parámetros según sea necesario:
 # SMTP_HOST: dominio o dirección IP del servidor de correo electrónico
 # SMTP_PORT: puerto del servidor de correo electrónico
 # SMTP_SECURE: indicador de uso de conexión segura
 # SMTP_USER: nombre de usuario de la cuenta de correo electrónico
 # SMTP_PASS: contraseña de la cuenta de correo electrónico
El API se encuentra preconfigurada para usar el servicio de Ethereal Mail. Este es un servicio de SMTP simulado en el cual los correos enviados a través del mismo no son entregados al destinatario. Para acceder a los mismos es necesario ingresar a la página de Ethereal Mail (https://ethereal.email/), iniciar sesión con las credenciales configuradas en el archivo .env y luego acceder a la opción "Messages" que se encuentra en la barra superior.
IMPORTANTE: Con el fin de evitar que los correos puedan ser visualizados por otros grupos, recomendamos crear una cuenta nueva en la página de Ethereal Mail y modificar los parámetros correspondientes en el archivo .env.

Modificar el asunto y template enviado en los correos electrónicos:
-------------------------------------------------------------------
En caso de que estuviera ejecutando, detener el API.
Utilizando un editor de texto abrir el archivo .env que se encuentra en el directorio de instalación del API y luego modificar los siguientes parámetros según sea necesario:
 # REGISTRATION_SUBJECT: asunto del correo electrónico enviando para verificar la dirección de email luego la registración
 # RESET_PASSWORD_SUBJECT asunto del correo enviado para permitir el reseteo de la contraseña
 # PANTRY_SHARED_SUBJECT asunto del correo enviado cuando se comparte una despensa
 # LIST_SHARED_SUBJECT asunto del correo enviado cuando se comparte una lista de compras
Utilizando un editor de texto abrir los archivos que se encuentran en el directorio templates de instalación del API y luego modificar su contenido según sea necesario:
 # registration.mft: template del correo electrónico enviando para verificar la dirección de email luego la registración
 # reset-password.mft: template del correo enviado para permitir el reseteo de la contraseña
Estos archivos pueden contener las siguientes variables de reemplazo:
 # <%FIRST_NAME%>: nombre del usuario
 # <%VERIFICATION_CODE%>: código de verificación
 # <%EXPIRATION_DATE%>: fecha de expiración del código de verificación
 # <%RECIPIENT_NAME%>: nombre del usuario al que se le comparte la despensa o lista de compras
 # <%PANTRY_NAME%>: nombre de la despensa compartida
 # <%LIST_NAME%>: nombre de la lista de compras compartida
 # <%OWNER_NAME%>: nombre del usuario dueño de la despensa o lista de compras

Prompt Frontend – RF-HU-004 Activación de Cuenta y Primer Ingreso

Desarrolla únicamente el Frontend para la historia de usuario RF-HU-004 – Activación de Cuenta y Primer Ingreso. Antes de implementar cualquier cambio, reutiliza los componentes, servicios, layouts, modales, formularios, validaciones, manejo de autenticación y estructura ya existente. No dupliques componentes ni lógica; reutiliza lo implementado y crea únicamente lo necesario para completar esta historia.

Cuando el usuario llegue a la pantalla de Login, podrá iniciar sesión utilizando su nombre de usuario o correo electrónico junto con su contraseña. Al presionar el botón Iniciar Sesión, el Frontend consumirá el endpoint POST: /auth/login y deberá actuar según la respuesta enviada por el Backend.

Si el Backend responde que el inicio de sesión fue exitoso, CONTINUA CON SU PROCESO ACTUAL YA COMO ESTA NO MODIFICAR NADA.

Si el Backend responde que la cuenta se encuentra en estado PENDING_ACTIVATION, el usuario no deberá ingresar al sistema. En su lugar, el Frontend deberá levantar un Modal de Activación de Cuenta, mostrando un mensaje indicando que la cuenta aún no ha sido activada y solicitando el código de verificación enviado al correo electrónico(PONER ENESTE MENSAJE verifica tu correo que susro para inscribire en el colegio.). Desde ese modal el usuario podrá ingresar el código y enviarlo al Backend consumiendo el endpoint POST: /auth/activate-account.

Si la respuesta de POST: /auth/activate-account indica que la cuenta fue activada correctamente, el modal deberá cerrarse automáticamente, mostrar un mensaje de éxito indicando que la cuenta ya fue activada y solicitar al usuario que vuelva a iniciar sesión utilizando su usuario y contraseña temporal.

Si la respuesta indica código incorrecto, código expirado, cuenta ya activada, cuenta inexistente o cualquier otro error, el Frontend deberá mostrar el mensaje correspondiente sin cerrar el modal, permitiendo al usuario volver a intentarlo.

Cuando el usuario vuelva a iniciar sesión y el Backend responda que corresponde al primer inicio de sesión (first_login = true), el Frontend no deberá ingresar al sistema. En su lugar deberá levantar un Modal de Cambio de Contraseña, solicitando la nueva contraseña y la confirmación de contraseña. Al confirmar, consumirá el endpoint POST: /auth/change-first-password.

Si el Backend responde que el cambio de contraseña fue exitoso, el modal deberá cerrarse automáticamente, mostrar un mensaje indicando que la contraseña fue actualizada correctamente y volver a ejecutar el proceso de inicio de sesión o solicitar al usuario iniciar sesión nuevamente, según el flujo implementado por el Backend.

Si el Backend responde que las contraseñas no coinciden, que no cumplen las políticas de seguridad, que el usuario ya no se encuentra en primer inicio de sesión o cualquier otro error, el Frontend deberá mostrar el mensaje correspondiente sin cerrar el modal para que el usuario pueda corregir la información.

Toda la navegación deberá depender de las respuestas del Backend. El Frontend no deberá tomar decisiones utilizando reglas de negocio propias; únicamente deberá interpretar las respuestas de la API y actuar en consecuencia. Reutiliza la pantalla de Login existente y desarrolla únicamente los nuevos modales, formularios y consumo de los endpoints necesarios para este flujo. Mantén el mismo estilo visual, componentes reutilizables, manejo de errores, notificaciones y estructura utilizada actualmente en el proyecto.




ESTO YA FUNCIOANABA NO MALOGRAR
caso 1: Si el login es exitoso,DEJAR TAL COMO YA NO MALOGRAR.

CASO 1: Si la cuenta está pendiente de activación, abrirá el Modal Activar Cuenta para que el usuario ingrese el código de verificación. Si la activación es exitosa, cerrará el modal y solicitará al usuario que vuelva a iniciar sesión.
BACKEN RETORNA ESTO: 
{
  "success": false,
  "status": "PENDING_ACTIVATION",
  "message": "La cuenta aún no ha sido activada."
}

cASO 2: Si la cuenta ya está activada pero corresponde al primer inicio de sesión, abrirá el Modal Cambiar Contraseña. Una vez que el cambio de contraseña sea exitoso, cerrará el modal y solicitará al usuario que inicie sesión nuevamente con su nueva contraseña.
BACKED RETORNA:
{
  "success": false,
  "is_first_login": true,
  "status": "Activo",
  "message": "Debe cambiar su contraseña."
}

ESTO YA FUNCIOANABA NO MALOGRAR
Si el Backend devuelve cualquier otro error (usuario inexistente, contraseña incorrecta, cuenta bloqueada, etc.), el Frontend mostrará el mensaje correspondiente y permanecerá en la pantalla de Login sin abrir ningún modal.
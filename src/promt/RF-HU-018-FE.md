# RF-HU-018-FE - Gestión de Eventos y Publicaciones (Frontend)
todo codigo en ingles.
## Historia de Usuario

**Como** administrador del sistema,

**Quiero** administrar eventos y publicaciones desde el panel administrativo,

**Para** crear, editar, aprobar y visualizar la información antes de su publicación.

---

## Alcance

Implementar las pantallas necesarias para consumir los servicios del backend.

---

## Funcionalidades

La gestión deberá contar con:

* Tabla de eventos o publicaciones.
* Formulario de creación/edición los mismos.

* Visualización del detalle.
* Acción para aprobar.
* Acción para eliminar.

---

## Tabla

La tabla deberá mostrar como mínimo:

* Título.
* Fecha.
* Sección.
* Público objetivo.
* Estado.
* Fecha de creación.

Deberá permitir filtrar por:
*paginado
* Pendiente.
* Aprobado.


---

## Formulario

El formulario deberá permitir registrar:

### Campos obligatorios

* Título.
* Fecha del evento.
* Ubicación.
* Color.
* Descripción.
* Público objetivo.
* Sección.

### Campos opcionales

* Imagen.
* Evento virtual.
* URL.
los imagnes debde  se esta manera arratra  imagen  aparece un buton eliminar un buton enciam del imagen al lado derecho para eliminar. si al editar se elimina  se deve enviar un badera al backen para ser eliminado . (inmgRemove)true.

Cuando el usuario marque la opción **Evento virtual**, el formulario deberá:

* Mostrar el campo URL.
* Marcarlo como obligatorio.
* Impedir guardar mientras no se complete.

Cuando la opción sea desmarcada, el campo URL deberá ocultarse.

---

## Integración

La pantalla deberá consumir los siguientes servicios del backend:

* Crear.
* Editar.
* Aprobar.
* Eliminar.
* Obtener detalle.
* Obtener listado paginado.

---

## Portal institucional

El frontend del portal consumirá el endpoint público para mostrar únicamente los eventos o publicaciones aprobados.

Cada publicación deberá mostrar:

* Imagen.
* Título.
* Fecha.
* Descripción resumida.




---

## Criterios de aceptación

* Existe una pantalla de administración.
* Existe un formulario de creación y edición.
* La URL es obligatoria únicamente para eventos virtuales.
* La tabla permite filtrar por estado.
* Se consume el listado paginado del backend.
* El portal consume el endpoint público sin paginación.

esto es nuevo modulo  se debe agregar en el didebra
para esto /Publicaciones lo ruteos.

# Prompt de Desarrollo - Frontend

## RF-HU-017 - Gestión de Datos del Colegio
## todo el codigo en ingles , con exepcion lo que ve el usuario en el html
### Objetivo

Implementar la pantalla de configuración institucional del colegio.

La pantalla permitirá registrar o actualizar la información institucional consumiendo los servicios del backend.

---

## Comportamiento

Al ingresar a la pantalla:

1. Consultar:

```http
GET /school
```

2. Si no existe información:

* Mostrar el formulario vacío.
* Al guardar consumir:

```http
POST /school
```

3. Si ya existe información:

* Cargar todos los datos en el formulario.
* El botón principal deberá actualizar la información utilizando:

```http
PUT /school
```

---

## Formulario

### Campos obligatorios

* Nombre de la institución.
* Dirección.
* Teléfono.
* UGEL.
* Correo electrónico.
* Misión.
* Visión.
* Objetivos.
* Valores.

### Campos opcionales

* Logo institucional.
* Banner institucional.

---

## Validaciones

* Todos los campos obligatorios deberán validarse antes del envío.
* El correo deberá tener un formato válido.
* Mostrar mensajes de error devueltos por el backend.
* Mostrar mensajes de éxito al registrar o actualizar.

---

## Archivos

Permitir:

* Visualizar el logo actual.
* Reemplazar el logo.
* Visualizar el banner actual.
* Reemplazar el banner.

---

## Criterios de aceptación

* Existe una única pantalla de configuración.
* La pantalla determina automáticamente si debe registrar o actualizar la información.
* Se consumen correctamente los endpoints GET, POST y PUT.
* Se muestran las validaciones del backend.
* Logo y banner pueden visualizarse y reemplazarse.
* No existe opción para eliminar la información institucional.

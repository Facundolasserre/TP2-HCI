# Limpiar datos de prueba

Si ya habías probado la aplicación antes y quieres empezar desde cero (sin listas), sigue estos pasos:

## Opción 1: Desde la consola del navegador

1. Abre las DevTools (F12 o Cmd+Option+I en Mac)
2. Ve a la pestaña "Console"
3. Ejecuta este comando:

```javascript
localStorage.removeItem('shopping_lists')
location.reload()
```

## Opción 2: Desde Application/Storage

1. Abre las DevTools (F12)
2. Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
3. En el menú lateral, expande "Local Storage"
4. Haz clic en tu dominio (http://localhost:5174)
5. Busca la key `shopping_lists` y elimínala
6. Recarga la página

## Opción 3: Limpiar todo el localStorage

```javascript
localStorage.clear()
location.reload()
```

⚠️ **Nota:** Esto eliminará todas las listas que hayas creado. Después de esto, la aplicación empezará sin ninguna lista y solo verás las que tú crees manualmente.

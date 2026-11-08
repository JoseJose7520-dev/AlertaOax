# Guía de trabajo con Git y GitHub — AlertaOax

Todos los comandos van en una sola línea. Ejecútalos en la terminal de VS Code dentro de la carpeta del proyecto.

## 1. Primera vez (cada integrante, una sola vez)

1. Configura tu nombre y correo (el mismo correo de tu cuenta de GitHub):
   ```
   git config --global user.name "Tu Nombre" && git config --global user.email "tu-correo@ejemplo.com"
   ```
2. Clona el repositorio:
   ```
   git clone https://github.com/JoseJose7520-dev/AlertaOax.git && cd AlertaOax
   ```
3. Verifica: `git remote -v` debe mostrar `origin https://github.com/JoseJose7520-dev/AlertaOax.git`.

## 2. Ciclo de cada tarea (siempre igual)

Cada tarea del tablero es un issue con número, por ejemplo **#45 AO-103**.

1. **Toma la tarea:** en el tablero muévela a **In progress** y comprueba que estás asignado.
2. **Actualiza tu `main`:**
   ```
   git checkout main && git pull origin main
   ```
3. **Crea tu rama** con el número del issue y una descripción corta:
   ```
   git checkout -b feature/45-registro-usuarios
   ```
   Prefijos: `feature/` funcionalidad nueva, `fix/` corrección, `docs/` documentación, `test/` pruebas.
4. **Programa** y haz commits pequeños:
   ```
   git add . && git commit -m "feat(auth): endpoint POST /api/auth/register con bcrypt"
   ```
   Tipos de commit: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
5. **Sube tu rama:**
   ```
   git push -u origin feature/45-registro-usuarios
   ```
6. **Abre el pull request:** GitHub muestra el botón **Compare & pull request**. Llena la plantilla y en la descripción escribe `Closes #45`. Así el issue se cierra solo al hacer merge y la tarjeta pasa a **Done**.
7. **Pide revisión:** en *Reviewers* elige al otro integrante. Mueve la tarjeta a **In review**.
8. **El revisor** entra a la pestaña **Files changed**, comenta si algo falta y pulsa **Review changes → Approve**.
9. **Merge:** con la aprobación, pulsa **Squash and merge** y luego **Delete branch**.
10. **Limpia tu copia local:**
    ```
    git checkout main && git pull origin main && git branch -d feature/45-registro-usuarios
    ```

## 3. Problemas comunes

| Situación | Solución |
|---|---|
| `main` cambió mientras trabajabas | `git checkout main && git pull origin main && git checkout tu-rama && git merge main` |
| Conflicto al hacer merge | Abre los archivos marcados en VS Code, elige *Accept Current/Incoming/Both*, luego `git add . && git commit -m "fix: resolver conflicto con main"` |
| Te equivocaste en el mensaje del último commit (sin push) | `git commit --amend -m "mensaje correcto"` |
| Hiciste cambios en `main` por error (sin commit) | `git stash && git checkout -b feature/NN-nombre && git stash pop` |
| No te deja hacer push a `main` | Es correcto: `main` está protegida, trabaja en una rama y abre un PR |

## 4. Reglas del equipo

- Nadie hace push directo a `main`; todo entra por pull request con una aprobación.
- Un pull request por tarea; si es muy grande, divide la tarea.
- Nunca subas el archivo `.env` (contraseñas y llave JWT). Usa `.env.example` como referencia.
- Daily Scrum por WhatsApp: qué hice, qué haré, qué me bloquea.
- Al cerrar cada Sprint: revisión (demo) y retrospectiva; se registran en un comentario del milestone o en `docs/`.

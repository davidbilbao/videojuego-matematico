const canvas = document.getElementById("miCanvas");
const context = canvas.getContext("2d");

// Variables del juego
let score = 0;
let lives = 3;
let question = "";
let answer = "";
let correct_answer = 0;
let input_active = true;
let start_ticks = Date.now();  
let game_active = true;  

function new_question() {
    let num1, num2;
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    do {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;

        if (operation === '/') {
            num1 = num1 * num2;  // Hacer que num1 sea un múltiplo de num2
        }
        if (operation === '-') {
            if (num2 > num1) {
                [num1, num2] = [num2, num1];  // Intercambiar num1 y num2
            }
        }
    } while (num1 === num2);  

    // Reemplazamos eval() por una estructura limpia (más seguro y rápido)
    if (operation === '+') correct_answer = num1 + num2;
    if (operation === '-') correct_answer = num1 - num2;
    if (operation === '*') correct_answer = num1 * num2;
    if (operation === '/') correct_answer = num1 / num2;

    question = `${num1} ${operation} ${num2} = ?`;
}

function show_score_screen() {
    game_active = false;  // Cambiamos el estado (ahora draw() sabe que debe dibujar el Game Over)
    input_active = false;  // Desactivar la entrada de teclado
    setTimeout(new_game, 4000);  // Esperar 4 segundos para reiniciar (20 segundos era una eternidad)
}

function new_game() {
    score = 0;
    lives = 3;
    answer = "";
    game_active = true;   // El juego vuelve a estar activo
    input_active = true;  // ¡IMPORTANTE! Reactivamos el teclado
    start_ticks = Date.now();  // Reiniciar el temporizador
    new_question();       // Generar la primera pregunta de la nueva tanda
    // NOTA: Ya no llamamos a game_loop() aquí. El bucle inicial sigue corriendo en segundo plano.
}

function draw() {
    // Limpiar la pantalla por completo en cada fotograma
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (game_active) {
        // --- RENDERIZADO DEL JUEGO ACTIVO ---
        context.fillStyle = "black";
        
        // Puntuación y Vidas (Alineado a la izquierda)
        context.font = "30px sans-serif";
        context.textAlign = "left";
        context.fillText(`Puntuación: ${score}`, 20, 50);
        context.fillText(`Vidas: ${lives}`, 20, 90);

        // Tiempo (Alineado a la derecha del canvas)
        const seconds = Math.floor((Date.now() - start_ticks) / 1000);
        context.textAlign = "right";
        context.fillText(`Tiempo: ${seconds}s`, canvas.width - 20, 50);

        // Pregunta matemática (Centrada)
        context.font = "74px sans-serif";
        context.textAlign = "center";
        context.fillText(question, canvas.width / 2, 200);

        // Respuesta del usuario (Centrada)
        context.font = "36px sans-serif";
        context.fillText(answer, canvas.width / 2, 340);
        
        // Caja de entrada estética alrededor del número
        if (input_active) {
            context.strokeStyle = "green";
            context.lineWidth = 3;
            context.strokeRect(canvas.width / 2 - 100, 340 - 32, 200, 45);
        }
    } else {
        // --- RENDERIZADO DE PANTALLA GAME OVER ---
        context.fillStyle = "black";
        context.textAlign = "center";
        
        context.font = "74px sans-serif";
        context.fillText("Game Over", canvas.width / 2, 200);
        
        context.font = "36px sans-serif";
        context.fillText(`Puntuación final: ${score}`, canvas.width / 2, 290);
        
        context.font = "20px sans-serif";
        context.fillStyle = "gray";
        context.fillText("Preparando nueva partida...", canvas.width / 2, 370);
    }
}

function game_loop() {
    draw();
    requestAnimationFrame(game_loop);  // Un único bucle centralizado que nunca muere
}

function handle_key(event) {
    if (input_active && game_active) {
        if (event.key === "Enter") {
            if (answer !== "") { // Evita enviar respuestas vacías
                if (parseInt(answer) === correct_answer) {
                    score += 1;
                    answer = "";
                    new_question();
                } else {
                    lives -= 1;
                    answer = "";
                    if (lives === 0) {
                        show_score_screen();
                    }
                }
            }
        } else if (event.key === "Backspace") {
            answer = answer.slice(0, -1);
        } else if (/^[0-9-]$/.test(event.key)) {  
            // Filtro Regex: Solo permite números y el signo menos para valores negativos
            if (event.key === "-" && answer.length > 0) return; // El menos solo puede ir al inicio
            answer += event.key;
        }
    }
}

// Eventos e inicialización limpia
document.addEventListener("keydown", handle_key);
new_question();
game_loop();

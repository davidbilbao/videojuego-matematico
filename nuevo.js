const cssEstilos = document.createElement("style");
cssEstilos.textContent = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        background-color: #1a1a1a; 
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 15px;
        overflow: hidden; 
    }
    #miCanvas {
        display: block;
        width: 100%;         
        height: auto;        
        max-width: 800px; /* Límite de escalado en PC */
        max-height: 85vh;    
        background-color: #ffffff;
        border-radius: 16px; 
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); 
        border: 3px solid #333333; 
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges; 
    }
`;
document.head.appendChild(cssEstilos);
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
let final_time = 0; // Almacena el tiempo que duró la partida

// --- LÓGICA RESPONSIVE EN JAVASCRIPT ---
const BASE_WIDTH = 800;
let scale = 1; 

function resizeCanvas() {
    const targetWidth = Math.min(window.innerWidth * 0.95, 800);
    canvas.width = targetWidth;
    canvas.height = targetWidth * 0.625; // Proporción 16:10
    scale = canvas.width / BASE_WIDTH;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Ejecución inicial
// ---------------------------------------

function new_question() {
    let num1, num2;
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    do {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;

        if (operation === '/') num1 = num1 * num2;  
        if (operation === '-') {
            if (num2 > num1) [num1, num2] = [num2, num1];  
        }
    } while (num1 === num2);  

    if (operation === '+') correct_answer = num1 + num2;
    if (operation === '-') correct_answer = num1 - num2;
    if (operation === '*') correct_answer = num1 * num2;
    if (operation === '/') correct_answer = num1 / num2;

    question = `${num1} ${operation} ${num2} = ?`;
}

function show_score_screen() {
    // Guardamos el tiempo exacto en el que perdió para mostrarlo en la pantalla final
    final_time = Math.floor((Date.now() - start_ticks) / 1000);
    game_active = false;  
    input_active = false;  
    setTimeout(new_game, 5000); // 5 segundos de espera antes de reiniciar
}

function new_game() {
    score = 0;
    lives = 3;
    answer = "";
    final_time = 0;
    game_active = true;   
    input_active = true;  
    start_ticks = Date.now();  
    new_question();       
}

function draw() {
    // Fondo del Canvas
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (game_active) {
        // --- RENDER JUEGO ACTIVO ---
        context.fillStyle = "black";
        context.textAlign = "left";
        context.font = `${28 * scale}px sans-serif`;
        
        // Bloque de estadísticas (Alineado a la izquierda, uno abajo del otro)
        context.fillText(`Puntuación: ${score}`, 25 * scale, 45 * scale);
        context.fillText(`Vidas: ${lives}`, 25 * scale, 85 * scale);
        
        const seconds = Math.floor((Date.now() - start_ticks) / 1000);
        context.fillText(`Tiempo: ${seconds}s`, 25 * scale, 125 * scale); // <-- El tiempo ahora está aquí abajo

        // Pregunta matemática (Centrada)
        context.font = `${74 * scale}px sans-serif`;
        context.textAlign = "center";
        context.fillText(question, canvas.width / 2, canvas.height * 0.45);

        // Respuesta del usuario
        context.font = `${38 * scale}px sans-serif`;
        context.fillText(answer, canvas.width / 2, canvas.height * 0.75);
        
        // Caja verde de respuesta
        if (input_active) {
            context.strokeStyle = "green";
            context.lineWidth = 3 * scale;
            const boxWidth = 200 * scale;
            const boxHeight = 55 * scale;
            context.strokeRect(
                (canvas.width / 2) - (boxWidth / 2), 
                (canvas.height * 0.75) - (boxHeight * 0.7), 
                boxWidth, 
                boxHeight
            );
        }
    } else {
        // --- RENDER PANTALLA GAME OVER ---
        context.fillStyle = "black";
        context.textAlign = "center";
        
        context.font = `${74 * scale}px sans-serif`;
        context.fillText("Game Over", canvas.width / 2, canvas.height * 0.35);
        
        context.font = `${36 * scale}px sans-serif`;
        context.fillText(`Puntuación final: ${score}`, canvas.width / 2, canvas.height * 0.52);
        
        // <-- Mostrar el tiempo total aquí al finalizar
        context.fillStyle = "#d9534f"; // Un color rojo/grisáceo suave para el tiempo final
        context.fillText(`Tiempo aguantado: ${final_time}s`, canvas.width / 2, canvas.height * 0.65);
        
        context.font = `${22 * scale}px sans-serif`;
        context.fillStyle = "gray";
        context.fillText("Preparando nueva partida...", canvas.width / 2, canvas.height * 0.8);
    }
}

function game_loop() {
    draw();
    requestAnimationFrame(game_loop);  
}

function handle_key(event) {
    if (input_active && game_active) {
        if (event.key === "Enter") {
            if (answer !== "") { 
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
            if (answer.length >= 5) return; 
            if (event.key === "-" && answer.length > 0) return; 
            answer += event.key;
        }
    }
}

document.addEventListener("keydown", handle_key);
new_question();
game_loop();

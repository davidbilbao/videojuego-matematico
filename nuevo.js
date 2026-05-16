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

// --- LÓGICA RESPONSIVE ---
// Definimos un ancho base sobre el cual diseñamos originalmente (ej. 800px)
const BASE_WIDTH = 800;
let scale = 1; // Factor de escala que se actualizará dinámicamente

function resizeCanvas() {
    // El canvas ocupará el 95% del ancho de la ventana, con un máximo de 800px
    const targetWidth = Math.min(window.innerWidth * 0.95, 800);
    
    // Mantenemos una relación de aspecto fija (proporción 16:10 -> alto = ancho * 0.625)
    canvas.width = targetWidth;
    canvas.height = targetWidth * 0.625;

    // Calculamos cuánto se encogió o agrandó el canvas respecto a la base de 800px
    scale = canvas.width / BASE_WIDTH;
}

// Escuchar el evento de cambiar tamaño de pantalla
window.addEventListener("resize", resizeCanvas);
// Ejecutar al cargar la página por primera vez
resizeCanvas();
// -------------------------

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
    game_active = false;  
    input_active = false;  
    setTimeout(new_game, 4000);  
}

function new_game() {
    score = 0;
    lives = 3;
    answer = "";
    game_active = true;   
    input_active = true;  
    start_ticks = Date.now();  
    new_question();       
}

function draw() {
    // Limpiar pantalla
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (game_active) {
        // --- RENDER JUEGO ACTIVO (Multiplicamos tamaños por la variable 'scale') ---
        context.fillStyle = "black";
        
        // Puntuación y Vidas
        context.font = `${28 * scale}px sans-serif`;
        context.textAlign = "left";
        context.fillText(`Puntuación: ${score}`, 20 * scale, 40 * scale);
        context.fillText(`Vidas: ${lives}`, 20 * scale, 80 * scale);

        // Tiempo (Alineado a la derecha)
        const seconds = Math.floor((Date.now() - start_ticks) / 1000);
        context.textAlign = "right";
        context.fillText(`Tiempo: ${seconds}s`, canvas.width - (20 * scale), 40 * scale);

        // Pregunta matemática (Centrada vertical y horizontalmente usando porcentajes del alto)
        context.font = `${70 * scale}px sans-serif`;
        context.textAlign = "center";
        context.fillText(question, canvas.width / 2, canvas.height * 0.4);

        // Respuesta del usuario
        context.font = `${36 * scale}px sans-serif`;
        context.fillText(answer, canvas.width / 2, canvas.height * 0.7);
        
        // Caja de entrada proporcional
        if (input_active) {
            context.strokeStyle = "green";
            context.lineWidth = 3 * scale;
            
            const boxWidth = 200 * scale;
            const boxHeight = 50 * scale;
            context.strokeRect(
                (canvas.width / 2) - (boxWidth / 2), 
                (canvas.height * 0.7) - (boxHeight * 0.7), 
                boxWidth, 
                boxHeight
            );
        }
    } else {
        // --- RENDER PANTALLA GAME OVER RESPONSIVE ---
        context.fillStyle = "black";
        context.textAlign = "center";
        
        context.font = `${70 * scale}px sans-serif`;
        context.fillText("Game Over", canvas.width / 2, canvas.height * 0.4);
        
        context.font = `${36 * scale}px sans-serif`;
        context.fillText(`Puntuación final: ${score}`, canvas.width / 2, canvas.height * 0.58);
        
        context.font = `${20 * scale}px sans-serif`;
        context.fillStyle = "gray";
        context.fillText("Preparando nueva partida...", canvas.width / 2, canvas.height * 0.75);
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
            if (answer.length >= 5) return; // Limite de dígitos para evitar desborde visual
            if (event.key === "-" && answer.length > 0) return; 
            answer += event.key;
        }
    }
}

document.addEventListener("keydown", handle_key);
new_question();
game_loop();

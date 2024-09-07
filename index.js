// https://blog.toolboxdevops.cloud/node-crud-arquivos-142e3fb1892d
// https://www.w3schools.com/nodejs/ref_readline.asp
// https://developer.mozilla.org/en-US/docs/Web/API/console/table_static
// https://stackoverflow.com/questions/9006988/node-js-on-windows-how-to-clear-console
// https://bobbyhadz.com/blog/javascript-split-string-by-newline
// https://stackoverflow.com/questions/9006988/node-js-on-windows-how-to-clear-console

/* - - - - - - - definições global - - - - - - - - - - */

const events = require('events');
const EventEmitter = require('events');
// const eventEmitter = new EventEmitter();

const eventTrigger = new EventEmitter();
const fileSystem = require('fs');
const readline = require('readline');

const leitor = readline.createInterface(
    {
     input: process.stdin,
     output: process.stdout,
});

/* - - - - - - - - - - eventos em Alerta (listener) - - - - - - - - - */
eventTrigger.on('msg', texto => {
    
    console.log(`${texto}`);
});

eventTrigger.on('exibirResumo', (resumo) => {
    exibirResumo(resumo);
});

eventTrigger.on('recebeuRespostaSim', () => {
    runMainProgram();
});

eventTrigger.on('recebeuRespostaNao', () => {
    processarRespostaNao();
});

eventTrigger.on('recebeuRespostaInvalida', () => {
    processarRespostaInvalida();
});

function killEvents(){
    eventTrigger.removeAllListeners([EventEmitter]); // Remove todos os eventos que estavam no estado Listener
}
 
                            // função de entrada para execução da Aplicação myApp
function runMainProgram() {
    
    myApp();
}

                    /* - - - - - - - - - - função Principal myApp() - - - - - - - - - - */
function myApp() {
    
         // - Solicira entrada doo caminho de um arquivo txt do seu computador;
    leitor.question('\n[Digite o caminho e nome do arquivo [Ex: >C:\idNomeArq.ext]: >> ', (caminho_DoArquivo) => {
       
                                // otimizado trecho -> retira espaços e muda letras para minusculo (LowerCase)
        const caminho_tratado = caminho_DoArquivo.replaceAll(' ', '').toLowerCase().trim();
    
        lerArquivo(caminho_tratado);
    });

    killEvents(); // "mata" eventos em estado Listener

};  // fim da função myApp()
                                      // inicio da função processLineByLine(arquivo)
async function processLineByLine(arquivo) {
	   
    let total_linhas_somente_numeros   = 0;
    let total_somente_numeros_na_linha = 0;
    let total_numeros_e_texto_na_linha = 0;
    let total_linhas_texto             = 0;
         
    let somaTotalLinhas1 = 0;
    let somaTotalLinhas2 = 0;
         
    const numeros1_arquivo = [];
    const numeros2_arquivo = [];

    const msgFimResumo = () => {
        console.log('Arquivo Processado.');
    }
                                 // arquivo = parametro recebido por processLineByLine
    try {
          clearScreen();
          
          const rl = readline.createInterface({
          input: fileSystem.createReadStream(arquivo),
          crlfDelay: Infinity
         });
                                     
         let indice = 0;
         let numLinha = 1;
              
         let pattern1 = /^\d+$/;
         let pattern2 = /\r?\n/;   
         let pattern3 = /[^0-9]/g;
         
         const msg1 = `Processando Leitura do Arquivo ${arquivo} linha por linha com o Módulo readline do Nodejs.`;

                                  // dispara evento msg
         eventTrigger.emit('msg', msg1); 

                                  // Process the line.
         rl.on('line', (line) => {
             const linhas_do_arquivo = line.split((pattern2));
                                                                // verifica se a string possui somente numero
             if ((pattern1.test(line))) {
                    total_linhas_somente_numeros++;
                    total_somente_numeros_na_linha += Number(linhas_do_arquivo[indice]);
                                 
                    numeros1_arquivo[indice] = Number(line);
                    somaTotalLinhas1 = numeros1_arquivo[indice] + somaTotalLinhas1;
                }
                 
                                                          // verifica se a string NÃO possui somente numero
             if (!(pattern1.test(line))) {
                    numeros2_arquivo[indice] = line.replace((pattern3), '');
                    somaTotalLinhas2 = Number(numeros2_arquivo[indice]) + somaTotalLinhas2;
                                        
                    total_linhas_texto++;                        
                }
             // console.log(`Line from file: ${line}`);                   
             indice++;
             numLinha++;
            });
                                              // Aguarde processamento acima até que o Arquivo chegue ao final!
            await events.once(rl, 'close');
              
            total_numeros_e_texto_na_linha = somaTotalLinhas1 + somaTotalLinhas2;
            
        } catch (err) {
             console.log(`-> ATENÇÃO: Erro!!!!, arquivo ${arquivo} não encontrado! \n \n > ${err}\n`);
             return;
            }
          
                              // otimizado trecho para apresentação do Resumo
        const resumo = {
              total_linhas_somente_numeros,
              somaTotalLinhas1,
              total_linhas_texto,
              total_numeros_e_texto_na_linha, 
              arquivo,       
            };
                                          // dispara evento exibirResumo com parametros resumo acima 
        eventTrigger.emit('exibirResumo',resumo);
        msgFimResumo();

        console.timeEnd('\n-> Quanto tempo demorou a execução');

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`\nThe script uses approximately ${Math.round(used * 100) / 100} MB`);
        
                                            // - Pergunte se deseja executar novamente.
        solicitarPerguntaNovaExecucao();

}; // fim da função processLineByLine(arquivo)
    
async function lerArquivo(arquivoTratado) {
        await fileSystem.readFile(arquivoTratado, 'utf8', (erro, dados) => {
            if (erro) {
                console.log(`-> ATENÇÃO: Erro!!!!, arquivo ${arquivoTratado} não encontrado!`);
                leitor.close();
               
                return;
             }
                                                  // dispara - Quanto tempo demorou a execução;
             console.time('\n-> Quanto tempo demorou a execução');
                                                // Chama função para Processar Linha a Linha do Arquivo informado
             processLineByLine(arquivoTratado);
            });
};

function exibirResumo(resumo) {
    const msg2 = `\n-> Resumo do arquivo ${resumo.arquivo}`;

    eventTrigger.emit('msg', msg2);
    
    console.table([
        ['Quantas linhas possuem somente números', resumo.total_linhas_somente_numeros],
        ['Soma dos números destas linhas', resumo.somaTotalLinhas1],
        ['Quantas linhas possuem texto', resumo.total_linhas_texto],
        ['Soma dos números dentro deste arquivo', resumo.total_numeros_e_texto_na_linha],
        ['Quantas linhas continham o arquivo', resumo.total_linhas_somente_numeros + resumo.total_linhas_texto],
    ]);
}

function solicitarPerguntaNovaExecucao() {
    leitor.question('\nQuer executar novamente [S/N]? ', (resposta) => {

        // otimizado trecho
        const resposta_tratada = resposta.replaceAll(' ', '').toUpperCase().trim();

        if (resposta_tratada === 'S' || resposta_tratada === 'SIM') {
            clearScreen();
            eventTrigger.emit('recebeuRespostaSim');
           }
        else if (resposta_tratada === 'N' || resposta_tratada === 'NAO' || resposta_tratada === 'NÃO') {
            eventTrigger.emit('recebeuRespostaNao');
           }
        else {
            eventTrigger.emit('recebeuRespostaInvalida');
           }
    });
};

function processarRespostaNao() {
        
    console.log('Programa finalizado!');
    leitor.close();
}

function processarRespostaInvalida() {
        
    console.log('Responda somente [S/N]');
    solicitarPerguntaNovaExecucao();
}
                        // função Limpa Tela 
function clearScreen(){
    require('child_process').execSync('cls', {stdio: 'inherit'});
} 

/* - - - - - - - - - - programa principal - - - - - - - - - - */
runMainProgram();
// Função de cada comentário
// todo-Pendentes e Funções
//!-Importantes/Critico
//?-Dúvidas/Questões
//*-Explicação
////////////////////

// todo-Função ligada ao primeiro botão, que permite gerar um arquivo PDF
function GerarPDF() {
    var nome = document.getElementById('nome');
    var sintomas = document.getElementById('sintomas');
    var prev = document.getElementById('previa');
    var pdf = document.querySelector('.pdf');
    var dataAtual = new Date(); //!-Variável para manipular data
    var mes = dataAtual.getMonth() + 1; //!-Variável para pegar o mês (em número)
    //* Conversão do mês
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    mes = meses[mes - 1] || "Mês inválido";

    //* Criação das variáveis "data", "hora" e "respostaPDF"
    var data = `dia ${dataAtual.getDate()} de ${mes} do ano de ${dataAtual.getFullYear()}`;
    var hora = dataAtual.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    var respostaPDF = `O Sr(a) ${nome.value}, consultado no ${data} às ${hora}, que apresenta os seguinte(s) sintoma(s): "${sintomas.value}". ${prev.value}`;

    //* Acessando a função jsPDF do pacote
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    //* Adicionando conteúdo ao PDF
    doc.text("Relatório médico", 10, 10);
    const larguraMaxima = 180;
    const linhas = doc.splitTextToSize(respostaPDF, larguraMaxima);
    let margemSuperior = 20; //! Posição inicial no eixo Y
    const espacamentoEntreLinhas = 10; //! Espaçamento

    //* Adiciona texto ao PDF (quebra em várias linhas)
    linhas.forEach((linha) => {
        if (margemSuperior > 280) { //! Adiciona nova página se ultrapassar o limite
            doc.addPage();
            margemSuperior = 20;
        }
        doc.text(linha, 10, margemSuperior);
        margemSuperior += espacamentoEntreLinhas;
    });

    //* Gera e salva o arquivo
    doc.save("Relatório.pdf");
}

// todo-Chave e Endpoint da API OpenAI
const apiKey = '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'; //! Atualize com a chave correta
const endpoint = 'https://api.openai.com/v1/chat/completions';

// todo-Função que monta o corpo da requisição para a API
function requestBody(text) {
    return {
        "model": "gpt-4",
        "messages": [
            {
                "role": "user",
                "content": `Considerando os sintomas apresentados, crie uma tabela com o nome das 3 possíveis doenças e suas porcentagens de probabilidade do paciente ter aquela doença: ${text}. Caso seja digitado algo fora do contexto médico, retorne a seguinte mensagem: "Nós só podemos conversar sobre sintomas e diagnosticos.`
            }
        ]
    };
}

// todo-Função ligada ao segundo botão, que chama a API e libera o botão PDF
async function chamarOpenAIAPI() {
    var sint = document.getElementById('sintomas').value;
    var prev = document.getElementById('previa');
    var nome = document.getElementById('nome').value;
    var pdf = document.querySelector('.pdf');
    var consulta = document.querySelector('.consulta');

    //! Validação de campos obrigatórios
    if (nome !== '' && sint !== '') {
        prev.innerHTML = 'CARREGANDO...';
        consulta.innerHTML = `<img class="icon loader" src="img/icon_loading.png" alt="">Loading...`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody(sint))
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Resposta da API OpenAI:', data);
            prev.innerHTML = data.choices[0].message.content; //! Caminho ajustado para OpenAI
            consulta.innerHTML = `<img class="icon" src="icon_consulta.png" alt="">Consultar`;

            //* Configuração do botão PDF
            pdf.style.backgroundColor = "red";
            pdf.innerHTML = `<img class="icon" src="img/icon_pdf.png" alt=""> Gerar PDF`;
            pdf.style.cursor = "pointer";
            pdf.removeAttribute("disabled");
        } catch (error) {
            window.alert('Erro ao chamar a API OpenAI');
            console.error('Erro ao chamar a API OpenAI:', error);
        }
    } else {
        window.alert('[ALERTA] Preencha os dados primeiro!');
    }
}

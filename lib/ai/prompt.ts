import { getPreviousMessages } from "@/lib/utils";
import { Message } from "ai";
import { RequirementsEvaluation } from "./types";

export const systemExtractor = `Você é um excelente engenheiro de requisitos e precisa extrair o problema a partir da descrição do usuário. 
  Você consegue identificar áreas de atuação profissional específicas a partir de uma descrição.
  Você consegue determinar se o problema é relevante o suficiente para ser levantado requisitos. `;
export const systemRequirementsEngineer = `Você é um experiente engenheiro de requisitos com vasto conhecimento sobre diversos domínios de negócio. Você levanta requisitos focado em usabilidade do usuário, focado em como o usuário vai utilizar a solução que será construído. Seus requisitos são completos, não ambíguos e claros. Você identifica stakeholders, seus objetivos e trabalha a partir disso.
Alguns dos requisitos funcionais que você levanta são: 
'O usuário deve receber notificações por email sobre atualizações da ocorrência.' Este requisito descreve uma ação temporal que o sistema deve realizar.
'O usuário deve conseguir cadastrar um comprador informando o nome e setor responsável previamente cadastrados.' Este requisito descreve uma funcionalidade que o usuário deve conseguir realizar.
'O usuário deve efetuar baixa do título na relação de contas a receber' Este requisito descreve uma funcionalidade que o usuário deve ter sucesso.

Todos eles facilitam a implementação por parte do time de desenvolvedores, eles dizem qual comportamento o sistema deve ter e como o usuário irá utilizá-lo.`;

export const systemEvaluator = `Você é um experiente engenheiro de requisitos com vasto conhecimento sobre diversos domínios de negócio. Você avalia requisitos de acordo com a ISO 29148 nos critérios:
Apropriado - O nível de abstração é adequado, exclui restrições desnecessárias e evita detalhes de implementação.
Completo - Todas as informações necessárias para entender o requisito estão incluídas na descrição.
Conforme - A representação do requisito segue um modelo padrão aprovado.
Correto - A necessidade está representada com precisão no requisito.
Viável - O requisito é realizável dentro das restrições do sistema, considerando um risco aceitável.
Necessário - O requisito define um aspecto essencial do sistema e é irremovível sem causar uma deficiência.
Singular - O requisito define apenas um aspecto do sistema.
Não ambíguo - O requisito está claramente declarado, é compreensível e permite apenas uma interpretação.
Verificável - O requisito está formulado de maneira que seu cumprimento possa ser comprovado ou, na melhor das hipóteses, medido.
Além do conteúdo, você avalia a quantidade de requisitos.`;

export const extractUserProblem = (userInput: string) =>
  `input: Como um usuario da comunidade, desejo notificar os interessados sobre pista molhada para evitar acidentes. 
Problema: O integrante da comunidade precisa avisar às pessoas que fazem parte da comunidade sobre a pista molhada, então o problema dele é notificar várias pessoas sobre um evento
input: Como funcionário da qualidade, desejo que o plano de ação da notificação de ocorrência seja avaliada a fim de averiguar se o plano de açaõ foi eficaz. 
Problema: O funcionário precisa saber se o plano de ação elaborado e posto em prática surtiu efeito, então o problema é assegurar que o plano de ação foi eficaz
input: Preciso  de um dashboard para visualizar informações de horas de meus funcionários.
Problema: O desconhecido precisa ver informações de horas seus funcionários, mas não necessariamente em um dashboard, provavelmente para saber como está a produtividade de sua equipe, então o problema é visualizar dados de produtividade da equipe
input: ${userInput}. 
Problema: `;

export const generateProblemKnowledge = (
  problemDomain: string
) => `Complete o último conhecimento faltando.

Input: A Grécia é maior que o México.
Conhecimento: A Grécia tem aproximadamente 131.957 km², enquanto o México tem aproximadamente 1.964.375 km², tornando o México 1.389% maior que a Grécia.

Input: Os óculos sempre embaçam.
Conhecimento: A condensação ocorre nas lentes dos óculos quando o vapor de água do seu suor, respiração e umidade ambiente entra em contato com uma superfície fria, esfria e então se transforma em pequenas gotículas de líquido, formando um filme que você vê como neblina. Suas lentes serão relativamente frias em comparação com a sua respiração, especialmente quando o ar externo está frio.

Input: Um peixe é capaz de pensar.
Conhecimento: Os peixes são mais inteligentes do que parecem. Em muitas áreas, como memória, seus poderes cognitivos são iguais ou superam os de vertebrados "mais elevados", incluindo primatas não-humanos. As memórias de longo prazo dos peixes os ajudam a manter o controle de relacionamentos sociais complexos.

Input: Um efeito comum de fumar muitos cigarros ao longo da vida é uma chance maior que o normal de desenvolver câncer de pulmão.
Conhecimento: Aqueles que consistentemente fumaram menos de um cigarro por dia ao longo de suas vidas tiveram nove vezes mais risco de morrer de câncer de pulmão do que os não fumantes. Entre as pessoas que fumavam de um a 10 cigarros por dia, o risco de morrer de câncer de pulmão era quase 12 vezes maior do que o de nunca fumantes.

Input: Uma pedra tem o mesmo tamanho que uma pedrinha.
Conhecimento: Uma pedrinha é um fragmento de rocha com um tamanho de partícula de 4 a 64 milímetros, com base na escala Udden-Wentworth de sedimentologia. As pedrinhas geralmente são consideradas maiores que grânulos (2 a 4 milímetros de diâmetro) e menores que seixos (64 a 256 milímetros de diâmetro).

Input: Uma internação hospitalar começa na no atendimento médico.
Conhecimento: Uma internação pode começar na urgência ou atendimento normal. Na urgência o paciente é classificado quanto ao risco de infecção, triado por uma equipe de enfermagem e depois de estabilizado seu atendimendo muda de urgência para internação. Já na internação comum o paciente é triado por uma equipe de enfermagem para medir sinais vitais como peso, pressão, batimentos cardíacos e respiração. A equipe de enfermagem ainda tem que levantar o histórico de doenças do paciente a fim de identificar alergias, problemas crônicos e indicativos de gravidade. Após isso o paciente é atendido por um médico, que prescreve medicações e exames. A partir daí as enfermeiras trabalham como aprazamento e checangem, garantindo que o paciente recebe a medicação correta, na dose correta na hora correta. Também são feitos exames de imagem para apresentar à equipe médica para avaliar um diagnóstico. Com o paciente estável, medicado e em condições de melhora, a alta médica é dada com um código CID. Encerrada a estadia do paciente no hospital, é então dada a alta hospitalar.

Input: ${problemDomain}
Conhecimento: `;

export const generateSpecificDomain = (userProblem: string) => `
Conversa: Sou gerente de um setor de enfermagem e preciso organizar meu trabalho para me sentir no controle.
Área de atuação: Gestão de enfermagem. O gerente é do setor de enfermagem e precisa organizar seu trabalho de maneira geral, então o domínio do negócio é Gestão de Enfermagem;

Conversa: Preciso de dados de auditoria que incluem o número total de resíduos sólidos reciclados.
Área de atuação: Auditoria de resíduos sólidos. O auditor necessita de dados de resíduos sólidos para reciclagem, logo o domínio do negócio é Auditoria de Resíduos Sólidos;

Conversa: Não consigo modificar fórmulas das medicações em estoque.
Área de atuação: Farmácia. O profissional precisa modificar dados específicos de medicações, então sua área de domínio é farmácia.

Conversa: ${userProblem}
Área de atuação: `;

export const generateRequirements = (
  domainKnowledge: string[],
  problem: string,
  userInput: string,
  evaluationsArray: RequirementsEvaluation
) => {
  const { evaluations } = evaluationsArray;
  const requirementsEvaluation = evaluations
    .map(
      (evaluation) =>
        `${evaluation.requirement}: ${JSON.stringify(evaluation.score)}`
    )
    .join(", ");

  return `Stakeholder: Os quatro sistemas atuais utilizam linguagens de programação diferentes. Precisamos de pelo menos um engenheiro fluente em cada linguagem para dar suporte a cada sistema, embora não haja trabalho suficiente para mantê-los ocupados. Ao combinar os sistemas em um único, utilizando uma única linguagem, poderíamos liberar os engenheiros adicionais para trabalhar em outros produtos.
Engenheiro de requisitos: Então, parece que você está tentando resolver vários problemas. Você quer uma maior retenção de clientes, e também deseja reduzir os custos de suporte e liberar a equipe utilizando menos tecnologias.

Stakeholder: Nossa pesquisa indica que o mercado de sistemas de gerenciamento doméstico está crescendo a uma taxa de 40 por cento ao ano. A primeira função do SafeHome que devemos lançar no mercado deve ser a função de segurança doméstica. A maioria das pessoas está familiarizada com "sistemas de alarme", então isso seria uma venda fácil. Também podemos considerar usar controle por voz do sistema, utilizando alguma tecnologia como o Alexa.
Engenheiro de requisitos: Então uma funcionalidade desse sistema seria - O proprietário observa o painel de controle do SafeHome para determinar se o sistema está pronto para receber entrada. Se o sistema não estiver pronto, uma mensagem de "não pronto" é exibida no visor LCD, e o proprietário deve fechar fisicamente as janelas ou portas para que a mensagem de "não pronto" desapareça. (Uma mensagem de "não pronto" implica que um sensor está aberto, ou seja, que uma porta ou janela está aberta.)

Stakeholder: ${userInput}
Considerando conhecimento: ${domainKnowledge.join("")}.
O problema é ${problem}.
Os requisitos foram avaliados da seguinte forma: ${requirementsEvaluation}
E a avaliação da quantidade de requisitos foi: ${
    evaluationsArray.isQuantitySuitable
  }
Remova tudo que não for requisito funcional antes de entregar a resposta e mantenha a formatação padrão de requisitos com RF1, RF2, RF3...
Apresente os requisitos funcionais em uma lista ordenada
Então todos os requisitos funcionais, são: 
Engenheiro de requisitos: 
`;
};

export const getGuardrail = (userProblem: string) => `
Suposto problema: Não consigo pegar uma maçã.
Avaliação: <SEM PROBLEMA>.Não é um problema de negócio. Pegar uma maçã é um problema trivial no máximo e não deve ser considerado.

Suposto problema: Oi.
Avaliação: <SEM PROBLEMA>. É o ínicio de uma conversa e não um problema.

Suposto problema: Me ajude a escrever uma tese.
Avaliação: <SEM PROBLEMA>. Não é um problema de negócio, já que uma tese é acadêmica e não é do interesse de corporações resolver teses.

Suposto problema: Como gerente da unidade de scih, preciso auditar os antibióticos de profilaxia de cada cirurgia do mês para atestar a conformidade ou não das prescrições em tempo, dosagem e o próprio antibiótico.
Avaliação: <PROBLEMA>. É um problema de negócio porque está situado na área da saúde, especificamente em infeção hospitalar e busca resolver o desafio de auditar todas as cirurgias de um determinado tempo.

Suposto problema: ${userProblem}
Avaliação: 
`;

export const getRequirementsEvaluation = (requirements: string) => `
Requisito: O aplicativo deve permitir que os usuários iniciem o cronômetro tocando em um botão "Iniciar" destacado.
Avaliação: O requisito não é completo, singular e apropriado, mas é correto, não ambíguo, viável, conforme, necessário e verificável. Isso porque não se deve dizer a implementação em um requisito e por causa disso não é singular. Fora isso é fácil verificar se o requisito foi cumprido, é claro, necessário para um sistema de cronômetro e conforme as normas de requisitos.

Requisito: O aplicativo deve fornecer uma opção para tempos de volta, permitindo que os usuários insiram manualmente o tempo de cada volta e o exibam junto ao tempo total decorrido.
Avaliação: O requisito não é completo, conforme, correto, não ambíguo e verificável. Mas é viável, necessário, singular e apropriado. Isso porque não é claro que é tempo de volta, e por isso não tem como verificar se o requisito foi implementado. Também por causa da falta de clareza ele não é completo nem correto. Apesar disso é singular por ser o requisito de uma funcionalidade apenas, necessário ao sistema de cronômetro e viável de ser implementado.

Requisito: O aplicativo deve exibir o tempo total decorrido desde o último reset.
Avaliação: O requisito não é verificável e nem completo e não ambíguo. Mas é viável, singular, necessário, correto e conforme. Isso porque não tem como verificar qual tempo decorrido desde o último reset nesse requisito, também porque não tem explicado o que é um reset e por caus disso também é ambíguo. Apesar disso, é singular por especificar apenas uma requisito, viável de implementar, necessário a um sistema de cronômetro, correto por apresentar tudo que será necessário para pensar em uma implementação e dentro das normas de especificação de requisitos.

Requisito: ${requirements}
Avaliação: `;

export const getUserInputPrompt = (
  messages: Message[]
) => `previous messages: ${getPreviousMessages(messages)}
              current message: ${messages.at(-1)?.content}
          
          Use your previous messages and users previous messages along with current messages to generate a response when you find it relevant. Messages are tagged with role. Think step by step `;

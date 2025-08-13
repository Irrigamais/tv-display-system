# Sistema de Exibição para TV LCD

## Descrição
Sistema web para exibição de informações de pedidos, ordens de serviço e ordens de fabricação em TV LCD, com rotação automática dos cards quando há mais itens do que cabem na tela.

## Características
- **Layout Responsivo**: Adapta-se automaticamente ao tamanho da tela
- **Rotação Automática**: Cards alternam a cada 8 segundos quando há mais de uma página
- **Indicadores Visuais**: Cores diferentes baseadas no status (verde=no prazo, amarelo=próximo do prazo, vermelho=atrasado)
- **Data/Hora**: Exibição em tempo real no cabeçalho
- **Barra de Progresso**: Indica a página atual e progresso da rotação

## Estrutura dos Arquivos
```
tv-display-system/
├── index.html      # Página principal
├── styles.css      # Estilos e layout
├── script.js       # Lógica JavaScript
└── README.md       # Esta documentação
```

## Como Usar

### 1. Configuração Básica
1. Conecte o computador à TV LCD via HDMI
2. Abra um navegador web (Chrome, Firefox, Edge)
3. Navegue até o arquivo `index.html` ou abra diretamente

### 2. Personalização dos Dados
Edite o arquivo `script.js` e modifique o array `sampleData` com seus dados reais:

```javascript
const sampleData = [
    {
        id: 1,
        tipo: "Pedido", // ou "Ordem de Serviço" ou "Ordem de Fabricação"
        numero: "PED-2024-001",
        cliente: "Nome do Cliente",
        previsao_entrega: "2024-01-15", // formato YYYY-MM-DD
        dias_atraso: 3, // número de dias (0 = no prazo)
        status: "atrasado" // "no-prazo", "proximo-prazo", "atrasado"
    }
    // ... mais itens
];
```

### 3. Configurações Avançadas

#### Ajustar Tempo de Rotação
No arquivo `script.js`, linha 85:
```javascript
this.autoRotateInterval = 8000; // 8 segundos (8000ms)
```

#### Ajustar Número de Cards por Página
No arquivo `script.js`, método `adjustCardsPerPage()`:
```javascript
if (width >= 1920) {
    this.cardsPerPage = 8; // TVs 4K
} else if (width >= 1366) {
    this.cardsPerPage = 6; // TVs HD
} else {
    this.cardsPerPage = 4; // Telas menores
}
```

## Controles de Teclado
- **Seta Direita** ou **Espaço**: Avança para próxima página manualmente
- A rotação automática pausa por 5 segundos após controle manual

## Resolução Recomendada
- **1920x1080 (Full HD)**: 8 cards por página
- **1366x768 (HD)**: 6 cards por página  
- **1024x768 ou menor**: 4 cards por página

## Status dos Cards
- **Verde**: No prazo
- **Amarelo**: Próximo do prazo (1-2 dias restantes)
- **Vermelho**: Atrasado (3+ dias)

## Integração com Sistemas Externos
Para integrar com seu sistema de gestão, substitua o array `sampleData` por uma chamada AJAX/fetch para sua API:

```javascript
// Exemplo de integração
async function loadData() {
    try {
        const response = await fetch('/api/pedidos');
        const data = await response.json();
        window.tvSystem.updateData(data);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Atualizar dados a cada 5 minutos
setInterval(loadData, 300000);
```

## Solução de Problemas

### Cards não aparecem
- Verifique se o JavaScript está habilitado no navegador
- Abra o console do navegador (F12) para ver erros

### Layout quebrado
- Verifique a resolução da TV
- Teste em modo tela cheia (F11)

### Rotação não funciona
- Verifique se há mais de uma página de dados
- Confirme que não há erros no console

## Suporte
Para dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Compatibilidade do navegador
3. Configuração da resolução da TV


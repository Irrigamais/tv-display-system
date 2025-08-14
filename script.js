// Dados de exemplo - substitua por dados reais
const sampleData = [
    {
        id: 1,
        tipo: "Pedido",
        numero: "PED-2024-001",
        cliente: "Cliente ABC Ltda",
        data_abertura: "2024-01-10",
        previsao_entrega: "2024-01-15"
    },
    {
        id: 2,
        tipo: "Ordem de Serviço",
        numero: "OS-2024-045",
        cliente: "Cliente XYZ Corp",
        data_abertura: "2025-08-10",
        previsao_entrega: "2025-08-15"
    },
    {
        id: 3,
        tipo: "Ordem de Fabricação",
        numero: "OF-2024-012",
        cliente: "Produto 123",
        data_abertura: "2025-08-09",
        previsao_entrega: "2025-08-14"
    },
    {
        id: 4,
        tipo: "Pedido",
        numero: "PED-2024-002",
        cliente: "Cliente DEF S.A.",
        data_abertura: "2025-08-08",
        previsao_entrega: "2025-08-13"
    },
    {
        id: 5,
        tipo: "Ordem de Serviço",
        numero: "OS-2024-046",
        cliente: "Cliente GHI Ltda",
        data_abertura: "2024-01-20",
        previsao_entrega: "2024-01-25"
    },
    {
        id: 6,
        tipo: "Ordem de Fabricação",
        numero: "OF-2024-013",
        cliente: "Produto 456",
        data_abertura: "2025-08-11",
        previsao_entrega: "2025-08-16"
    },
    {
        id: 7,
        tipo: "Pedido",
        numero: "PED-2024-003",
        cliente: "Cliente JKL Corp",
        data_abertura: "2025-08-12",
        previsao_entrega: "2025-08-17"
    },
    {
        id: 8,
        tipo: "Ordem de Serviço",
        numero: "OS-2024-047",
        cliente: "Cliente MNO S.A.",
        data_abertura: "2025-08-13",
        previsao_entrega: "2025-08-18"
    },
    {
        id: 9,
        tipo: "Ordem de Fabricação",
        numero: "OF-2024-014",
        cliente: "Produto 789",
        data_abertura: "2024-01-30",
        previsao_entrega: "2024-02-05"
    },
    {
        id: 10,
        tipo: "Pedido",
        numero: "PED-2024-004",
        cliente: "Cliente PQR Ltda",
        data_abertura: "2025-08-14",
        previsao_entrega: "2025-08-19"
    }
];

// Array para armazenar cards ocultos
let hiddenCards = [];

// Funções para persistência de dados
function saveDataToLocalStorage() {
    localStorage.setItem('tvDisplayCards', JSON.stringify(sampleData));
    localStorage.setItem('tvDisplayHiddenCards', JSON.stringify(hiddenCards));
}

function loadDataFromLocalStorage() {
    const savedCards = localStorage.getItem('tvDisplayCards');
    const savedHiddenCards = localStorage.getItem('tvDisplayHiddenCards');
    
    if (savedCards) {
        sampleData.length = 0; // Limpar array existente
        sampleData.push(...JSON.parse(savedCards));
    }
    
    if (savedHiddenCards) {
        hiddenCards.length = 0; // Limpar array existente
        hiddenCards.push(...JSON.parse(savedHiddenCards));
    }
}

class TVDisplaySystem {
    constructor() {
        // Carregar dados salvos do localStorage
        loadDataFromLocalStorage();
        
        this.data = this.processData(sampleData);
        this.cardsPerPage = 6; // Padrão: 6 cards por página
        this.currentPage = 0;
        this.totalPages = Math.ceil(this.data.length / this.cardsPerPage);
        this.autoRotateInterval = 15000; // 15 segundos por página (aumentado de 8)
        this.rotationTimer = null;
        
        this.init();
    }
    
    init() {
        this.updateDateTime();
        this.renderCards();
        this.startAutoRotation();
        
        // Atualizar data/hora a cada minuto e reprocessar dados
        setInterval(() => {
            this.updateDateTime();
            this.data = this.processData(sampleData); // Reprocessa os dados para atualizar status e atraso
            this.renderCards();
        }, 60000);
        
        // Detectar tamanho da tela e ajustar cards por página
        this.adjustCardsPerPage();
        window.addEventListener("resize", () => this.adjustCardsPerPage());
    }
    
    updateDateTime() {
        const now = new Date();
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        };
        
        document.getElementById("datetime").textContent =
            now.toLocaleDateString("pt-BR", options);
    }
    
    processData(rawData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return rawData.map(item => {
            // Se não há previsão de entrega (Solicitação de Compra), usar status padrão
            if (!item.previsao_entrega) {
                return {
                    ...item,
                    status: "no-prazo",
                    dias_atraso: 0
                };
            }
            
            const previsaoDate = new Date(item.previsao_entrega);
            previsaoDate.setHours(0, 0, 0, 0);

            const diffTime = previsaoDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status;
            let dias_atraso;

            if (diffDays < 0) {
                status = "atrasado";
                dias_atraso = Math.abs(diffDays);
            } else if (diffDays === 0) {
                status = "no-prazo";
                dias_atraso = 0;
            } else if (diffDays <= 2) { // Próximo do prazo: 1 ou 2 dias restantes
                status = "proximo-prazo";
                dias_atraso = diffDays;
            } else {
                status = "no-prazo";
                dias_atraso = 0;
            }

            return { ...item, dias_atraso, status };
        });
    }
    
    adjustCardsPerPage() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Ajustar baseado na resolução
        if (width >= 1920) {
            this.cardsPerPage = 8;
        } else if (width >= 1366) {
            this.cardsPerPage = 6;
        } else {
            this.cardsPerPage = 4;
        }
        
        this.totalPages = Math.ceil(this.data.length / this.cardsPerPage);
        this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
        this.renderCards();
    }
    
    createCard(item) {
        const card = document.createElement("div");
        card.className = `card ${item.status}`;
        card.setAttribute('data-card-id', item.id);
        
        const delayText = this.getDelayText(item.dias_atraso, item.status);
        const formattedDate = item.previsao_entrega ? this.formatDate(item.previsao_entrega) : 'Não definida';
        const formattedOpeningDate = this.formatDate(item.data_abertura);
        
        // Botão de ocultar para todos os cards
        const hideButton = `<button class="hide-card-btn" onclick="window.tvSystem.hideCard(${item.id})" title="Ocultar card atendido">
                ✓
            </button>`;
            
        // Botão de editar data apenas para Solicitação de Compra
        const editButton = item.tipo === 'Solicitação de Compra' ? 
            `<button class="edit-date-btn" onclick="window.tvSystem.editDeliveryDate(${item.id})" title="Editar previsão de entrega">
                📅
            </button>` : '';
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-type">${item.tipo}</span>
                <div class="card-actions">
                    ${editButton}
                    ${hideButton}
                </div>
            </div>
            <div class="card-number">${item.numero}</div>
            <div class="card-body">
                <div class="card-info">
                    <span class="info-label">Cliente/Produto:</span>
                    <span class="info-value">${item.cliente}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Data de Abertura:</span>
                    <span class="info-value">${formattedOpeningDate}</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="delivery-date">
                    <div class="info-label">Previsão de Entrega</div>
                    <div class="info-value">${formattedDate}</div>
                </div>
                <div class="delay-info ${item.status}">
                    ${delayText}
                </div>
            </div>
        `;
        
        return card;
    }
    
    getDelayText(dias, status) {
        if (status === "no-prazo") {
            return "No Prazo";
        } else if (status === "proximo-prazo") {
            return `${dias} dia${dias > 1 ? "s" : ""} restante${dias > 1 ? "s" : ""}`;
        } else {
            return `${dias} dia${dias > 1 ? "s" : ""} de atraso`;
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    
    renderCards() {
        const container = document.getElementById("cardsContainer");
        const startIndex = this.currentPage * this.cardsPerPage;
        const endIndex = Math.min(startIndex + this.cardsPerPage, this.data.length);
        const pageData = this.data.slice(startIndex, endIndex);
        
        // Animação de saída
        const existingCards = container.querySelectorAll(".card");
        existingCards.forEach(card => {
            card.classList.add("card-exit");
        });
        
        setTimeout(() => {
            container.innerHTML = "";
            
            pageData.forEach((item, index) => {
                const card = this.createCard(item);
                card.style.animationDelay = `${index * 0.1}s`;
                container.appendChild(card);
            });
            
            this.updatePagination();
        }, 300);
    }
    
    updatePagination() {
        const pageInfo = document.getElementById("pageInfo");
        const progressFill = document.getElementById("progressFill");
        
        pageInfo.textContent = `Página ${this.currentPage + 1} de ${this.totalPages}`;
        
        // Atualizar barra de progresso
        const progress = ((this.currentPage + 1) / this.totalPages) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    nextPage() {
        this.currentPage = (this.currentPage + 1) % this.totalPages;
        this.renderCards();
    }
    
    startAutoRotation() {
        if (this.totalPages > 1) {
            this.rotationTimer = setInterval(() => {
                this.nextPage();
            }, this.autoRotateInterval);
        }
    }
    
    stopAutoRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
    }
    
    // Método para atualizar dados externamente
    updateData(newData) {
        this.data = this.processData(newData);
        this.totalPages = Math.ceil(this.data.length / this.cardsPerPage);
        this.currentPage = 0;
        this.renderCards();
        
        // Reiniciar rotação se necessário
        this.stopAutoRotation();
        this.startAutoRotation();
    }
}

// Inicializar o sistema quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    window.tvSystem = new TVDisplaySystem();
});

// Controles de teclado (opcional)
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " ") {
        window.tvSystem.stopAutoRotation();
        window.tvSystem.nextPage();
        setTimeout(() => window.tvSystem.startAutoRotation(), 5000);
    }
});




// Classe para gerenciar o modal
class ModalManager {
    constructor(tvSystem) {
        this.tvSystem = tvSystem;
        this.modal = document.getElementById('modalOverlay');
        this.form = document.getElementById('addCardForm');
        this.addBtn = document.getElementById('addCardBtn');
        this.closeBtn = document.getElementById('closeModalBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.addBtn.addEventListener('click', () => this.openModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Event listener para mudança de tipo (prefixo automático)
        document.getElementById('cardTipo').addEventListener('change', (e) => {
            this.updateNumberPrefix(e.target.value);
        });
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('cardTipo').focus();
        }, 300);
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'hidden'; // Manter overflow hidden para TV
        this.form.reset();
        
        // Resetar campo número
        const numeroField = document.getElementById('cardNumero');
        numeroField.readOnly = false;
        numeroField.value = '';
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const newCard = {
            id: Date.now(), // ID único baseado no timestamp
            tipo: document.getElementById('cardTipo').value,
            numero: document.getElementById('cardNumero').value,
            cliente: document.getElementById('cardCliente').value,
            data_abertura: this.parseDateToISO(document.getElementById("cardDataAbertura").value),
            previsao_entrega: this.parseDateToISO(document.getElementById("cardPrevisao").value)
        };
        
        // Validar dados
        if (!this.validateCard(newCard)) {
            return;
        }
        
        // Adicionar card ao sistema
        this.tvSystem.addCard(newCard);
        
        // Fechar modal
        this.closeModal();
        
        // Mostrar feedback (opcional)
        this.showSuccessMessage();
    }
    
    validateCard(card) {
        // Validação básica para todos os tipos
        if (!card.tipo || !card.numero || !card.cliente || !card.data_abertura) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }
        
        // Previsão de entrega é obrigatória para todos os tipos exceto Solicitação de Compra
        // if (card.tipo !== 'Solicitação de Compra' && !card.previsao_entrega) {
        //     alert('Por favor, preencha a previsão de entrega.');
        //     return false;
        // }
        
        // Verificar se o número já existe
        const exists = sampleData.some(item => item.numero === card.numero);
        if (exists) {
            alert('Já existe um card com este número. Por favor, use um número diferente.');
            return false;
        }
        
        return true;
    }
    
    showSuccessMessage() {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = 'Card adicionado com sucesso!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    updateNumberPrefix(tipo) {
        const numeroField = document.getElementById('cardNumero');
        const prefixMap = {
            'Pedido': 'PED-',
            'Ordem de Serviço': 'OS-',
            'Ordem de Fabricação': 'OF-',
            'Ordem de Separação': 'O.SEP-',
            'Solicitação de Compra': 'SC-'
        };
        
        const prefix = prefixMap[tipo] || '';
        if (prefix) {
            numeroField.value = prefix;
            numeroField.readOnly = false;
            // Posicionar cursor após o prefixo
            setTimeout(() => {
                numeroField.focus();
                numeroField.setSelectionRange(prefix.length, prefix.length);
            }, 100);
        } else {
            numeroField.value = '';
            numeroField.readOnly = false;
        }
    }
}

// Classe para gerenciar o histórico
class HistoryManager {
    constructor(tvSystem) {
        this.tvSystem = tvSystem;
        this.modal = document.getElementById('historyModalOverlay');
        this.content = document.getElementById('historyContent');
        this.historyBtn = document.getElementById('historyBtn');
        this.closeBtn = document.getElementById('closeHistoryModalBtn');
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.historyBtn.addEventListener('click', () => this.openModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderHistory();
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'hidden'; // Manter overflow hidden para TV
    }
    
    renderHistory() {
        if (hiddenCards.length === 0) {
            this.content.innerHTML = '<div class="empty-history">Nenhum card foi ocultado ainda.</div>';
            return;
        }
        
        this.content.innerHTML = hiddenCards.map(card => {
            const hiddenDate = new Date(card.hiddenDate).toLocaleDateString('pt-BR');
            const formattedOpeningDate = this.tvSystem.formatDate(card.data_abertura);
            const formattedDeliveryDate = card.previsao_entrega ? this.tvSystem.formatDate(card.previsao_entrega) : 'Não definida';
            
            return `
                <div class="history-card">
                    <div class="history-card-info">
                        <div class="history-card-title">${card.tipo} - ${card.numero}</div>
                        <div class="history-card-details">
                            Cliente/Produto: ${card.cliente}<br>
                            Data de Abertura: ${formattedOpeningDate}<br>
                            Previsão de Entrega: ${formattedDeliveryDate}<br>
                            Ocultado em: ${hiddenDate}
                        </div>
                    </div>
                    <button class="restore-btn" onclick="window.historyManager.restoreCard(${card.id})">
                        Reexibir
                    </button>
                </div>
            `;
        }).join('');
    }
    
    restoreCard(cardId) {
        if (confirm('Tem certeza que deseja reexibir este card?')) {
            // Encontrar o card no histórico
            const cardIndex = hiddenCards.findIndex(item => item.id === cardId);
            
            if (cardIndex !== -1) {
                // Remover do histórico e adicionar de volta ao array principal
                const restoredCard = hiddenCards.splice(cardIndex, 1)[0];
                
                // Remover a propriedade hiddenDate antes de adicionar de volta
                delete restoredCard.hiddenDate;
                
                sampleData.push(restoredCard);
                
                // Salvar no localStorage
                saveDataToLocalStorage();
                
                // Reprocessar dados
                this.tvSystem.data = this.tvSystem.processData(sampleData);
                
                // Recalcular paginação
                this.tvSystem.totalPages = Math.ceil(this.tvSystem.data.length / this.tvSystem.cardsPerPage);
                
                // Ir para a última página se necessário
                const lastPage = this.tvSystem.totalPages - 1;
                this.tvSystem.currentPage = lastPage;
                
                // Renderizar cards
                this.tvSystem.renderCards();
                
                // Reiniciar rotação
                this.tvSystem.stopAutoRotation();
                this.tvSystem.startAutoRotation();
                
                // Atualizar histórico
                this.renderHistory();
                
                // Mostrar notificação
                this.showRestoreNotification(restoredCard.numero);
            }
        }
    }
    
    showRestoreNotification(cardNumber) {
        const notification = document.createElement('div');
        notification.className = 'restore-notification';
        notification.textContent = `Card ${cardNumber} foi reexibido com sucesso!`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Adicionar método addCard à classe TVDisplaySystem
TVDisplaySystem.prototype.addCard = function(newCard) {
    // Adicionar ao array de dados
    sampleData.push(newCard);
    
    // Salvar no localStorage
    saveDataToLocalStorage();
    
    // Reprocessar dados com status automático
    this.data = this.processData(sampleData);
    
    // Recalcular paginação
    this.totalPages = Math.ceil(this.data.length / this.cardsPerPage);
    
    // Ir para a última página se necessário
    const lastPage = this.totalPages - 1;
    this.currentPage = lastPage;
    
    // Renderizar cards
    this.renderCards();
    
    // Reiniciar rotação
    this.stopAutoRotation();
    this.startAutoRotation();
};

// Adicionar método hideCard à classe TVDisplaySystem
TVDisplaySystem.prototype.hideCard = function(cardId) {
    if (confirm('Tem certeza que deseja ocultar este card? Ele será movido para o histórico.')) {
        // Encontrar o card no array principal
        const cardIndex = sampleData.findIndex(item => item.id === cardId);
        
        if (cardIndex !== -1) {
            // Remover do array principal e adicionar ao histórico
            const removedCard = sampleData.splice(cardIndex, 1)[0];
            hiddenCards.push({
                ...removedCard,
                hiddenDate: new Date().toISOString()
            });
            
            // Salvar no localStorage
            saveDataToLocalStorage();
            
            // Reprocessar dados
            this.data = this.processData(sampleData);
            
            // Recalcular paginação
            this.totalPages = Math.ceil(this.data.length / this.cardsPerPage);
            
            // Ajustar página atual se necessário
            if (this.currentPage >= this.totalPages && this.totalPages > 0) {
                this.currentPage = this.totalPages - 1;
            }
            
            // Renderizar cards
            this.renderCards();
            
            // Reiniciar rotação
            this.stopAutoRotation();
            this.startAutoRotation();
            
            // Mostrar notificação de sucesso
            this.showHideNotification(removedCard.numero);
        }
    }
};

// Adicionar método editDeliveryDate à classe TVDisplaySystem
TVDisplaySystem.prototype.editDeliveryDate = function(cardId) {
    const card = sampleData.find(item => item.id === cardId);
    if (!card) return;
    
    const currentDate = card.previsao_entrega;
    const currentDateFormatted = currentDate ? this.formatDate(currentDate) : 'Não definida';
    const newDate = prompt(`Editar previsão de entrega para ${card.numero}:\n\nData atual: ${currentDateFormatted}\n\nInsira a nova data (DD-MM-AAAA):`, currentDateFormatted !== 'Não definida' ? currentDateFormatted : '');
    
    if (newDate && newDate !== currentDateFormatted) {
        // Validar formato da data DD-MM-AAAA
        const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
        const match = newDate.match(dateRegex);
        
        if (!match) {
            alert('Formato de data inválido. Use DD-MM-AAAA (ex: 31-12-2025)');
            return;
        }
        
        // Converter DD-MM-AAAA para AAAA-MM-DD
        const [, day, month, year] = match;
        const isoDate = `${year}-${month}-${day}`;
        
        // Validar se a data é válida
        const testDate = new Date(isoDate);
        if (testDate.getFullYear() != year || testDate.getMonth() + 1 != month || testDate.getDate() != day) {
            alert('Data inválida. Verifique se a data existe.');
            return;
        }
        
        // Atualizar a data
        card.previsao_entrega = isoDate;
        
        // Salvar no localStorage
        saveDataToLocalStorage();
        
        // Reprocessar dados para atualizar status
        this.data = this.processData(sampleData);
        
        // Renderizar cards
        this.renderCards();
        
        // Mostrar notificação
        this.showEditNotification(card.numero, this.formatDate(isoDate));
    }
};

// Adicionar método para mostrar notificação de edição
TVDisplaySystem.prototype.showEditNotification = function(cardNumber, newDate) {
    const notification = document.createElement('div');
    notification.className = 'edit-notification';
    notification.textContent = `Previsão de entrega do card ${cardNumber} atualizada para ${newDate}!`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// Adicionar método para mostrar notificação de card oculto
TVDisplaySystem.prototype.showHideNotification = function(cardNumber) {
    const notification = document.createElement('div');
    notification.className = 'hide-notification';
    notification.textContent = `Card ${cardNumber} foi ocultado com sucesso!`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// Modificar a inicialização para incluir o modal e histórico
document.addEventListener("DOMContentLoaded", () => {
    window.tvSystem = new TVDisplaySystem();
    window.modalManager = new ModalManager(window.tvSystem);
    window.historyManager = new HistoryManager(window.tvSystem);
});



    parseDateToISO(dateString) {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString; // Retorna o original se o formato não for DD-MM-AAAA
    }



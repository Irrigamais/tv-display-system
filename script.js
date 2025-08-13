// Dados de exemplo - substitua por dados reais
const sampleData = [
    {
        id: 1,
        tipo: "Pedido",
        numero: "PED-2024-001",
        cliente: "Cliente ABC Ltda",
        previsao_entrega: "2024-01-15"
    },
    {
        id: 2,
        tipo: "Ordem de Serviço",
        numero: "OS-2024-045",
        cliente: "Cliente XYZ Corp",
        previsao_entrega: "2025-08-15"
    },
    {
        id: 3,
        tipo: "Ordem de Fabricação",
        numero: "OF-2024-012",
        cliente: "Produto 123",
        previsao_entrega: "2025-08-14"
    },
    {
        id: 4,
        tipo: "Pedido",
        numero: "PED-2024-002",
        cliente: "Cliente DEF S.A.",
        previsao_entrega: "2025-08-13"
    },
    {
        id: 5,
        tipo: "Ordem de Serviço",
        numero: "OS-2024-046",
        cliente: "Cliente GHI Ltda",
        previsao_entrega: "2024-01-25"
    },
    {
        id: 6,
        tipo: "Ordem de Fabricação",
        numero: "OF-2024-013",
        cliente: "Produto 456",
        previsao_entrega: "2025-08-16"
    },
    {
        id: 7,
        tipo: "Pedido",
        numero: "PED-2024-003",
        cliente: "Cliente JKL Corp",
        previsao_entrega: "2025-08-17"
    },
    {
        id: 8,
        tipo: "Ordem de Serviço",
        numero: "OS-2024-047",
        cliente: "Cliente MNO S.A.",
        previsao_entrega: "2025-08-18"
    },
    {
        id: 9,
        tipo: "Ordem de Fabricação",
        numero: "OF-2024-014",
        cliente: "Produto 789",
        previsao_entrega: "2024-02-05"
    },
    {
        id: 10,
        tipo: "Pedido",
        numero: "PED-2024-004",
        cliente: "Cliente PQR Ltda",
        previsao_entrega: "2025-08-19"
    }
];

class TVDisplaySystem {
    constructor() {
        this.data = this.processData(sampleData);
        this.cardsPerPage = 6; // Padrão: 6 cards por página
        this.currentPage = 0;
        this.totalPages = Math.ceil(this.data.length / this.cardsPerPage);
        this.autoRotateInterval = 8000; // 8 segundos por página
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
        
        const delayText = this.getDelayText(item.dias_atraso, item.status);
        const formattedDate = this.formatDate(item.previsao_entrega);
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-type">${item.tipo}</span>
            </div>
            <div class="card-number">${item.numero}</div>
            <div class="card-body">
                <div class="card-info">
                    <span class="info-label">Cliente/Produto:</span>
                    <span class="info-value">${item.cliente}</span>
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
        return date.toLocaleDateString("pt-BR");
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



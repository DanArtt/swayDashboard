// URL da API Flask
const API = "http://127.0.0.1:5000";

// ==============================
// Produtos
// ==============================
fetch(`${API}/produtos`)
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("produtos-list");
    list.innerHTML = "";
    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.nome} - R$ ${p.preco.toFixed(2)} | Estoque: ${
        p.estoque
      }`;
      list.appendChild(li);
    });
  });

// ==============================
// Usuários
// ==============================
fetch(`${API}/usuarios`)
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("usuarios-list");
    list.innerHTML = "";
    data.forEach((u) => {
      const li = document.createElement("li");
      li.classList.add("usuario-item");

      li.innerHTML = `
        <span class="usuario-nome">${u.nome}</span>
        <span class="usuario-email">${u.email}</span>
        <span class="usuario-tipo">(${u.tipo})</span>
      `;

      list.appendChild(li);
    });
  });

// ==============================
// Vendas - gráfico de linha
// ==============================
fetch(`${API}/vendas`)
  .then((res) => res.json())
  .then((data) => {
    const ctx = document.getElementById("vendasChart");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((v) => v.data),
        datasets: [
          {
            label: "Total de Vendas (R$)",
            data: data.map((v) => v.total),
            borderColor: "blue",
            fill: false,
          },
          {
            label: "Quantidade de Pedidos",
            data: data.map((v) => v.quantidade),
            borderColor: "green",
            fill: false,
          },
        ],
      },
    });
  });

// ==============================
// Backlog
// ==============================
let backlogData = []; // dados atuais
let backlogOriginal = []; // ordem original
let organizado = false; // flag

fetch(`${API}/backlog`)
  .then((res) => res.json())
  .then((data) => {
    backlogData = [...data]; // cópia para renderização
    backlogOriginal = [...data]; // guarda original
    renderBacklog(backlogData);
  });

function renderBacklog(data) {
  const list = document.getElementById("backlog-list");
  list.innerHTML = "";

  data.forEach((b) => {
    const li = document.createElement("li");
    li.classList.add("backlog-item");

    // cor só na palavrinha do status
    let statusColor = "";
    if (b.status === "Concluída") {
      statusColor =
        "background-color: green; color: white; padding: 2px 6px; border-radius: 4px;";
    } else if (b.status === "Em andamento") {
      statusColor =
        "background-color: blue; color: white; padding: 2px 6px; border-radius: 4px;";
    } else if (b.status === "Pendente") {
      statusColor =
        "background-color: gray; color: white; padding: 2px 6px; border-radius: 4px;";
    }

    li.innerHTML = `
      <div class="backlog-content" style="padding: 10px; border-radius: 6px;">
        <span class="tittle-backlog">Tarefa: ${b.titulo}</span><br>
        <span class="status-backlog">Status: 
          <span style="${statusColor}">${b.status}</span>
        </span><br>
        <span class="prioridade-backlog">Prioridade: ${b.prioridade}</span>
      </div>
    `;

    list.appendChild(li);
  });
}

// botão organizar / voltar
document.getElementById("organizar-btn").addEventListener("click", () => {
  if (!organizado) {
    // Criar uma cópia ordenada (sem alterar o original)
    const ordem = { Pendente: 1, "Em andamento": 2, Concluída: 3 };
    const sorted = [...backlogData].sort(
      (a, b) => ordem[a.status] - ordem[b.status]
    );

    renderBacklog(sorted);
    organizado = true;
    document.getElementById("organizar-btn").innerText =
      "Voltar à ordem original";
  } else {
    // Voltar ao original
    renderBacklog(backlogOriginal);
    organizado = false;
    document.getElementById("organizar-btn").innerText = "Organizar";
  }
});

// ==============================
// Riscos
// ==============================
fetch(`${API}/riscos`)
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("riscos-list");
    list.innerHTML = "";
    data.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.descricao} | Probabilidade: ${r.probabilidade} | Impacto: ${r.impacto}`;
      list.appendChild(li);
    });
  });

// ==============================
// KPIs - gráfico de barras
// ==============================
fetch(`${API}/kpis`)
  .then((res) => res.json())
  .then((data) => {
    const ctx = document.getElementById("kpisChart");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((k) => k.nome),
        datasets: [
          {
            label: "KPIs",
            data: data.map((k) => k.valor),
            backgroundColor: "orange",
          },
        ],
      },
    });
  });

// ==============================
// Monitoramento - gráfico de linha (agrupando por dia)
// ==============================
fetch(`${API}/monitoramento`)
  .then((res) => res.json())
  .then((data) => {
    const agrupado = {};

    data.forEach((m) => {
      const d = new Date(m.data_registro);
      const dia = d.toLocaleDateString("pt-BR"); // só dia/mês/ano

      if (!agrupado[dia]) {
        agrupado[dia] = {
          estoque_total: 0,
          vendas_hoje: 0,
          clientes_ativos: 0,
        };
      }

      // soma os valores do mesmo dia
      agrupado[dia].estoque_total += m.estoque_total;
      agrupado[dia].vendas_hoje += m.vendas_hoje;
      agrupado[dia].clientes_ativos += m.clientes_ativos;
    });

    // transforma o objeto em arrays ordenados por data
    const labels = Object.keys(agrupado);
    const estoque = Object.values(agrupado).map((v) => v.estoque_total);
    const vendas = Object.values(agrupado).map((v) => v.vendas_hoje);
    const clientes = Object.values(agrupado).map((v) => v.clientes_ativos);

    const ctx = document.getElementById("monitoramentoChart");
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Estoque Total",
            data: estoque,
            borderColor: "purple",
            fill: false,
          },
          {
            label: "Vendas do Dia",
            data: vendas,
            borderColor: "red",
            fill: false,
          },
          {
            label: "Clientes Ativos",
            data: clientes,
            borderColor: "green",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });
  });

// ==============================
// Relatórios
// ==============================
fetch(`${API}/relatorios`)
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("relatorios-list");
    list.innerHTML = "";
    data.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `[${r.tipo}] ${r.conteudo}`;
      list.appendChild(li);
    });
  });

// ==============================
// Burndown Chart
// ==============================
fetch(`${API}/burndown`)
  .then((res) => res.json())
  .then((data) => {
    const ctx = document.getElementById("burndownChart");

    // Linha ideal (reta)
    const ideal = [];
    const totalTarefas = data.total[0] || 0;
    const dias = data.labels.length - 1;
    for (let i = 0; i < data.labels.length; i++) {
      ideal.push(totalTarefas - (totalTarefas / dias) * i);
    }

    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Ideal",
            data: ideal,
            borderColor: "blue",
            borderDash: [5, 5],
            fill: false,
          },
          {
            label: "Restantes",
            data: data.restantes,
            borderColor: "red",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Burndown Chart" },
        },
      },
    });
  });

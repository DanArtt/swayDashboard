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
fetch(`${API}/backlog`)
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("backlog-list");
    list.innerHTML = "";
    data.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = `${b.titulo} [${b.status}] - Prioridade: ${b.prioridade}`;
      list.appendChild(li);
    });
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

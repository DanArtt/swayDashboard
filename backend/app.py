from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)  # permite que o frontend acesse a API

# Função para conexão com PostgreSQL
def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="swayDashboard",  # seu banco
        user="postgres",             # seu usuário
        password="1234"         # sua senha
    )

@app.route("/")
def home():
    return {"status": "API do E-commerce Smart rodando 🚀"}

# ==============================
# Produtos
# ==============================
@app.route("/produtos")
def produtos():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nome, preco, estoque FROM produtos ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {"id": r[0], "nome": r[1], "preco": float(r[2]), "estoque": r[3]}
        for r in rows
    ])

# ==============================
# Usuários
# ==============================
@app.route("/usuarios")
def usuarios():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nome, email, tipo, data_cadastro FROM usuarios ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "nome": r[1],
            "email": r[2],
            "tipo": r[3],
            "data_cadastro": str(r[4])
        }
        for r in rows
    ])

# ==============================
# Vendas
# ==============================
@app.route("/vendas")
def vendas():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT DATE(data_pedido), COUNT(*), SUM(total)
        FROM pedidos
        GROUP BY DATE(data_pedido)
        ORDER BY DATE(data_pedido)
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {"data": str(r[0]), "quantidade": r[1], "total": float(r[2])}
        for r in rows
    ])

# ==============================
# Backlog
# ==============================
@app.route("/backlog")
def backlog():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, titulo, descricao, prioridade, status, sprint FROM backlog ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "titulo": r[1],
            "descricao": r[2],
            "prioridade": r[3],
            "status": r[4],
            "sprint": r[5]
        }
        for r in rows
    ])

# ==============================
# Riscos
# ==============================
@app.route("/riscos")
def riscos():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, descricao, probabilidade, impacto, status FROM riscos ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "descricao": r[1],
            "probabilidade": r[2],
            "impacto": r[3],
            "status": r[4]
        }
        for r in rows
    ])

# ==============================
# KPIs
# ==============================
@app.route("/kpis")
def kpis():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nome, valor, data_registro FROM kpis ORDER BY data_registro")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "nome": r[1],
            "valor": float(r[2]),
            "data_registro": str(r[3])
        }
        for r in rows
    ])

# ==============================
# Monitoramento da Loja
# ==============================
@app.route("/monitoramento")
def monitoramento():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, data_registro, estoque_total, vendas_hoje, clientes_ativos FROM monitoramento_loja ORDER BY data_registro")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "data_registro": str(r[1]),
            "estoque_total": r[2],
            "vendas_hoje": r[3],
            "clientes_ativos": r[4]
        }
        for r in rows
    ])

# ==============================
# Relatórios
# ==============================
@app.route("/relatorios")
def relatorios():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, tipo, conteudo, data_criacao FROM relatorios ORDER BY data_criacao")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "tipo": r[1],
            "conteudo": r[2],
            "data_criacao": str(r[3])
        }
        for r in rows
    ])

    # ==============================
# Burndown Chart
# ==============================
@app.route("/burndown")
def burndown():
    conn = get_connection()
    cur = conn.cursor()

    # Conta tarefas por dia de sprint (ajuste as datas se precisar)
    cur.execute("""
        SELECT sprint, status, COUNT(*)
        FROM backlog
        GROUP BY sprint, status
        ORDER BY sprint
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Montar dados: total por sprint e concluídas
    sprints = {}
    for r in rows:
        sprint = r[0]
        status = r[1].lower()
        qtd = r[2]

        if sprint not in sprints:
            sprints[sprint] = {"total": 0, "concluidas": 0}

        sprints[sprint]["total"] += qtd
        if status in ["feito", "concluido", "done"]:
            sprints[sprint]["concluidas"] += qtd

    # Converter para lista ordenada
    labels = sorted(sprints.keys())
    total = [sprints[s]["total"] for s in labels]
    concluidas = [sprints[s]["concluidas"] for s in labels]
    restantes = [t - c for t, c in zip(total, concluidas)]

    return jsonify({
        "labels": labels,
        "total": total,
        "concluidas": concluidas,
        "restantes": restantes
    })


# ==============================
# Run
# ==============================
if __name__ == "__main__":
    app.run(debug=True)

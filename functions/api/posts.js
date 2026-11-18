// Senha mestre para permitir salvar e excluir postagens
const SENHA_ADMIN = "Freitas@2026";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM posts ORDER BY id DESC"
    ).all();

    return new Response(JSON.stringify(results || []), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const senhaEnviada = request.headers.get("Authorization");
    if (senhaEnviada !== SENHA_ADMIN) {
      return new Response(JSON.stringify({ erro: "Senha incorreta" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const dados = await request.json();

    // Excluir postagem existente
    if (dados.acao === "excluir" && dados.id) {
      await env.DB.prepare("DELETE FROM posts WHERE id = ?")
        .bind(dados.id)
        .run();
      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Atualizar postagem existente
    if (dados.id) {
      await env.DB.prepare(
        "UPDATE posts SET tipo = ?, titulo = ?, area = ?, data = ?, imagem = ?, resumo = ?, conteudo = ?, link = ?, status = ? WHERE id = ?"
      )
        .bind(
          dados.tipo || "artigo",
          dados.titulo || "",
          dados.area || "",
          dados.data || "",
          dados.imagem || "",
          dados.resumo || "",
          dados.conteudo || "",
          dados.link || "",
          dados.status || "publicado",
          dados.id
        )
        .run();
    } else {
      // Criar nova postagem
      await env.DB.prepare(
        "INSERT INTO posts (tipo, titulo, area, data, imagem, resumo, conteudo, link, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(
          dados.tipo || "artigo",
          dados.titulo || "",
          dados.area || "",
          dados.data || "",
          dados.imagem || "",
          dados.resumo || "",
          dados.conteudo || "",
          dados.link || "",
          dados.status || "publicado"
        )
        .run();
    }

    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

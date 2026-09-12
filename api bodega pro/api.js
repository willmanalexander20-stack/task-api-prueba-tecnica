export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    try {
      // ================= LOGIN =================
      if (path === "/api/login" && request.method === "POST") {
        const { username, password } = await request.json();
        const result = await env.DB.prepare(
          "SELECT id, role, label, avatar FROM users WHERE username = ? AND password_hash = ? AND active = 1"
        ).bind(username, password).first();
        if (result) return json({ success: true, user: result });
        return json({ success: false, error: "Credenciales inválidas" }, 401);
      }

      // ================= PEDIDOS =================
      if (path === "/api/orders" && request.method === "GET") {
        const results = await env.DB.prepare(
          `SELECT o.*, i.name AS product_name, u.label AS driver_name
           FROM orders o
           LEFT JOIN inventory i ON o.product_id = i.id
           LEFT JOIN users u ON o.assigned_to = u.id
           ORDER BY o.id DESC`
        ).all();
        return json(results.results);
      }

      if (path === "/api/orders" && request.method === "POST") {
        const data = await request.json();
        const product = await env.DB.prepare(
          "SELECT stock, hidden FROM inventory WHERE id = ?"
        ).bind(data.product_id).first();
        if (!product || product.hidden === 1 || product.stock < data.qty) {
          return json({ error: "Producto no disponible o stock insuficiente" }, 400);
        }
        await env.DB.batch([
          env.DB.prepare("UPDATE inventory SET stock = stock - ? WHERE id = ?")
            .bind(data.qty, data.product_id),
          env.DB.prepare("UPDATE inventory SET hidden = 1 WHERE id = ? AND stock <= 0")
            .bind(data.product_id),
          env.DB.prepare(
            `INSERT INTO orders (client_code, client_name, address, phone, sector, product_id, qty, total, status, coords_lat, coords_lng)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
          ).bind(
            data.client_code, data.client_name, data.address, data.phone,
            data.sector, data.product_id, data.qty, data.total,
            data.coords_lat, data.coords_lng
          ),
        ]);
        return json({ success: true });
      }

      if (path.startsWith("/api/orders/") && request.method === "PUT") {
        const id = path.split("/")[3];
        const data = await request.json();
        let query = "UPDATE orders SET status = ?";
        const params = [data.status];
        if (data.assigned_to) { query += ", assigned_to = ?"; params.push(data.assigned_to); }
        if (data.collected !== undefined && data.collected !== null) { query += ", collected = ?"; params.push(data.collected); }
        query += " WHERE id = ?";
        params.push(id);
        await env.DB.prepare(query).bind(...params).run();
        return json({ success: true });
      }

      if (path.startsWith("/api/orders/") && request.method === "DELETE") {
        const id = path.split("/")[3];
        await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
        return json({ success: true });
      }

      // ================= INVENTARIO =================
      if (path === "/api/inventory" && request.method === "GET") {
        const results = await env.DB.prepare("SELECT * FROM inventory ORDER BY name").all();
        return json(results.results);
      }

      if (path === "/api/inventory" && request.method === "POST") {
        const data = await request.json();
        const hidden = (data.stock <= 0 || data.hidden === 1) ? 1 : 0;
        await env.DB.prepare(
          "INSERT INTO inventory (name, price, stock, is_water, hidden) VALUES (?, ?, ?, ?, ?)"
        ).bind(data.name, data.price, data.stock, data.is_water ? 1 : 0, hidden).run();
        return json({ success: true });
      }

      if (path.startsWith("/api/inventory/") && request.method === "PUT") {
        const id = path.split("/")[3];
        const data = await request.json();
        const fields = [];
        const params = [];
        if (data.name !== undefined)   { fields.push("name = ?");   params.push(data.name); }
        if (data.price !== undefined)  { fields.push("price = ?");  params.push(data.price); }
        if (data.stock !== undefined)  { fields.push("stock = ?");  params.push(data.stock); }
        if (data.hidden !== undefined) { fields.push("hidden = ?"); params.push(data.hidden); }
        if (fields.length) {
          params.push(id);
          await env.DB.prepare(`UPDATE inventory SET ${fields.join(", ")} WHERE id = ?`)
            .bind(...params).run();
          await env.DB.prepare("UPDATE inventory SET hidden = 1 WHERE id = ? AND stock <= 0")
            .bind(id).run();
        }
        return json({ success: true });
      }

      // ================= CONTEO DE AGUA =================
      if (path === "/api/water-counts" && request.method === "POST") {
        const data = await request.json();
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO water_counts (canastas, cajas, sueltas, per_canasta, total, by_user_id) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(data.canastas, data.cajas, data.sueltas, data.per_canasta, data.total, data.user_id),
          env.DB.prepare("UPDATE inventory SET stock = ? WHERE is_water = 1").bind(data.total),
          env.DB.prepare("UPDATE inventory SET hidden = 0 WHERE is_water = 1 AND ? > 0").bind(data.total),
        ]);
        return json({ success: true });
      }

      if (path === "/api/water-counts" && request.method === "GET") {
        const results = await env.DB.prepare(
          `SELECT w.*, u.label AS by_label
           FROM water_counts w
           LEFT JOIN users u ON w.by_user_id = u.id
           ORDER BY w.id DESC`
        ).all();
        return json(results.results);
      }

      // ================= CLIENTES =================
      if (path === "/api/customers" && request.method === "GET") {
        const results = await env.DB.prepare("SELECT * FROM customers ORDER BY code").all();
        return json(results.results);
      }

      if (path === "/api/customers" && request.method === "POST") {
        const data = await request.json();
        try {
          await env.DB.prepare(
            "INSERT INTO customers (code, name, address, phone, sector, owner) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(data.code, data.name, data.address, data.phone, data.sector, data.owner || '').run();
          return json({ success: true });
        } catch (e) {
          return json({ error: "El código de cliente ya existe" }, 400);
        }
      }

      // ================= USUARIOS =================
      if (path === "/api/users" && request.method === "GET") {
        const results = await env.DB.prepare(
          "SELECT id, username, role, label, active, avatar FROM users ORDER BY id"
        ).all();
        return json(results.results);
      }

      if (path === "/api/users" && request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO users (username, password_hash, role, label, avatar, active) VALUES (?, ?, ?, ?, ?, 1)"
        ).bind(data.username, data.password, data.role, data.label, data.avatar).run();
        return json({ success: true });
      }

      if (path.startsWith("/api/users/") && request.method === "PUT") {
        const id = path.split("/")[3];
        const data = await request.json();
        const fields = [];
        const params = [];
        if (data.username !== undefined) { fields.push("username = ?"); params.push(data.username); }
        if (data.password !== undefined) { fields.push("password_hash = ?"); params.push(data.password); }
        if (data.role !== undefined) { fields.push("role = ?"); params.push(data.role); }
        if (data.active !== undefined) { fields.push("active = ?"); params.push(data.active); }
        if (fields.length) {
          params.push(id);
          await env.DB.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).bind(...params).run();
        }
        return json({ success: true });
      }

      // ================= ZONAS / SECTORES =================
if (path === "/api/sectors" && request.method === "GET") {
const results = await env.DB.prepare("SELECT * FROM sectors ORDER BY name").all();
return json(results.results);
}
if (path === "/api/sectors" && request.method === "POST") {
const data = await request.json();
try {
await env.DB.prepare("INSERT INTO sectors (name, lat, lng) VALUES (?, ?, ?)")
.bind(data.name, data.lat || 4.6350, data.lng || -74.1350).run();
return json({ success: true });
} catch (e) {
return json({ error: "Esa zona ya existe" }, 400);
}
}
if (path.startsWith("/api/sectors/") && request.method === "DELETE") {
const id = path.split("/")[3];
await env.DB.prepare("DELETE FROM sectors WHERE id = ?").bind(id).run();
return json({ success: true });
}
// ================= REINICIO SEMANAL =================
if (path === "/api/orders" && request.method === "DELETE") {
await env.DB.prepare("DELETE FROM orders").run();
return json({ success: true });
}
if (path === "/api/water-counts" && request.method === "DELETE") {
await env.DB.prepare("DELETE FROM water_counts").run();
return json({ success: true });
}
// ================= CATÁLOGO PÚBLICO =================
if (path === "/api/catalog/products" && request.method === "GET") {
const results = await env.DB.prepare(
"SELECT id, name, price, stock FROM inventory WHERE hidden = 0 AND stock > 0 ORDER BY name"
).all();
return json(results.results);
}
// REGISTRO → ahora crea el cliente en la tabla customers (aparece en Clientes)
if (path === "/api/catalog/register" && request.method === "POST") {
const data = await request.json();
const exists = await env.DB.prepare("SELECT id FROM customers WHERE email = ? AND email != ''").bind(data.email || '').first();
if (exists) return json({ error: "El email ya está registrado" }, 400);
const last = await env.DB.prepare("SELECT code FROM customers ORDER BY id DESC LIMIT 1").first();
let nextNum = 0;
if (last && last.code) { const m = parseInt(String(last.code).replace(/\D/g, '')); if (!isNaN(m)) nextNum = m; }
const code = `CLI-${String(nextNum + 1).padStart(3, '0')}`;
await env.DB.prepare(
"INSERT INTO customers (code, name, address, phone, sector, owner, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
).bind(code, data.name, data.address, data.phone, data.sector || '', data.name, data.email || '', data.password || '').run();
return json({ success: true, message: "Registro exitoso", code });
}
// LOGIN del cliente del catálogo
if (path === "/api/catalog/login" && request.method === "POST") {
const { email, password } = await request.json();
const result = await env.DB.prepare(
"SELECT id, code, name, phone, address, sector, email FROM customers WHERE email = ? AND password_hash = ? AND email != ''"
).bind(email, password).first();
if (result) return json({ success: true, customer: result });
return json({ success: false, error: "Credenciales inválidas" }, 401);
}
// PEDIDO → ahora se crea en la tabla orders (lo ve el repartidor) y descuenta stock
if (path === "/api/catalog/order" && request.method === "POST") {
const data = await request.json();
let client = { code: data.client_code || '', name: data.customer_name || '', address: data.customer_address || '', phone: data.customer_phone || '', sector: data.sector || '' };
if (data.customer_id) {
const c = await env.DB.prepare("SELECT code, name, address, phone, sector FROM customers WHERE id = ?").bind(data.customer_id).first();
if (c) client = c;
}
const items = data.items || [];
if (items.length === 0) return json({ error: "Carrito vacío" }, 400);
const stmts = [];
for (const it of items) {
stmts.push(env.DB.prepare("UPDATE inventory SET stock = stock - ? WHERE id = ?").bind(it.qty || 1, it.id));
stmts.push(env.DB.prepare("UPDATE inventory SET hidden = 1 WHERE id = ? AND stock <= 0").bind(it.id));
stmts.push(env.DB.prepare(
"INSERT INTO orders (client_code, client_name, address, phone, sector, product_id, qty, total, status, coords_lat, coords_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)"
).bind(client.code, client.name, client.address, client.phone, client.sector, it.id, it.qty || 1, (it.price || 0) * (it.qty || 1), data.coords_lat || 4.6350, data.coords_lng || -74.1350));
}
await env.DB.batch(stmts);
return json({ success: true, message: "Pedido creado" });
}
if (path === "/api/catalog/orders" && request.method === "GET") {
const customer_id = url.searchParams.get("customer_id");
let query = "SELECT * FROM orders";
const params = [];
if (customer_id) { query += " WHERE client_code = (SELECT code FROM customers WHERE id = ?)"; params.push(customer_id); }
query += " ORDER BY id DESC";
const results = await env.DB.prepare(query).bind(...params).all();
return json(results.results);
}
return json({ message: "Bodega API Running ✅" });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
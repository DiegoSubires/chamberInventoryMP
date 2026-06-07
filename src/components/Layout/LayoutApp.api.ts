// src/components/Layout/Layout.api.ts
export const fetchLayoutData = async (tenantId: string, operatorId: string) => {
  const tenantUrl = `http://localhost:4000/api/tenant-config/${tenantId}`;
  const operatorUrl = `http://localhost:4000/api/operator/${encodeURIComponent(operatorId)}`;

  console.log("🔍 Intentando fetch a:", tenantUrl);
  console.log("🔍 Intentando fetch a:", operatorUrl);

  try {
    const [configRes, opRes] = await Promise.all([
      fetch(tenantUrl),
      fetch(operatorUrl),
    ]);

    console.log("📊 Estado respuesta Tenant:", configRes.status);
    console.log("📊 Estado respuesta Operador:", opRes.status);

    if (!configRes.ok) {
      const errorText = await configRes.text();
      console.error("❌ Error en respuesta Tenant:", errorText);
    }

    const config = configRes.ok ? await configRes.json() : null;
    const operator = opRes.ok
      ? await opRes.json()
      : { fullName: "Invitado", avatarUrl: "" };

    if (!config)
      throw new Error("No se pudo cargar la configuración del tenant");

    return { config, operator };
  } catch (err) {
    console.error("❌ Fallo en la carga del Layout:", err);
    throw err;
  }
};
